const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');
const dataPath = path.join(siteRoot, 'data', 'news-data.json');

function runGenerator(){
  console.log('Running generator...');
  const p = spawn('node', ['scripts/generate-news.js'], { stdio: 'inherit', cwd: siteRoot });
  p.on('close', code => console.log('Generator exited with', code));
}

// initial run
runGenerator();

fs.watchFile(dataPath, { interval: 500 }, (curr, prev) => {
  if(curr.mtimeMs !== prev.mtimeMs){
    console.log('news-data.json changed, regenerating...');
    runGenerator();
  }
});

console.log('Watching news-data.json for changes... (Ctrl+C to exit)');
