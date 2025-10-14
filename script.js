// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Dropdown Navigation
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        // Desktop hover behavior
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                dropdownMenu.style.opacity = '1';
                dropdownMenu.style.visibility = 'visible';
                dropdownMenu.style.transform = 'translateY(0)';
            }
        });
        
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.transform = 'translateY(-10px)';
            }
        });
        
        // Mobile click behavior
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isOpen = dropdownMenu.style.display === 'block';
                
                // Close all other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                        if (otherMenu) {
                            otherMenu.style.display = 'none';
                        }
                    }
                });
                
                // Toggle current dropdown
                dropdownMenu.style.display = isOpen ? 'none' : 'block';
            }
        });
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const isDropdownClick = e.target.closest('.dropdown');
        if (!isDropdownClick) {
            dropdowns.forEach(dropdown => {
                const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    dropdownMenu.style.display = 'none';
                }
            });
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        // Reset mobile dropdown styles on desktop
        dropdowns.forEach(dropdown => {
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.style.display = '';
            }
        });
    }
});

// Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Hero Carousel
let heroSlideIndex = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroCarousel = document.querySelector('.hero-carousel');
const heroDots = document.querySelectorAll('.dot');
const heroPrevBtn = document.querySelector('.carousel-prev');
const heroNextBtn = document.querySelector('.carousel-next');

if (heroSlides.length > 0 && heroCarousel) {
    function updateCarouselPosition() {
        const translateX = -heroSlideIndex * 100;
        heroCarousel.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        heroDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === heroSlideIndex);
        });
    }
    
    function nextHeroSlide() {
        heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
        updateCarouselPosition();
    }
    
    function prevHeroSlide() {
        heroSlideIndex = (heroSlideIndex - 1 + heroSlides.length) % heroSlides.length;
        updateCarouselPosition();
    }
    
    function goToSlide(index) {
        heroSlideIndex = index;
        updateCarouselPosition();
    }
    
    // Initialize carousel
    updateCarouselPosition();
    
    // Auto-advance slides
    setInterval(nextHeroSlide, 4000);
    
    // Navigation button event listeners
    if (heroNextBtn) {
        heroNextBtn.addEventListener('click', nextHeroSlide);
    }
    
    if (heroPrevBtn) {
        heroPrevBtn.addEventListener('click', prevHeroSlide);
    }
    
    // Dot navigation
    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevHeroSlide();
        } else if (e.key === 'ArrowRight') {
            nextHeroSlide();
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;
    
    heroCarousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isScrolling = false;
    }, { passive: true });
    
    heroCarousel.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        
        const touchCurrentX = e.changedTouches[0].screenX;
        const touchCurrentY = e.changedTouches[0].screenY;
        
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);
        
        // If vertical scroll is more than horizontal, it's scrolling
        if (diffY > diffX) {
            isScrolling = true;
        }
    }, { passive: true });
    
    heroCarousel.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        
        // Only trigger if horizontal swipe is significant and vertical movement is minimal
        if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
            if (diffX > 0) {
                nextHeroSlide();
            } else {
                prevHeroSlide();
            }
        }
    }
}

// Regular slideshow (for other sections)
let slideIndex = 0;
const slides = document.querySelectorAll('.slide:not(.hero-slide)');

if (slides.length > 0) {
    function showNextSlide() {
        slides[slideIndex].classList.remove('active');
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add('active');
    }
    
    setInterval(showNextSlide, 4000);
}

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<div class="loading"></div> Sending...';
        button.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Stats counter animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = stat.textContent;
        const isNumber = !isNaN(parseInt(target));
        
        if (isNumber) {
            const finalNumber = parseInt(target);
            let current = 0;
            const increment = finalNumber / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalNumber) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 50);
        }
    });
}

// Trigger stats animation when section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    statsObserver.observe(statsSection);
}

// Search functionality (if search exists)
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const searchableItems = document.querySelectorAll('.searchable');
        
        searchableItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Back to top button
const backToTop = document.createElement('button');
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTop.className = 'back-to-top';
backToTop.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background: var(--primary-blue);
    color: white;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
