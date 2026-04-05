// Lab Facilities JavaScript

// Function to convert Google Drive link to direct image URL
function getGoogleDriveImageUrl(url) {
  if (!url || url === "-" || url === "") return null;

  // Check if it's a Google Drive link
  if (url.includes("drive.google.com")) {
    const fileIdMatch = url.match(/\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400`;
    }
  }

  return url;
}

// Function to create instrument card HTML
function createInstrumentCard(instrument) {
  const imageUrl = getGoogleDriveImageUrl(instrument.imageUrl);

  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="${instrument.name}" class="instrument-image" loading="lazy">`
    : `<div class="instrument-image-placeholder">
             <img src="../assets/iitb-logo.svg" alt="IIT Bombay Logo" class="instrument-placeholder-logo" loading="lazy">
           </div>`;

  // Determine if this is a pavement lab instrument (has studentAssigned) or simulator lab (has userSafetyInstructions/mmdNumber)
  const isPavementLab = instrument.hasOwnProperty("studentAssigned");

  // Build the right column details based on lab type
  let rightColumnHtml = `
    <div class="detail-item">
        <span class="detail-label">In-Charge</span>
        <span class="detail-value">${
          instrument.inCharge || "Not Specified"
        }</span>
    </div>
  `;

  if (isPavementLab) {
    rightColumnHtml += `
      <div class="detail-item">
          <span class="detail-label">Student Assigned</span>
          <span class="detail-value">${
            instrument.studentAssigned || "N/A"
          }</span>
      </div>
    `;
  } else {
    // Simulator lab specific fields
    rightColumnHtml += `
      <div class="detail-item">
          <span class="detail-label">User Safety Instructions</span>
          <span class="detail-value">${
            instrument.userSafetyInstructions || "Not Specified"
          }</span>
      </div>
      <div class="detail-item">
          <span class="detail-label">MMD Number</span>
          <span class="detail-value">${instrument.mmdNumber || "N/A"}</span>
      </div>
    `;
  }

  rightColumnHtml += `
    <div class="detail-item">
        <span class="detail-label">Application</span>
        <span class="detail-value">${instrument.application}</span>
    </div>
  `;

  return `
        <div class="instrument-card fade-in">
            <div class="instrument-image-col">
                ${imageHtml}
            </div>
            
            <div class="instrument-details-left">
                <h3 class="instrument-name">${instrument.name}</h3>
                
                <div class="detail-item">
                    <span class="detail-label">Model Number</span>
                    <span class="detail-value">${
                      instrument.modelNumber || "N/A"
                    }</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Manufacturer</span>
                    <span class="detail-value">${
                      instrument.manufacturer || "N/A"
                    }</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${instrument.description}</span>
                </div>
            </div>
            
            <div class="instrument-details-right">
                ${rightColumnHtml}
            </div>
        </div>
    `;
}

// Function to load and display instruments for a lab
async function loadLabInstruments(labName) {
  const container = document.getElementById("instruments-container");
  container.innerHTML =
    '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-blue);"></i></div>';

  try {
    let dataFile;
    switch (labName) {
      case "pavement":
        dataFile = "../data/pavement-lab.json";
        break;
      case "simulator":
        dataFile = "../data/simulator-lab.json";
        break;
      default:
        container.innerHTML =
          '<div style="text-align: center; padding: 3rem;"><p style="font-size: 1.2rem; color: var(--text-light);">Please select a lab</p></div>';
        return;
    }

    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error("Failed to load lab data");
    }

    const labData = await response.json();

    let html = "";
    labData.categories.forEach((category, index) => {
      const categoryId = `category-${index}`;
      html += `
                <div class="category-section">
                    <button class="category-toggle" id="${categoryId}-toggle" data-category="${categoryId}">
                        <h2 class="category-title">
                            <i class="fas fa-chevron-right toggle-icon"></i>
                            ${category.categoryName}
                        </h2>
                    </button>
                    <div class="category-instruments" id="${categoryId}" style="display: none;">
                        ${category.instruments
                          .map((instrument) => createInstrumentCard(instrument))
                          .join("")}
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;

    // Add click event listeners to category toggles
    const categoryToggles = container.querySelectorAll(".category-toggle");
    categoryToggles.forEach((toggle) => {
      toggle.addEventListener("click", function () {
        const categoryId = this.getAttribute("data-category");
        const categoryDiv = document.getElementById(categoryId);
        const toggleIcon = this.querySelector(".toggle-icon");

        if (
          categoryDiv.style.display === "none" ||
          categoryDiv.style.display === ""
        ) {
          categoryDiv.style.display = "block";
          toggleIcon.classList.remove("fa-chevron-right");
          toggleIcon.classList.add("fa-chevron-down");
        } else {
          categoryDiv.style.display = "none";
          toggleIcon.classList.remove("fa-chevron-down");
          toggleIcon.classList.add("fa-chevron-right");
        }
      });
    });

    // Trigger fade-in animations
    setTimeout(() => {
      const elements = container.querySelectorAll(".category-section");
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("fade-in");
        }, index * 100);
      });
    }, 100);
  } catch (error) {
    console.error("Error loading lab data:", error);
    container.innerHTML =
      '<div style="text-align: center; padding: 3rem;"><p style="font-size: 1.2rem; color: red;">Error loading lab data. Please try again.</p></div>';
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  const labTabs = document.querySelectorAll(".lab-tab");

  // Add click event listeners to lab tabs
  labTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      labTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Load instruments for selected lab
      const labName = this.getAttribute("data-lab");
      loadLabInstruments(labName);
    });
  });

  // Load default lab (Pavement Lab) on page load
  loadLabInstruments("pavement");
});
