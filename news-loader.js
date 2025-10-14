// news-loader.js — loads news-data.json and hydrates the news listing on news.html
(async function(){
  try {
    const res = await fetch('news-data.json');
    if(!res.ok) throw new Error('Failed to load news-data.json');
    const items = await res.json();

    // Render featured (first item)
    const featured = items[0];
    if(featured){
      const featuredImg = document.querySelector('.news-featured .featured-media img');
      const featuredDate = document.querySelector('.news-featured .news-date');
      const featuredTitle = document.querySelector('.news-featured h2');
      const featuredLead = document.querySelector('.news-featured .lead');
      const featuredLink = document.querySelector('.news-featured .read-more');
      if(featuredImg) featuredImg.src = featured.image;
      if(featuredDate) featuredDate.textContent = new Date(featured.date).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
      if(featuredTitle) featuredTitle.textContent = featured.title;
      if(featuredLead) featuredLead.textContent = featured.excerpt;
      if(featuredLink) featuredLink.href = featured.slug;
    }

    // Render more-news grid
    const grid = document.querySelector('.more-news-grid');
    if(grid && items.length>1){
      grid.innerHTML = '';
      for(let i=1;i<items.length;i++){
        const it = items[i];
        const card = document.createElement('article');
        card.className = 'news-card';
        card.innerHTML = `
          <div class="thumb"><img src="${it.image}" alt="${escapeHtml(it.title)}"></div>
          <div class="news-meta">
            <div class="news-date">${new Date(it.date).toLocaleDateString(undefined,{ year:'numeric', month:'short', day:'numeric'})}</div>
            <h4>${escapeHtml(it.title)}</h4>
            <p>${escapeHtml(it.excerpt)}</p>
            <a class="read-more" href="${it.slug}">Read More</a>
          </div>
        `;
        grid.appendChild(card);
      }
    }

    // Render sidebar mini-news
    const mini = document.querySelector('.mini-news');
    if(mini){
      mini.innerHTML = '';
      const last = items.slice(0,5);
      last.forEach(it=>{
        const li = document.createElement('li');
        li.innerHTML = `<img src="${it.image}" alt="${escapeHtml(it.title)}"><div><div class="mini-date">${new Date(it.date).toLocaleDateString(undefined,{ day:'numeric', month:'short', year:'numeric' })}</div><a href="${it.slug}">${escapeHtml(it.title)}</a></div>`;
        mini.appendChild(li);
      });
    }

  } catch (e) {
    console.error('News loader error', e);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
    });
  }
})();
