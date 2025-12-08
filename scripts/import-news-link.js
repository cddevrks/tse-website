#!/usr/bin/env node
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const siteRoot = path.resolve(__dirname, '..');
const dataPath = path.join(siteRoot, 'data', 'news-data.json');
const templatePath = path.join(siteRoot, 'templates', 'news-page.html');

function usage(){
  console.log(`Usage: node scripts/import-news-link.js --url <url> [--title "Title"] [--excerpt "Short excerpt"] [--image <image-url>] [--date YYYY-MM-DD] [--category events|research|announcements|student-news] [--no-generate]

Example:
  node scripts/import-news-link.js --url "https://www.linkedin.com/..." --title "Workshop at CTRG-2025" --image "assets/ctrg-2025.jpg" --category events

Notes:
 - Script will try to fetch Open Graph metadata from the URL. Many sites (LinkedIn) require login and may not expose OG tags; in that case supply --title/--excerpt/--image manually.
 - The script inserts a new item at the top of news-data.json and by default runs the generator (npm run gen:news). Use --no-generate to only update the JSON without running the generator.
`);
}

// very small argv parser
function parseArgs(argv){
  const args = {};
  let i=0;
  while(i<argv.length){
    const a = argv[i];
    if(a === '--url'){ args.url = argv[i+1]; i+=2; }
    else if(a === '--title'){ args.title = argv[i+1]; i+=2; }
    else if(a === '--excerpt'){ args.excerpt = argv[i+1]; i+=2; }
    else if(a === '--image'){ args.image = argv[i+1]; i+=2; }
    else if(a === '--date'){ args.date = argv[i+1]; i+=2; }
    else if(a === '--category'){ args.category = argv[i+1]; i+=2; }
    else if(a === '--slug'){ args.slug = argv[i+1]; i+=2; }
    else if(a === '--no-generate' || a === '--no-gen'){ args['no-generate'] = true; i+=1; }
    else if(a === '--help' || a === '-h'){ args.help = true; i+=1; }
    else { i++; }
  }
  return args;
}

function fetchUrl(url){
  return new Promise((resolve,reject)=>{
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'node.js' } }, res => {
      let body = '';
      res.on('data', d => body += d.toString());
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

function extractMeta(html){
  if(!html) return {};
  const meta = {};
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const twImage = html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  if(ogTitle) meta.title = decodeHtmlEntities(ogTitle[1]);
  if(ogDesc) meta.description = decodeHtmlEntities(ogDesc[1]);
  if(ogImage) meta.image = ogImage[1];
  else if(twImage) meta.image = twImage[1];
  return meta;
}

function decodeHtmlEntities(str){
  return str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}

function slugify(s){
  return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function readData(){
  if(!fs.existsSync(dataPath)) return [];
  try{ return JSON.parse(fs.readFileSync(dataPath,'utf8')); }catch(e){ console.error('Failed to read news-data.json:', e); process.exit(1); }
}

function writeData(items){
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2)+"\n", 'utf8');
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  if(!args.url){ usage(); process.exit(1); }

  console.log('Fetching', args.url);
  let meta = {};
  try{
    const res = await fetchUrl(args.url);
    if(res.status >= 200 && res.status < 400){
      meta = extractMeta(res.body);
    } else {
      console.warn('Fetch returned status', res.status);
    }
  }catch(e){
    console.warn('Failed to fetch URL:', e.message);
  }

  const title = args.title || meta.title || 'Linked content';
  const excerpt = args.excerpt || meta.description || '';
  const image = args.image || meta.image || '';
  const date = args.date || new Date().toISOString().slice(0,10);
  const category = args.category || 'events';
  let slug = args.slug || ('news/' + slugify(title) + '/');

  // ensure unique slug
  const items = readData();
  let baseSlug = slug;
  let counter = 1;
  while(items.find(it => it.slug === slug)){
    slug = baseSlug.replace(/\/$/, '') + '-' + counter + '/';
    counter++;
  }

  const id = slugify(slug.replace(/\/$/,'').replace(/^news\//,''));

  const newItem = {
    id,
    title,
    date,
    excerpt,
    image,
    slug,
    category,
    content: `<p>Imported from <a href="${args.url}" target="_blank" rel="noopener">original post</a>.</p>`
  };

  // prepend to array
  items.unshift(newItem);
  writeData(items);
  console.log('Added news item with slug', slug);

  // optionally run generator unless user requested no-generate
  if(!args['no-generate'] && !args['no-gen']){
    console.log('Running generator...');
    const r = spawnSync('node', ['scripts/generate-news.js'], { cwd: siteRoot, stdio: 'inherit' });
    if(r.status !== 0) console.error('Generator failed with status', r.status);
    else console.log('Generation complete.');
  } else {
    console.log('Skipped generation (--no-generate).');
  }
}

main();
