# Transportation Systems Engineering Website

Official website for the Transportation Systems Engineering group at IIT Bombay's Department of Civil Engineering.

## Important

Run the website through an HTTP server. Opening HTML files directly with `file://` may block dynamic JSON and Google Sheets requests in the browser.

## Quick Start

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Website Structure

```text
tse_website/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── script.js
│   ├── lab-facilities.js
│   ├── news-service.js
│   └── news-loader.js
├── data/
│   ├── PhD.json
│   ├── Mtech.json
│   ├── mtech_alumni.json
│   ├── past-PhD.json
│   ├── dualdegree.json
│   ├── pavement-lab.json
│   ├── simulator-lab.json
│   ├── news-sheet-upload.csv
│   └── news-sheet-schema.example.csv
├── pages/
│   ├── faculty-current.html
│   ├── faculty-past.html
│   ├── staff-members.html
│   ├── postdoc.html
│   ├── PhD.html
│   ├── Mtech.html
│   ├── past-PhD.html
│   ├── past-Mtech.html
│   ├── past-DualDegree.html
│   ├── events.html
│   ├── research.html
│   ├── contact.html
│   ├── news.html
│   └── news-article.html
└── assets/
```

## News System

News content is loaded from Google Sheets only.

Configured sheet URL:
`https://docs.google.com/spreadsheets/d/1XG1kqRNLNqKGf0gtIe9BbyRNZzPIqVc2aH35fnkG5pM/export?format=csv&gid=0`

Only the first worksheet tab (`gid=0`) is used.

### News Sheet Columns

Use these columns when adding or editing a news row:

- `id`
- `slug`
- `title`
- `date`
- `category`
- `excerpt`
- `image`
- `image_alt`
- `content_html`
- `content_text`
- `source_url`
- `source_label`
- `featured`
- `published`
- `tags`

### Adding a News Article

Add one row to the first Google Sheet tab:

- Fill `id`, `slug`, `title`, `date`, `category`, `excerpt`, `image`, and `image_alt`.
- Add full article content in `content_html`, or use `content_text`.
- Set `featured` to `TRUE` for the highlighted article, otherwise `FALSE`.
- Set `published` to `TRUE` to show the article on the site.

The loader will show a blue loading state while fetching news and a blue error message if the sheet request fails.

## Data Files

- `data/PhD.json`: current PhD students
- `data/Mtech.json`: current M.Tech students
- `data/mtech_alumni.json`: M.Tech alumni
- `data/past-PhD.json`: PhD alumni
- `data/dualdegree.json`: dual degree alumni
- `data/pavement-lab.json`: pavement lab instruments
- `data/simulator-lab.json`: simulator lab instruments

## Updating Images

Place images in `assets/` and reference them with paths like `assets/example.jpg`, or use a full external image URL where supported.

## Styles

Global styles are in `css/styles.css`. Theme variables are defined in the `:root` selector.

## Troubleshooting

- If alumni/lab data does not load, make sure the site is running on a local or hosted HTTP server.
- If news does not load, confirm the Google Sheet is published/shared so CSV export works and that the first tab contains the expected headers.
- Check the browser console for fetch or CORS errors.

## Contact

Transportation Systems Engineering  
Department of Civil Engineering  
Indian Institute of Technology Bombay  
Powai, Mumbai - 400076, India  

Email: tse@civil.iitb.ac.in
