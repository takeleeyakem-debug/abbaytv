// ==================================================
// ABBAY TV ETHIOPIA - MAIN JAVASCRIPT
// ==================================================

// Global variables
let siteSettings = {};
let allData = {
    news: [],
    programs: [],
    live: [],
    jobs: []
};

// ==================================================
// UTILITY FUNCTIONS
// ==================================================

// Sort items by ID descending (newest first)
const sortByIdDesc = (items) => {
    return [...items].sort((a, b) => b.id - a.id);
};

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Extract YouTube video ID from URL
const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Get YouTube embed URL
const getYoutubeEmbedUrl = (url) => {
    const videoId = extractYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// Handle missing images
const handleImageError = (img) => {
    img.src = 'https://via.placeholder.com/300x200?text=ABBAY+TV';
    img.onerror = null;
};

// ==================================================
// FETCH FUNCTIONS
// ==================================================

// Load update.json first
async function loadSiteSettings() {
    try {
        const response = await fetch('update.json');
        if (!response.ok) throw new Error('Failed to load site settings');
        siteSettings = await response.json();
        console.log('Site settings loaded:', siteSettings);
        return siteSettings;
    } catch (error) {
        console.error('Error loading site settings:', error);
        // Default settings if file not found
        siteSettings = {
            sort_order: "desc",
            sort_by: "id",
            homepage: {
                latest_news_limit: 6,
                latest_programs_limit: 4,
                latest_jobs_limit: 3,
                show_live_only_if_active: true
            },
            features_is_newest: true,
            site_status: "online",
            last_updated: new Date().toISOString().split('T')[0]
        };
        return siteSettings;
    }
}

// Load JSON data
async function loadJSON(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        const data = await response.json();
        
        // Handle different JSON structures
        if (data.items) {
            return sortByIdDesc(data.items);
        } else if (Array.isArray(data)) {
            return sortByIdDesc(data);
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

// ==================================================
// RENDER FUNCTIONS
// ==================================================

// Render news cards
function renderNewsCards(newsItems, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let itemsToRender = newsItems;
    if (limit) {
        itemsToRender = newsItems.slice(0, limit);
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = '<div class="no-items">No news available</div>';
        return;
    }

    container.innerHTML = itemsToRender.map(item => {
        const youtubeEmbed = item.youtube_url ? getYoutubeEmbedUrl(item.youtube_url) : null;
        
        return `
            <div class="card">
                <div class="card-media">
                    <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=ABBAY+TV+News'}" 
                         alt="${item.title}"
                         onerror="handleImageError(this)">
                    ${youtubeEmbed ? `
                        <a href="${item.youtube_url}" target="_blank" class="card-video-overlay">
                            <div class="play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                        </a>
                    ` : ''}
                </div>
                <div class="card-content">
                    <span class="card-category">${item.category || 'News'}</span>
                    <h3 class="card-title">
                        <a href="${item.youtube_url || '#'}" target="${item.youtube_url ? '_blank' : '_self'}">
                            ${item.title}
                        </a>
                    </h3>
                    <div class="card-meta">
                        <span><i class="far fa-calendar"></i> ${formatDate(item.date || item.published_date)}</span>
                        ${item.author ? `<span><i class="far fa-user"></i> ${item.author}</span>` : ''}
                    </div>
                    <p class="card-description">${item.summary || item.description || item.content?.substring(0, 150)}...</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="btn-read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }).join('');
}

// Render program cards
function renderProgramCards(programItems, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let itemsToRender = programItems;
    if (limit) {
        itemsToRender = programItems.slice(0, limit);
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = '<div class="no-items">No programs available</div>';
        return;
    }

    container.innerHTML = itemsToRender.map(item => {
        const youtubeEmbed = item.youtube_url ? getYoutubeEmbedUrl(item.youtube_url) : null;
        
        return `
            <div class="card">
                <div class="card-media">
                    <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=ABBAY+TV+Programs'}" 
                         alt="${item.name || item.title}"
                         onerror="handleImageError(this)">
                    ${youtubeEmbed ? `
                        <a href="${item.youtube_url}" target="_blank" class="card-video-overlay">
                            <div class="play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                        </a>
                    ` : ''}
                </div>
                <div class="card-content">
                    <span class="card-category">${item.category || 'Program'}</span>
                    <h3 class="card-title">
                        <a href="${item.youtube_url || '#'}" target="${item.youtube_url ? '_blank' : '_self'}">
                            ${item.name || item.title}
                        </a>
                    </h3>
                    ${item.host ? `
                        <div class="card-meta">
                            <span><i class="far fa-user"></i> Host: ${item.host}</span>
                        </div>
                    ` : ''}
                    <div class="card-meta">
                        <span><i class="far fa-clock"></i> ${item.schedule || item.air_date || 'Weekly'}</span>
                    </div>
                    <p class="card-description">${item.description || item.summary || ''}</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="btn-read-more">Watch Now <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }).join('');
}

// Render job cards
function renderJobCards(jobItems, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let itemsToRender = jobItems;
    if (limit) {
        itemsToRender = jobItems.slice(0, limit);
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = '<div class="no-items">No jobs available</div>';
        return;
    }

    container.innerHTML = itemsToRender.map(item => `
        <div class="job-card">
            <div class="job-content">
                <div class="job-header">
                    <h3 class="job-title">${item.title}</h3>
                    <span class="job-type">${item.type || item.job_type || 'Full-time'}</span>
                </div>
                
                <div class="job-details">
                    <div class="job-detail-item">
                        <i class="fas fa-building"></i>
                        <span>${item.company || 'ABBAY TV Ethiopia'}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${item.location || 'Addis Ababa'}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>${item.salary || 'Negotiable'}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="far fa-calendar-alt"></i>
                        <span>Posted: ${formatDate(item.posted_date || item.date)}</span>
                    </div>
                </div>
                
                <div class="job-description">
                    <p>${item.description || ''}</p>
                </div>
                
                ${item.requirements ? `
                    <div class="job-requirements">
                        <h4>Requirements:</h4>
                        <ul>
                            ${item.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="job-footer">
                    <div class="deadline">
                        <i class="far fa-hourglass"></i>
                        Deadline: ${formatDate(item.deadline || '2024-12-31')}
                    </div>
                    <a href="${item.apply_link || '#'}" class="btn-apply">
                        Apply Now <i class="fas fa-paper-plane"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Render live streams
function renderLiveStreams(liveItems, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const liveStreams = liveItems.filter(item => item.is_live === true);

    if (liveStreams.length === 0) {
        document.getElementById('live-section').style.display = 'none';
        return;
    }

    document.getElementById('live-section').style.display = 'block';

    container.innerHTML = liveStreams.map(item => {
        const embedUrl = item.youtube_url ? 
            (item.youtube_url.includes('embed') ? item.youtube_url : getYoutubeEmbedUrl(item.youtube_url)) : 
            null;

        return `
            <div class="live-card">
                <div class="live-embed">
                    <div class="live-badge">
                        <i class="fas fa-circle live-icon"></i> LIVE NOW
                    </div>
                    ${embedUrl ? `
                        <iframe 
                            src="${embedUrl}" 
                            frameborder="0" 
                            allowfullscreen>
                        </iframe>
                    ` : `
                        <img src="${item.image_url || 'https://via.placeholder.com/640x360?text=LIVE+STREAM'}" 
                             alt="${item.title}"
                             style="width:100%; height:100%; object-fit:cover;">
                    `}
                </div>
                <div class="card-content">
                    <h3>${item.title}</h3>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Render upcoming live streams
function renderUpcomingLive(liveItems, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const upcoming = liveItems.filter(item => !item.is_live);

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="no-items">No upcoming streams</div>';
        return;
    }

    container.innerHTML = upcoming.map(item => {
        const scheduleDate = item.schedule_date ? new Date(item.schedule_date) : new Date();
        
        return `
            <div class="schedule-item">
                <div class="schedule-date">
                    <span class="day">${scheduleDate.getDate()}</span>
                    <span class="month">${scheduleDate.toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="schedule-content">
                    <h4>${item.title}</h4>
                    <p><i class="far fa-clock"></i> ${scheduleDate.toLocaleTimeString()}</p>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================================================
=// PAGE SPECIFIC FUNCTIONS
// ==================================================

// Homepage
async function loadHomepageContent() {
    await loadSiteSettings();
    
    // Load all data
    const [news, programs, live, jobs] = await Promise.all([
        loadJSON('news.json'),
        loadJSON('programs.json'),
        loadJSON('live.json'),
        loadJSON('jobs.json')
    ]);

    allData = { news, programs, live, jobs };

    // Render sections based on settings
    const homepageSettings = siteSettings.homepage || {};
    
    // Live section
    renderLiveStreams(live, 'live-container');
    
    // News section
    renderNewsCards(news, 'news-container', homepageSettings.latest_news_limit || 6);
    
    // Programs section
    renderProgramCards(programs, 'programs-container', homepageSettings.latest_programs_limit || 4);
    
    // Jobs section
    renderJobCards(jobs, 'jobs-container', homepageSettings.latest_jobs_limit || 3);
}

// News page
async function loadNewsPage() {
    await loadSiteSettings();
    
    const news = await loadJSON('news.json');
    allData.news = news;

    // Initial render
    renderNewsCards(news, 'news-container');
    
    // Setup category filter
    const filterSelect = document.getElementById('category-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (category === 'all') {
                renderNewsCards(news, 'news-container');
            } else {
                const filtered = news.filter(item => item.category === category);
                renderNewsCards(filtered, 'news-container');
            }
        });
    }
}

// Programs page
async function loadProgramsPage() {
    await loadSiteSettings();
    
    const programs = await loadJSON('programs.json');
    allData.programs = programs;

    // Initial render
    renderProgramCards(programs, 'programs-container');
    
    // Setup category filter
    const filterSelect = document.getElementById('program-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (category === 'all') {
                renderProgramCards(programs, 'programs-container');
            } else {
                const filtered = programs.filter(item => item.category === category);
                renderProgramCards(filtered, 'programs-container');
            }
        });
    }
}

// Live page
async function loadLivePage() {
    await loadSiteSettings();
    
    const live = await loadJSON('live.json');
    allData.live = live;

    // Current live streams
    const currentLive = live.filter(item => item.is_live);
    if (currentLive.length > 0) {
        document.getElementById('current-live-section').style.display = 'block';
        renderLiveStreams(live, 'current-live-container');
    } else {
        document.getElementById('current-live-section').style.display = 'none';
    }

    // Upcoming streams
    renderUpcomingLive(live, 'upcoming-live-container');
}

// Jobs page
async function loadJobsPage() {
    await loadSiteSettings();
    
    const jobs = await loadJSON('jobs.json');
    allData.jobs = jobs;

    // Initial render
    renderJobCards(jobs, 'jobs-container');
    
    // Setup type filter
    const filterSelect = document.getElementById('job-type-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'all') {
                renderJobCards(jobs, 'jobs-container');
            } else {
                const filtered = jobs.filter(item => (item.type || item.job_type) === type);
                renderJobCards(filtered, 'jobs-container');
            }
        });
    }
}

// Contact page
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = {
                id: Date.now(), // Use timestamp as ID
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                date: new Date().toISOString(),
                status: 'unread'
            };

            try {
                // In a real static site, you'd need a backend service
                // For now, we'll simulate success
                console.log('Message received:', formData);
                
                // Show success message
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Thank you for your message. We will get back to you soon!';
                form.reset();

                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);

                // Note: In a real static site, you'd need to use a service like Formspree
                // or Netlify Forms to actually store the message

            } catch (error) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
                console.error('Error submitting form:', error);
            }
        });
    }
}

// ==================================================
// MOBILE MENU TOGGLE
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// ==================================================
// GLOBAL ERROR HANDLER FOR IMAGES
// ==================================================

window.handleImageError = handleImageError;