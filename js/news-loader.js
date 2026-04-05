(async function () {
  if (!window.NewsService) {
    console.error("News loader error: NewsService is unavailable.");
    return;
  }

  const {
    buildArticleHref,
    escapeHtml,
    formatCategoryLabel,
    formatDate,
    getArticleFromQuery,
    getCategories,
    getRelativePath,
    loadNews,
  } = window.NewsService;

  renderNewsStatus("loading");

  try {
    const items = await loadNews();
    renderHomepageNews(items);
    renderNewsLandingPage(items);
    renderArticlePage(items);
  } catch (error) {
    console.error("News loader error", error);
    renderNewsStatus("error");
  }

  function renderNewsStatus(status) {
    const blockHtml =
      status === "loading"
        ? `
          <div class="news-fetch-state" role="status" aria-live="polite">
            <span class="news-loading-spinner" aria-hidden="true"></span>
            <span>Loading news...</span>
          </div>
        `
        : `
          <div class="news-fetch-state news-fetch-error" role="alert">
            <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
            <span>Error in fetching news.</span>
          </div>
        `;

    const selectors = [
      "[data-news-home-featured]",
      "[data-news-home-list]",
      "[data-news-featured]",
      "[data-news-grid]",
      ".mini-news",
      "[data-news-article-page]",
      "[data-news-categories]",
      "[data-news-sources]",
    ];

    selectors.forEach((selector) => {
      const node = document.querySelector(selector);
      if (!node) return;
      if (node.matches("ul")) {
        node.innerHTML = `<li class="news-status-list-item">${blockHtml}</li>`;
      } else {
        node.innerHTML = blockHtml;
      }
    });
  }

  function renderHomepageNews(items) {
    const featuredRoot = document.querySelector("[data-news-home-featured]");
    const listRoot = document.querySelector("[data-news-home-list]");
    if (!featuredRoot || !listRoot || !items.length) return;

    const featured = items.find((item) => item.featured) || items[0];
    const secondaryItems = items.filter((item) => item.id !== featured.id).slice(0, 2);

    featuredRoot.innerHTML = `
      <a class="news-home-featured-card" href="${buildArticleHref(featured)}">
        <div class="news-home-featured-media">
          <img src="${featured.image}" alt="${escapeHtml(featured.imageAlt)}" loading="lazy" />
        </div>
        <div class="news-home-featured-body">
          <span class="news-kicker">${escapeHtml(formatCategoryLabel(featured.category))}</span>
          <div class="news-list-date">${escapeHtml(
            formatDate(featured.date, { day: "numeric", month: "short", year: "numeric" }),
          )}</div>
          <h4>${escapeHtml(featured.title)}</h4>
          <p>${escapeHtml(featured.excerpt)}</p>
          <span class="read-more">Read story <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>
    `;

    listRoot.innerHTML = secondaryItems
      .map((item) => {
        return `
          <article class="news-list-item" role="listitem">
            <a class="news-list-link" href="${buildArticleHref(item)}">
              <div class="news-list-date">${escapeHtml(
                formatDate(item.date, { month: "long", year: "numeric" }),
              )}</div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.excerpt)}</p>
            </a>
          </article>
        `;
      })
      .join("");
  }

  function renderNewsLandingPage(items) {
    const featuredRoot = document.querySelector("[data-news-featured]");
    const gridRoot = document.querySelector("[data-news-grid]");
    const miniNewsRoot = document.querySelector(".mini-news");
    const categorySelect = document.querySelector("#news-category");
    const categoryLinksRoot = document.querySelector("[data-news-categories]");
    const sourceLinksRoot = document.querySelector("[data-news-sources]");
    if (!featuredRoot && !gridRoot && !miniNewsRoot) return;

    const featured = items.find((item) => item.featured) || items[0];
    const categories = getCategories(items);
    let activeCategory = "all";

    if (featuredRoot && featured) {
      featuredRoot.innerHTML = renderFeaturedCard(featured);
    }

    if (categorySelect) {
      categorySelect.innerHTML = [
        '<option value="all">All Categories</option>',
        ...categories.map((category) => {
          return `<option value="${escapeHtml(category.value)}">${escapeHtml(category.label)}</option>`;
        }),
      ].join("");
    }

    if (categoryLinksRoot) {
      categoryLinksRoot.innerHTML = `
        <li><a href="#" data-category="all" class="active">All</a></li>
        ${categories
          .map((category) => {
            return `<li><a href="#" data-category="${escapeHtml(category.value)}">${escapeHtml(
              category.label,
            )} <span>(${category.count})</span></a></li>`;
          })
          .join("")}
      `;
    }

    if (miniNewsRoot) {
      miniNewsRoot.innerHTML = items
        .slice(0, 5)
        .map((item) => {
          return `
            <li>
              <img src="${item.image}" alt="${escapeHtml(item.imageAlt)}" loading="lazy" />
              <div>
                <div class="mini-date">${escapeHtml(
                  formatDate(item.date, { day: "numeric", month: "short", year: "numeric" }),
                )}</div>
                <a href="${buildArticleHref(item)}">${escapeHtml(item.title)}</a>
              </div>
            </li>
          `;
        })
        .join("");
    }

    if (sourceLinksRoot) {
      const sourceItems = items.filter((item) => item.sourceUrl).slice(0, 4);
      sourceLinksRoot.innerHTML = sourceItems.length
        ? sourceItems
            .map((item) => {
              return `
                <li>
                  <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">
                    ${escapeHtml(item.sourceLabel || item.title)}
                  </a>
                </li>
              `;
            })
            .join("")
        : '<li class="sidebar-note">External source links can be attached per article in the news schema.</li>';
    }

    function renderGrid(category) {
      if (!gridRoot) return;

      const filtered = items
        .filter((item) => item.id !== featured?.id)
        .filter((item) => (category === "all" ? true : item.category === category));

      if (!filtered.length) {
        gridRoot.innerHTML = '<div class="news-empty-state">No articles found in this category yet.</div>';
        return;
      }

      gridRoot.innerHTML = filtered
        .map((item) => {
          return `
            <article class="news-card" role="listitem">
              <a class="news-card-link" href="${buildArticleHref(item)}">
                <div class="thumb">
                  <img src="${item.image}" alt="${escapeHtml(item.imageAlt)}" loading="lazy" />
                </div>
                <div class="news-meta">
                  <span class="news-kicker">${escapeHtml(formatCategoryLabel(item.category))}</span>
                  <div class="news-date">${escapeHtml(
                    formatDate(item.date, { year: "numeric", month: "long", day: "numeric" }),
                  )}</div>
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.excerpt)}</p>
                  <span class="read-more">Read More</span>
                </div>
              </a>
            </article>
          `;
        })
        .join("");
    }

    renderGrid(activeCategory);

    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        activeCategory = categorySelect.value;
        syncCategoryLinks(activeCategory);
        renderGrid(activeCategory);
      });
    }

    if (categoryLinksRoot) {
      categoryLinksRoot.querySelectorAll("a[data-category]").forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          activeCategory = link.dataset.category || "all";
          if (categorySelect) categorySelect.value = activeCategory;
          syncCategoryLinks(activeCategory);
          renderGrid(activeCategory);
        });
      });
    }

    function syncCategoryLinks(category) {
      if (!categoryLinksRoot) return;
      categoryLinksRoot.querySelectorAll("a[data-category]").forEach((link) => {
        link.classList.toggle("active", link.dataset.category === category);
      });
    }
  }

  function renderArticlePage(items) {
    const root = document.querySelector("[data-news-article-page]");
    if (!root) return;

    const article = getArticleFromQuery(items);
    const titleElement = document.querySelector("title");

    if (!article) {
      root.innerHTML = `
        <article class="news-article news-article-empty">
          <div class="news-kicker">News Archive</div>
          <h1>Article not found</h1>
          <p class="lead">The requested article could not be located in the active news feed.</p>
          <p><a class="back-to-news" href="${getRelativePath("pages/news.html")}">Back to News</a></p>
        </article>
      `;
      return;
    }

    if (titleElement) titleElement.textContent = article.title + " | Transportation Systems Engineering";

    root.innerHTML = `
      <article class="news-article">
        <div class="news-article-head">
          <span class="news-kicker">${escapeHtml(formatCategoryLabel(article.category))}</span>
          <div class="news-date">${escapeHtml(
            formatDate(article.date, { year: "numeric", month: "long", day: "numeric" }),
          )}</div>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="lead">${escapeHtml(article.excerpt)}</p>
        </div>
        <div class="featured-media">
          <img src="${article.image}" alt="${escapeHtml(article.imageAlt)}" loading="lazy" />
        </div>
        <div class="article-content">${article.contentHtml}</div>
        ${
          article.sourceUrl
            ? `<p class="article-source"><a class="back-to-news" href="${escapeHtml(
                article.sourceUrl,
              )}" target="_blank" rel="noopener">${escapeHtml(
                article.sourceLabel || "View original source",
              )}</a></p>`
            : ""
        }
        <p><a class="back-to-news" href="${getRelativePath("pages/news.html")}">Back to News</a></p>
      </article>
    `;
  }

  function renderFeaturedCard(item) {
    return `
      <div class="featured-media">
        <img src="${item.image}" alt="${escapeHtml(item.imageAlt)}" loading="lazy" />
        <div class="featured-overlay">
          <span class="featured-label">${escapeHtml(formatCategoryLabel(item.category))}</span>
        </div>
      </div>
      <div class="featured-body">
        <div class="news-date">${escapeHtml(
          formatDate(item.date, { year: "numeric", month: "long", day: "numeric" }),
        )}</div>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="lead">${escapeHtml(item.excerpt)}</p>
        <a class="read-more" href="${buildArticleHref(item)}"><i class="fas fa-chevron-right"></i> Read Full Story</a>
      </div>
    `;
  }
})();
