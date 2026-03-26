(async function(){
  try {
    // Determine the correct path based on current location
    const currentPath = window.location.pathname;
    let dataPath = 'data/news-data.json'; // default from root
    if (currentPath.includes('/pages/')) {
      dataPath = '../data/news-data.json';
    } else if (currentPath.includes('/news/')) {
      dataPath = '../../data/news-data.json';
    }
    const res = await fetch(dataPath);
    if(!res.ok) throw new Error('Failed to load news-data.json');
    const items = await res.json();

    // Render more-news grid with category filtering
    const grid = document.querySelector('.more-news-grid');
    const categoryFilter = document.querySelector('#news-category');
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');

    // Helper function to fix image paths based on current location
    function getImagePath(imagePath) {
      // If it's an external URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // If it's already a relative path from assets, adjust based on current location
      if (imagePath.startsWith('assets/')) {
        if (currentPath.includes('/pages/')) {
          return '../' + imagePath;
        } else if (currentPath.includes('/news/')) {
          return '../../' + imagePath;
        }
      }
      return imagePath;
    }

    // Helper function to fix slug paths
    function getSlugPath(slug) {
      if (currentPath.includes('/pages/')) {
        return '../' + slug;
      }
      return slug;
    }

    function renderNews(category = 'all') {
      if(grid){
        grid.innerHTML = '';
        const filteredItems = category === 'all' ? items : items.filter(item => item.category === category);
        filteredItems.forEach(it => {
          const card = document.createElement('article');
          card.className = 'news-card';
          card.innerHTML = `
            <div class="thumb"><img src="${getImagePath(it.image)}" alt="${escapeHtml(it.title)}" loading="lazy"></div>
            <div class="news-meta">
              <div class="news-date">${new Date(it.date).toLocaleDateString(undefined,{ year:'numeric', month:'long', day:'numeric'})}</div>
              <h4>${escapeHtml(it.title)}</h4>
              <p>${escapeHtml(it.excerpt)}</p>
              <a class="read-more" href="${getSlugPath(it.slug)}">Read More</a>
            </div>
          `;
          grid.appendChild(card);
        });
      }
    }

    // Initial render
    renderNews();

    // Category filter event
    if(categoryFilter){
      categoryFilter.addEventListener('change', () => {
        renderNews(categoryFilter.value);
        sidebarLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-links a[data-category="${categoryFilter.value}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      });
    }

    // Sidebar category links
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        renderNews(category);
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if(categoryFilter) categoryFilter.value = category;
      });
    });

    // Render sidebar mini-news
    const mini = document.querySelector('.mini-news');
    if(mini){
      mini.innerHTML = '';
      const last = items.slice(0,5);
      last.forEach(it => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${getImagePath(it.image)}" alt="${escapeHtml(it.title)}" loading="lazy"><div><div class="mini-date">${new Date(it.date).toLocaleDateString(undefined,{ day:'numeric', month:'long', year:'numeric' })}</div><a href="${getSlugPath(it.slug)}">${escapeHtml(it.title)}</a></div>`;
        mini.appendChild(li);
      });
    }

    // Populate index.html news list (top 3)
    const indexNewsList = document.querySelector('.col-news .news-list');
    if(indexNewsList && items.length >= 3){
      indexNewsList.innerHTML = '';
      items.slice(0,3).forEach(it => {
        const article = document.createElement('article');
        article.className = 'news-list-item';
        article.innerHTML = `
          <img src="${getImagePath(it.image)}" alt="${escapeHtml(it.title)}" loading="lazy">
          <div class="news-list-content">
            <div class="news-list-date">${new Date(it.date).toLocaleDateString(undefined, { month:'long', year:'numeric' })}</div>
            <h4><a href="${getSlugPath(it.slug)}">${escapeHtml(it.title)}</a></h4>
            <p>${escapeHtml(it.excerpt)}</p>
          </div>
        `;
        indexNewsList.appendChild(article);
      });
      indexNewsList.insertAdjacentHTML(
        'beforeend',
        `<a href="${getSlugPath('pages/news.html')}" class="read-more" aria-label="Read more news">Read More &gt;&gt;</a>`,
      );
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
