# Transportation Systems Engineering Website

Official website for the Transportation Systems Engineering group at IIT Bombay's Department of Civil Engineering.

## ⚠️ CRITICAL: Must Use HTTP Server!

**🚨 The website MUST be run through an HTTP server - opening HTML files directly will NOT work!**

**Why?** The website loads student data from JSON files. Browsers block local file access (CORS policy) when using `file://` protocol.

**✅ Correct:** `http://localhost:8000` (through server)  
**❌ Wrong:** `file:///path/to/index.html` (direct file open)

**If student data is not loading, make sure you're using the HTTP server!**

## 🚀 Quick Start

### Method 1: Using the Start Server Script (Recommended)

```bash
# Navigate to the website directory
cd "/Users/uday/Music/tse_website 2/tse_website"

# Run the start server script
./start-server.sh
```

This will:
- Start a local web server on port 8000
- Automatically open the website in your browser
- Display useful links and information

### Method 2: Manual Server Start

```bash
# Navigate to the website directory
cd "/Users/uday/Music/tse_website 2/tse_website"

# Start Python's built-in HTTP server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Method 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📁 Website Structure (Updated - Organized)

```
tse_website/
├── index.html              # Homepage (root level)
├── package.json            # Project configuration
├── start-server.sh         # Server startup script
│
├── css/                    # Stylesheets
│   └── styles.css
│
├── js/                     # JavaScript files
│   ├── script.js
│   └── news-loader.js      # Smart path resolution
│
├── data/                   # JSON data files
│   ├── PhD.json            # Current PhD students
│   ├── Mtech.json          # Current M.Tech students
│   ├── mtech_alumni.json   # M.Tech alumni (420+ records)
│   ├── past-PhD.json       # PhD alumni
│   ├── dualdegree.json     # Dual degree alumni (6 records)
│   └── news-data.json      # News articles
│
├── pages/                  # All HTML pages
│   ├── faculty-current.html
│   ├── faculty-past.html
│   ├── PhD.html
│   ├── Mtech.html
│   ├── past-PhD.html
│   ├── past-Mtech.html     # 420+ alumni records
│   ├── past-DualDegree.html # 6 alumni records
│   ├── news.html
│   ├── research.html
│   ├── contact.html
│   └── events.html
│
├── assets/                 # Images and media
├── news/                   # Individual news articles
├── scripts/                # Build scripts
│   ├── generate-news.js
│   ├── import-news-link.js
│   └── watch-news.js
└── templates/              # HTML templates
    └── news-page.html
```
├── assets/                 # Images and media
└── news/                   # News articles
```

## ⚠️ Important Notes

### Why You Need a Local Server

The website uses JSON files to dynamically load alumni data. Modern browsers block loading local JSON files when opening HTML files directly (file:// protocol) due to CORS security policy.

**❌ This won't work:**
- Double-clicking `index.html` to open in browser
- Opening files directly with `file:///path/to/index.html`

**✅ This will work:**
- Using a local web server (http://localhost:8000)
- Deploying to a web hosting service

### Features

#### Home Page (index.html)
- 4-slide hero carousel with navigation
- Timeline of TSE history
- Quick statistics (10 faculty, 50+ students, 100+ projects, 37 years)
- News, Events, and Spotlights sections
- LinkedIn articles integration
- Photo gallery with lightbox
- Comprehensive About Us section

#### M.Tech Alumni (past-Mtech.html)
- 420+ alumni records from 1994-2025
- Interactive searchable table
- Filter by decade (1990s, 2000s, 2010s, 2020s)
- Sortable columns (Name, Year)
- CSV export functionality
- Real-time statistics

#### Dual Degree Alumni (past-DualDegree.html)
- 6 graduates from 2018-2025
- Card-based layout
- Search functionality
- Year-specific filtering
- Program information box
- CSV export

## 🔧 Making Changes

### Adding New Alumni

1. **M.Tech Alumni:** Edit `mtech_alumni.json`
2. **Dual Degree Alumni:** Edit `dualdegree.json`

JSON format:
```json
{
  "name": "Student Name",
  "dissertation_title": "Thesis title",
  "supervisor": "Prof. Name",
  "year": 2025
}
```

### Updating Images

- Place images in the `assets/` folder
- Update image paths in HTML files
- Supported formats: JPG, PNG, GIF

### Modifying Styles

- Edit `styles.css` for global styling
- CSS variables are defined in `:root` selector
- Responsive breakpoints: 768px (tablet), 520px (mobile)

## 🎨 Design Features

- **Responsive Design:** Works on desktop, tablet, and mobile
- **Dark Blue Theme:** Professional color scheme
- **Font Awesome Icons:** 6.4.0 for UI elements
- **Smooth Animations:** Fade-in effects and transitions
- **Accessibility:** ARIA labels and keyboard navigation
- **Back-to-Top Button:** Appears after scrolling 300px

## 📊 Data Files

### mtech_alumni.json
- 420+ records
- Years: 1994-2025
- Fields: name, dissertation_title, supervisor, year

### dualdegree.json
- 6 records
- Years: 2018-2025
- Fields: name, dissertation_title, supervisor, year

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 To-Do / Future Enhancements

- [ ] Add PhD alumni data
- [ ] Implement dark mode toggle
- [ ] Add more photo galleries
- [ ] Create alumni profile pages
- [ ] Add research publications section
- [ ] Integrate with backend API

## 🐛 Troubleshooting

### Alumni data not loading?
- Make sure you're using a local server (not file://)
- Check browser console for errors (F12)
- Verify JSON files are in the correct location

### Images not showing?
- Check image paths are correct
- Ensure images exist in assets/ folder
- Verify image file extensions match HTML references

### Server port already in use?
- Kill existing process: `lsof -ti:8000 | xargs kill -9`
- Or use a different port: `python3 -m http.server 8001`

## 📞 Contact

Transportation Systems Engineering
Department of Civil Engineering
Indian Institute of Technology Bombay
Powai, Mumbai - 400076, India

Email: tse@civil.iitb.ac.in

---

© 2025 Transportation Systems Engineering, IIT Bombay. All rights reserved.