`;

document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Print functionality
function printPage() {
    window.print();
}

// Share functionality
function shareContent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Dark mode toggle (optional)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Gallery Lightbox
(function() {
    // Use figures (.gallery-item) so we can read captions and data-index
    const galleryFigures = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-content img') : null;
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const prevBtn = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const nextBtn = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    const captionEl = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    const counterEl = lightbox ? lightbox.querySelector('.lightbox-counter') : null;
    const thumbsContainer = lightbox ? lightbox.querySelector('.lightbox-thumbnails') : null;
    let currentIndex = 0;
    let focusableBefore = null;
    if (!galleryFigures.length || !lightbox || !lightboxImg) return;

    // Tabs on the left side
    const tabs = Array.from(document.querySelectorAll('.gallery-tab'));
    function setActiveTab(tabBtn) {
        tabs.forEach(t => t.classList.remove('active'));
        tabBtn.classList.add('active');

        const group = tabBtn.getAttribute('data-group');

        // Show/hide gallery figures based on group
        galleryFigures.forEach(fig => {
            if (fig.getAttribute('data-group') === group) {
                fig.style.display = '';
            } else {
                fig.style.display = 'none';
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveTab(tab));
    });

    // Initialize first tab (if any active)
    const activeTab = tabs.find(t => t.classList.contains('active')) || tabs[0];
    if (activeTab) setActiveTab(activeTab);

    // Helper: build visible items list at open time
    function buildVisibleItems() {
        const visible = galleryFigures.filter(fig => getComputedStyle(fig).display !== 'none');
        return visible.map((fig, idx) => {
            const img = fig.querySelector('img');
            const caption = fig.querySelector('.gallery-caption') ? fig.querySelector('.gallery-caption').textContent.trim() : img.alt || '';
            const src = img.dataset.src || img.src;
            return { src, alt: img.alt || '', caption, idx, fig };
        });
    }


    // Build thumbnails inside lightbox from visible items
    function buildThumbnails(items) {
        if (!thumbsContainer) return;
        thumbsContainer.innerHTML = '';
        items.forEach((item, i) => {
            const t = document.createElement('img');
            t.src = item.src;
            t.alt = item.alt || item.caption || `Image ${i + 1}`;
            t.setAttribute('data-index', i);
            t.tabIndex = 0;
            t.addEventListener('click', () => showIndex(i));
            t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showIndex(i); } });
            thumbsContainer.appendChild(t);
        });
    }

    function updateLightboxUI(items) {
        const item = items[currentIndex];
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt || item.caption || '';
        if (captionEl) captionEl.textContent = item.caption || '';
        if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${items.length}`;

        // Update thumbnails highlight
        if (thumbsContainer) {
            thumbsContainer.querySelectorAll('img').forEach(img => {
                img.removeAttribute('aria-current');
            });
            const activeThumb = thumbsContainer.querySelector(`img[data-index="${currentIndex}"]`);
            if (activeThumb) activeThumb.setAttribute('aria-current', 'true');
        }
    }

    function openLightbox(index) {
        // Rebuild items from currently visible figures
        const items = buildVisibleItems();
        if (!items.length) return;

        // Rebuild thumbnails
        buildThumbnails(items);

        currentIndex = Math.min(index, items.length - 1);
        updateLightboxUI(items);
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Save the element that had focus and move focus to close button
        focusableBefore = document.activeElement;
        if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // restore focus
        if (focusableBefore && typeof focusableBefore.focus === 'function') focusableBefore.focus();
    }

    function showIndex(index) {
        const items = buildVisibleItems();
        if (!items.length) return;
        currentIndex = (index + items.length) % items.length;
        updateLightboxUI(items);
    }

    function showPrev() {
        showIndex(currentIndex - 1);
    }

    function showNext() {
        showIndex(currentIndex + 1);
    }

    // Wire up click on gallery figures (index refers to visible order when tab selected)
    galleryFigures.forEach((fig) => {
        fig.tabIndex = 0;
        fig.setAttribute('role', 'button');
        fig.setAttribute('aria-label', (fig.querySelector('.gallery-caption') ? fig.querySelector('.gallery-caption').textContent.trim() : `Open image`));
        fig.addEventListener('click', (e) => {
            // Determine visible items and the index of this figure among them
            const visible = buildVisibleItems();
            const idx = visible.findIndex(v => v.fig === fig);
            if (idx >= 0) openLightbox(idx);
        });
        fig.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const visible = buildVisibleItems();
                const idx = visible.findIndex(v => v.fig === fig);
                if (idx >= 0) openLightbox(idx);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // Keyboard controls and focus trapping
    document.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') === 'false') {
            if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); showPrev(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }

            // Simple focus trap: keep focus inside lightbox when open
            if (e.key === 'Tab') {
                const focusable = lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) { // shift+tab
                    if (document.activeElement === first) {
                        e.preventDefault(); last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault(); first.focus();
                    }
                }
            }
        }
    });

    // Click outside image to close (but allow clicks on controls)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Touch/swipe support for lightbox images
    let lbTouchStartX = 0;
    let lbTouchEndX = 0;
    lightboxImg.addEventListener('touchstart', (e) => {
        lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxImg.addEventListener('touchend', (e) => {
        lbTouchEndX = e.changedTouches[0].screenX;
        const diff = lbTouchStartX - lbTouchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) showNext(); else showPrev();
        }
    }, { passive: true });

})();

// News ticker pause-on-hover and duplication for seamless scroll
(function() {
    const ticker = document.querySelector('.ticker-track');
    if (!ticker) return;

    // Duplicate content for seamless loop if not already duplicated
    if (ticker.children.length > 0 && ticker.dataset.duplicated !== 'true') {
        ticker.innerHTML += ticker.innerHTML;
        ticker.dataset.duplicated = 'true';
    }

    // Pause animation on hover
    const wrapper = document.querySelector('.ticker-wrapper');
    wrapper.addEventListener('mouseenter', () => {
        ticker.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
        ticker.style.animationPlayState = 'running';
    });
})();

// Simple events carousel auto-scroll
(function() {
    const carousel = document.querySelector('.events-carousel');
    if (!carousel) return;

    let scrollPos = 0;
    const step = 1; // pixels per frame

    function stepScroll() {
        scrollPos += step;
        if (scrollPos >= carousel.scrollWidth / 2) {
            scrollPos = 0; // reset for duplicated-like effect
        }
        carousel.scrollLeft = scrollPos;
        requestAnimationFrame(stepScroll);
    }

    // Duplicate items for seamless scroll if not duplicated
    if (!carousel.dataset.duplicated) {
        carousel.innerHTML += carousel.innerHTML;
        carousel.dataset.duplicated = 'true';
    }

    // Start scrolling on load
    requestAnimationFrame(stepScroll);
})();

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}
