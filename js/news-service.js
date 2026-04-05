(function () {
  const SHEET_PLACEHOLDER = "YOUR_SHEET_ID";
  const DEFAULT_CATEGORY = "announcements";

  function getPathMode() {
    const currentPath = window.location.pathname;
    if (currentPath.includes("/pages/")) return "pages";
    return "root";
  }

  function getRelativePath(pathFromRoot) {
    const mode = getPathMode();
    if (mode === "pages") return "../" + pathFromRoot;
    return pathFromRoot;
  }

  function isExternalUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  function getConfiguredSheetUrl() {
    const bodyUrl = document.body?.dataset?.newsSheetUrl || "";
    const globalUrl = window.NEWS_CONFIG?.googleSheetCsvUrl || "";
    const url = bodyUrl || globalUrl;
    if (!url || url.includes(SHEET_PLACEHOLDER)) return "";
    return normalizeSheetUrl(url);
  }

  function normalizeSheetUrl(url) {
    const match = String(url).match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match) return url;

    let gid = "0";
    try {
      const parsedUrl = new URL(url);
      gid = parsedUrl.searchParams.get("gid") || parsedUrl.hash.match(/gid=(\d+)/)?.[1] || "0";
    } catch (error) {
      const gidMatch = String(url).match(/gid=(\d+)/);
      gid = gidMatch ? gidMatch[1] : "0";
    }

    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
  }

  async function fetchText(url) {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) throw new Error("Failed to load sheet data");
    return response.text();
  }

  async function loadNews() {
    const sheetUrl = getConfiguredSheetUrl();
    if (!sheetUrl) {
      throw new Error("Google Sheets URL is not configured for news.");
    }

    const csvText = await fetchText(sheetUrl);
    const rows = parseCsv(csvText);
    const items = rows.map(normalizeSheetRecord).filter(Boolean);
    if (!items.length) {
      throw new Error("No news rows found in Google Sheets.");
    }
    return sortItems(items);
  }

  function sortItems(items) {
    return items
      .filter((item) => item.published !== false)
      .sort((a, b) => {
        const aTime = Date.parse(a.date || "") || 0;
        const bTime = Date.parse(b.date || "") || 0;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return bTime - aTime;
      });
  }

  function normalizeSheetRecord(row) {
    const mapped = {};
    Object.keys(row).forEach((key) => {
      mapped[normalizeKey(key)] = row[key];
    });

    return normalizeRecord({
      id: firstDefined(mapped.id, mapped.articleid),
      slug: firstDefined(mapped.slug, mapped.path),
      title: firstDefined(mapped.title, mapped.headline),
      date: firstDefined(mapped.date, mapped.publisheddate, mapped.publishdate),
      category: firstDefined(mapped.category, mapped.type),
      excerpt: firstDefined(mapped.excerpt, mapped.summary, mapped.deck),
      image: firstDefined(mapped.image, mapped.imageurl, mapped.imagepath, mapped.thumbnail),
      image_alt: firstDefined(mapped.imagealt, mapped.alt, mapped.alttext),
      content_html: firstDefined(mapped.contenthtml, mapped.bodyhtml, mapped.html, mapped.content),
      content_text: firstDefined(mapped.contenttext, mapped.bodytext, mapped.body, mapped.text),
      source_url: firstDefined(mapped.sourceurl, mapped.externalurl, mapped.url, mapped.link),
      source_label: firstDefined(mapped.sourcelabel, mapped.source, mapped.linklabel),
      featured: firstDefined(mapped.featured, mapped.isfeatured),
      published: firstDefined(mapped.published, mapped.ispublished, mapped.live),
      tags: firstDefined(mapped.tags, mapped.keywords),
    });
  }

  function normalizeRecord(raw) {
    if (!raw || !raw.title) return null;

    const title = String(raw.title).trim();
    const slugValue = String(raw.slug || "").trim();
    const cleanSlug = slugValue.replace(/^\/+|\/+$/g, "");
    const id = String(raw.id || cleanSlug.split("/").pop() || slugify(title)).trim();
    const category = slugify(raw.category || DEFAULT_CATEGORY) || DEFAULT_CATEGORY;
    const image = raw.image ? resolveMediaPath(String(raw.image).trim()) : getRelativePath("assets/iitb-hero.jpg");
    const contentHtml = raw.content_html
      ? String(raw.content_html).trim()
      : paragraphizeText(raw.content_text || raw.excerpt || "");
    const excerpt = normalizeExcerpt(raw.excerpt || stripHtml(contentHtml));

    return {
      id,
      slug: cleanSlug || slugify(title),
      title,
      date: normalizeDate(raw.date),
      category,
      excerpt,
      image,
      imageAlt: String(raw.image_alt || title).trim(),
      contentHtml,
      sourceUrl: String(raw.source_url || "").trim(),
      sourceLabel: String(raw.source_label || "Original source").trim(),
      featured: toBoolean(raw.featured),
      published: raw.published === undefined || raw.published === "" ? true : toBoolean(raw.published),
      tags: normalizeTags(raw.tags),
    };
  }

  function resolveMediaPath(imagePath) {
    if (!imagePath) return "";
    if (isExternalUrl(imagePath) || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("assets/")) return getRelativePath(imagePath);
    if (imagePath.startsWith("/")) return imagePath;
    return imagePath;
  }

  function normalizeDate(value) {
    const parsed = Date.parse(String(value || "").trim());
    if (Number.isNaN(parsed)) return new Date().toISOString().slice(0, 10);
    return new Date(parsed).toISOString().slice(0, 10);
  }

  function formatDate(dateValue, options) {
    const parsed = Date.parse(dateValue);
    if (Number.isNaN(parsed)) return dateValue || "";
    return new Date(parsed).toLocaleDateString(
      undefined,
      options || { year: "numeric", month: "long", day: "numeric" },
    );
  }

  function buildArticleHref(item) {
    const base = getRelativePath("pages/news-article.html");
    const identifier = encodeURIComponent(item.slug || item.id);
    return base + "?slug=" + identifier;
  }

  function getArticleFromQuery(items) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    const id = params.get("id");
    if (!slug && !id) return null;
    return items.find((item) => item.slug === slug || item.id === id) || null;
  }

  function getCategories(items) {
    const counts = new Map();
    items.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: formatCategoryLabel(value), count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function formatCategoryLabel(value) {
    return String(value || "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function firstDefined() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = arguments[index];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return "";
  }

  function toBoolean(value) {
    if (typeof value === "boolean") return value;
    const normalized = String(value || "").trim().toLowerCase();
    return ["true", "yes", "1", "featured", "publish", "published"].includes(normalized);
  }

  function normalizeExcerpt(value) {
    const cleaned = String(value || "").replace(/\s+/g, " ").trim();
    if (cleaned.length <= 220) return cleaned;
    return cleaned.slice(0, 217).trimEnd() + "...";
  }

  function normalizeTags(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value)
      .split(/[|,]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function normalizeKey(key) {
    return String(key || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function paragraphizeText(value) {
    return String(value || "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => "<p>" + escapeHtml(paragraph) + "</p>")
      .join("");
  }

  function stripHtml(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function parseCsv(text) {
    const rows = [];
    let currentValue = "";
    let currentRow = [];
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const nextChar = text[index + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentValue += '"';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (char === "," && !insideQuotes) {
        currentRow.push(currentValue);
        currentValue = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") index += 1;
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = "";
        continue;
      }

      currentValue += char;
    }

    if (currentValue !== "" || currentRow.length) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    if (!rows.length) return [];

    const headers = rows[0].map((cell) => String(cell || "").trim());
    return rows
      .slice(1)
      .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
      .map((row) => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || "";
        });
        return item;
      });
  }

  window.NewsService = {
    buildArticleHref,
    escapeHtml,
    formatCategoryLabel,
    formatDate,
    getArticleFromQuery,
    getCategories,
    getRelativePath,
    loadNews,
  };
})();
