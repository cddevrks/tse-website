const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');
const dataPath = path.join(siteRoot, 'data', 'news-data.json');
const templatePath = path.join(siteRoot, 'templates', 'news-page.html');

function loadTemplate() {
  // Very small template; you can expand the head/footer by reading existing files
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{title}} | Transportation Systems Engineering</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="logo">
          <img src="assets/iitb-logo.png" alt="IIT Bombay Logo" class="iitb-logo" style="height: 56px; vertical-align: middle; margin-right: 10px;">
          <span>Transportation Systems Engineering</span>
        </a>
        <ul class="nav-menu">
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="faculty-current.html" class="nav-link">Faculty</a></li>
          <li><a href="events.html" class="nav-link">Events</a></li>
          <li><a href="research.html" class="nav-link">Research</a></li>
          <li><a href="news.html" class="nav-link active">News</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="section">
    <div class="container">
      <article class="news-article">
        <div class="article-meta">{{date}}</div>
        <h1>{{title}}</h1>
        <img src="{{image}}" alt="{{title}}">
        <div class="article-content">{{content}}</div>
        <p><a href="news.html">Back to news</a></p>
      </article>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">&copy; 2026 Transportation Systems Engineering, IIT Bombay.</div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;
}

function generate() {
  if(!fs.existsSync(dataPath)){
    console.error('news-data.json not found at', dataPath);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let tpl = loadTemplate();
  if(fs.existsSync(templatePath)){
    tpl = fs.readFileSync(templatePath, 'utf8');
  }

  items.forEach(it => {
    // support both file slugs and directory slugs
    let outName = it.slug || (it.id + '.html');
    let outPath;
    if(outName.endsWith('/') || outName.match(/news\/.*\/$/)){
      // write to index.html inside the folder
      const folder = path.join(siteRoot, outName);
      fs.mkdirSync(folder, { recursive: true });
      outPath = path.join(folder, 'index.html');
    } else if(outName.endsWith('.html') && outName.includes('/')){
      // slug like news/foo.html -> write file directly
      const folder = path.dirname(path.join(siteRoot, outName));
      fs.mkdirSync(folder, { recursive: true });
      outPath = path.join(siteRoot, outName);
    } else if(outName.endsWith('.html')){
      outPath = path.join(siteRoot, outName);
    } else {
      // fallback: create folder and write index.html
      const folder = path.join(siteRoot, outName);
      fs.mkdirSync(folder, { recursive: true });
      outPath = path.join(folder, 'index.html');
    }
    // Build the article body to inject into the template
    const articleHtml = `
      <article class="news-article">
        <div class="news-date">${new Date(it.date).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' })}</div>
        <h1>${escapeHtml(it.title)}</h1>
        ${it.image ? `<div class="featured-media"><img src="${escapeAttr(it.image)}" alt="${escapeHtml(it.title)}"></div>` : ''}
        <div class="article-content">${it.content || ''}</div>
        <p><a href="news.html">Back to news</a></p>
      </article>
    `;

    let html = tpl.replace('<!-- ARTICLE_BODY -->', articleHtml);
    html = html.replace(/{{TITLE}}/g, escapeHtml(it.title));

    fs.writeFileSync(outPath, html, 'utf8');
    console.log('Wrote', outPath);
  });
}

function escapeHtml(s){
  if(!s) return s;
  return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}
function escapeAttr(s){
  if(!s) return s;
  return s.replace(/"/g,'&quot;');
}

generate();
