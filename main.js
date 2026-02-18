/* ==================================================
   ABBAY TV ETHIOPIA - MAIN JAVASCRIPT
   FIXED: JSON Loading, Error Handling, Display
   ================================================== */

// ===== GLOBAL VARIABLES =====
const AppData = {
    news: [],
    programs: [],
    live: [],
    jobs: [],
    settings: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Main.js loaded');
    setupMobileMenu();
    setupSearch();
});

// ===== MOBILE MENU =====
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeMenuFunction);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenuFunction);
    }
    
    function closeMenuFunction() {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const closeSearch = document.getElementById('closeSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    const globalSearch = document.getElementById('globalSearch');
    const mobileSearch = document.getElementById('mobileSearch');
    
    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (mobileSearch) mobileSearch.focus();
        });
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (globalSearch) {
        globalSearch.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                document.getElementById('searchResults').innerHTML = '';
                return;
            }
            
            const results = [];
            
            // Search in all loaded data
            AppData.news.forEach(item => {
                if (item.title?.toLowerCase().includes(query) || 
                    item.description?.toLowerCase().includes(query)) {
                    results.push({...item, type: 'news'});
                }
            });
            
            AppData.programs.forEach(item => {
                if (item.name?.toLowerCase().includes(query) || 
                    item.title?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query)) {
                    results.push({...item, type: 'program'});
                }
            });
            
            displaySearchResults(results.slice(0, 5));
        });
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">No results found</div>';
        return;
    }
    
    container.innerHTML = results.map(r => `
        <div class="search-result-item" onclick="window.location.href='${r.type}.html'">
            <div class="search-result-title">${r.title || r.name}</div>
            <div class="search-result-category">${r.type} • ${r.category || ''}</div>
        </div>
    `).join('');
}

// ===== JSON LOADING FUNCTIONS =====
async function loadJSON(filename) {
    try {
        console.log(`📂 Fetching: ${filename}`);
        const response = await fetch(filename);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Loaded: ${filename}`, data);
        
        // Handle different JSON structures
        if (data.items) {
            return data.items;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            console.warn(`⚠️ Unexpected JSON structure in ${filename}`);
            return [];
        }
    } catch (error) {
        console.error(`❌ Error loading ${filename}:`, error);
        return [];
    }
}

// ===== SORT BY ID (NEWEST FIRST) =====
function sortByNewest(items) {
    if (!items || !Array.isArray(items)) return [];
    return [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
}

// ===== FORMAT DATE =====
function formatDate(dateString) {
    if (!dateString) return 'Recent';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// ===== TRUNCATE TEXT =====
function truncate(str, length = 100) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

// ===== HOMEPAGE LOADER =====
async function loadHomepage() {
    console.log('🏠 Loading homepage...');
    
    // Show loading states
    document.getElementById('newsFeed').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    document.getElementById('programsFeed').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading programs...</div>';
    document.getElementById('jobsFeed').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading jobs...</div>';
    
    // Load all JSON files
    const [news, programs, live, jobs] = await Promise.all([
        loadJSON('news.json'),
        loadJSON('programs.json'),
        loadJSON('live.json'),
        loadJSON('jobs.json')
    ]);
    
    // Store in global AppData
    AppData.news = sortByNewest(news);
    AppData.programs = sortByNewest(programs);
    AppData.live = sortByNewest(live);
    AppData.jobs = sortByNewest(jobs);
    
    console.log('📊 AppData loaded:', {
        news: AppData.news.length,
        programs: AppData.programs.length,
        live: AppData.live.length,
        jobs: AppData.jobs.length
    });
    
    // Render sections
    renderLiveStories();
    renderHomepageNews();
    renderHomepagePrograms();
    renderHomepageJobs();
}

function renderLiveStories() {
    const container = document.getElementById('liveStories');
    const section = document.getElementById('liveStoriesSection');
    
    if (!container || !section) return;
    
    const liveItems = AppData.live.filter(item => item.is_live === true);
    
    if (liveItems.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = liveItems.map(item => `
        <div class="story-item" onclick="window.location.href='live.html'">
            <div class="story-avatar live">
                <img src="${item.image_url || 'https://via.placeholder.com/80/000/fff?text=LIVE'}" 
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/80/000/fff?text=TV'">
            </div>
            <div class="story-title">${truncate(item.title, 15)}</div>
            <div class="live-indicator">🔴 LIVE</div>
        </div>
    `).join('');
}

function renderHomepageNews() {
    const container = document.getElementById('newsFeed');
    if (!container) return;
    
    if (AppData.news.length === 0) {
        container.innerHTML = '<div class="error-state">No news available</div>';
        return;
    }
    
    const latestNews = AppData.news.slice(0, 6);
    
    container.innerHTML = latestNews.map(item => `
        <div class="feed-card" onclick="window.location.href='news.html'">
            <img src="${item.image_url || 'https://via.placeholder.com/300/000/gold?text=NEWS'}" 
                 alt="${item.title}"
                 onerror="this.src='https://via.placeholder.com/300/000/fff?text=ABBAY'">
            ${item.youtube_url ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
            <div class="feed-card-overlay">
                <div class="feed-card-title">${truncate(item.title, 30)}</div>
                <div class="feed-card-meta">
                    <i class="far fa-calendar"></i> ${formatDate(item.date)}
                </div>
            </div>
        </div>
    `).join('');
}

function renderHomepagePrograms() {
    const container = document.getElementById('programsFeed');
    if (!container) return;
    
    if (AppData.programs.length === 0) {
        container.innerHTML = '<div class="error-state">No programs available</div>';
        return;
    }
    
    const latestPrograms = AppData.programs.slice(0, 4);
    
    container.innerHTML = latestPrograms.map(item => `
        <div class="feed-card" onclick="window.location.href='programs.html'">
            <img src="${item.image_url || 'https://via.placeholder.com/300/000/gold?text=PROGRAM'}" 
                 alt="${item.name || item.title}"
                 onerror="this.src='https://via.placeholder.com/300/000/fff?text=TV'">
            ${item.youtube_url ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
            <div class="feed-card-overlay">
                <div class="feed-card-title">${truncate(item.name || item.title, 30)}</div>
                <div class="feed-card-meta">
                    <i class="far fa-clock"></i> ${item.schedule || 'Weekly'}
                </div>
            </div>
        </div>
    `).join('');
}

function renderHomepageJobs() {
    const container = document.getElementById('jobsFeed');
    if (!container) return;
    
    if (AppData.jobs.length === 0) {
        container.innerHTML = '<div class="error-state">No jobs available</div>';
        return;
    }
    
    const latestJobs = AppData.jobs.slice(0, 3);
    
    container.innerHTML = latestJobs.map(item => `
        <div class="job-mini-card" onclick="window.location.href='jobs.html'">
            <div class="job-mini-info">
                <h4>${item.title}</h4>
                <p><i class="fas fa-building"></i> ${item.company || 'ABBAY TV'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${item.location || 'Addis Ababa'}</p>
            </div>
            <div class="job-mini-type">${item.type || 'Full-time'}</div>
        </div>
    `).join('');
}

// ===== NEWS PAGE LOADER =====
async function loadNewsPage() {
    console.log('📰 Loading news page...');
    
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    
    const news = await loadJSON('news.json');
    AppData.news = sortByNewest(news);
    
    if (AppData.news.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No News Found</h3>
                <p>Check that news.json exists in the same folder</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        return;
    }
    
    // Update stats
    document.getElementById('totalNewsCount').textContent = AppData.news.length;
    document.getElementById('videoCount').textContent = AppData.news.filter(n => n.youtube_url).length;
    
    // Render featured news (first item)
    renderFeaturedNews(AppData.news[0]);
    
    // Render news grid
    renderNewsGrid(AppData.news);
    
    // Setup category filters
    setupCategoryFilters();
}

function renderFeaturedNews(item) {
    const container = document.getElementById('featuredNews');
    if (!container || !item) return;
    
    container.innerHTML = `
        <div class="featured-card" onclick="window.open('${item.youtube_url || '#'}', '_blank')">
            <img src="${item.image_url || 'https://via.placeholder.com/1200x600/000/gold?text=FEATURED'}" alt="${item.title}">
            <div class="featured-content">
                <span class="featured-category">${item.category || 'Breaking'}</span>
                <h2 class="featured-title">${item.title}</h2>
                <p class="featured-description">${truncate(item.description || item.summary || '', 150)}</p>
                <div class="featured-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(item.date)}</span>
                    <span><i class="far fa-user"></i> ${item.author || 'ABBAY TV'}</span>
                </div>
            </div>
        </div>
    `;
}

function renderNewsGrid(items) {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <div class="news-card">
            <div class="news-card-media">
                <img src="${item.image_url || 'https://via.placeholder.com/400x225/000/gold?text=NEWS'}" 
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/400x225/000/fff?text=ABBAY'">
                <span class="news-card-category">${item.category || 'News'}</span>
                ${item.youtube_url ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${item.title}</h3>
                <div class="news-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(item.date)}</span>
                    <span><i class="far fa-user"></i> ${item.author || 'ABBAY'}</span>
                </div>
                <p class="news-card-excerpt">${truncate(item.description || item.summary || '', 120)}</p>
                <div class="news-card-footer">
                    <a href="${item.youtube_url || '#'}" class="read-more" target="_blank">
                        ${item.youtube_url ? 'Watch Video' : 'Read More'} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCategoryFilters() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            if (category === 'all') {
                renderNewsGrid(AppData.news);
            } else {
                const filtered = AppData.news.filter(item => item.category === category);
                renderNewsGrid(filtered);
                
                // Update stats
                document.getElementById('totalNewsCount').textContent = filtered.length;
            }
        });
    });
}

// ===== PROGRAMS PAGE LOADER =====
async function loadProgramsPage() {
    console.log('📺 Loading programs page...');
    
    const container = document.getElementById('programsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading programs...</div>';
    
    const programs = await loadJSON('programs.json');
    AppData.programs = sortByNewest(programs);
    
    if (AppData.programs.length === 0) {
        container.innerHTML = '<div class="error-state">No programs found</div>';
        return;
    }
    
    renderProgramsGrid(AppData.programs);
}

function renderProgramsGrid(items) {
    const container = document.getElementById('programsContainer');
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <div class="program-card">
            <div class="program-card-media">
                <img src="${item.image_url || 'https://via.placeholder.com/400x225/000/gold?text=PROGRAM'}" 
                     alt="${item.name || item.title}">
                <span class="program-category">${item.category || 'Show'}</span>
            </div>
            <div class="program-card-content">
                <h3 class="program-card-title">${item.name || item.title}</h3>
                <div class="program-card-host">
                    <i class="fas fa-microphone"></i> ${item.host || 'ABBAY TV'}
                </div>
                <div class="program-card-schedule">
                    <i class="far fa-clock"></i> ${item.schedule || 'Weekly'}
                </div>
                <p class="program-card-description">${truncate(item.description || '', 100)}</p>
                <a href="${item.youtube_url || '#'}" class="program-card-btn" target="_blank">
                    <i class="fas fa-play"></i> Watch
                </a>
            </div>
        </div>
    `).join('');
}

// ===== LIVE PAGE LOADER =====
async function loadLivePage() {
    console.log('🔴 Loading live page...');
    
    const live = await loadJSON('live.json');
    AppData.live = sortByNewest(live);
    
    renderLiveNow();
    renderUpcomingLive();
}

function renderLiveNow() {
    const container = document.getElementById('liveNowContainer');
    const section = document.getElementById('liveNowSection');
    
    if (!container || !section) return;
    
    const liveNow = AppData.live.filter(item => item.is_live === true);
    
    if (liveNow.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    document.getElementById('liveViewers').textContent = `${liveNow[0].viewers || '10K'} watching`;
    
    const embedUrl = liveNow[0].youtube_url?.replace('watch?v=', 'embed/') || '';
    
    container.innerHTML = `
        <div class="live-player">
            <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
        <div class="live-info">
            <h2>${liveNow[0].title}</h2>
            <p>${liveNow[0].description || 'Live now on ABBAY TV'}</p>
        </div>
    `;
}

function renderUpcomingLive() {
    const container = document.getElementById('upcomingContainer');
    if (!container) return;
    
    const upcoming = AppData.live.filter(item => !item.is_live).slice(0, 4);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="error-state">No upcoming streams</div>';
        return;
    }
    
    container.innerHTML = upcoming.map(item => `
        <div class="schedule-item">
            <div class="schedule-date">
                <span class="day">${new Date(item.schedule_date || Date.now()).getDate()}</span>
                <span class="month">${new Date(item.schedule_date || Date.now()).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div class="schedule-content">
                <h4>${item.title}</h4>
                <p><i class="far fa-clock"></i> ${new Date(item.schedule_date || Date.now()).toLocaleTimeString()}</p>
                <p>${truncate(item.description || '', 50)}</p>
            </div>
        </div>
    `).join('');
}

// ===== JOBS PAGE LOADER =====
async function loadJobsPage() {
    console.log('💼 Loading jobs page...');
    
    const container = document.getElementById('jobsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading jobs...</div>';
    
    const jobs = await loadJSON('jobs.json');
    AppData.jobs = sortByNewest(jobs);
    
    if (AppData.jobs.length === 0) {
        container.innerHTML = '<div class="error-state">No jobs available</div>';
        return;
    }
    
    document.getElementById('jobCount').textContent = AppData.jobs.length;
    renderJobsGrid(AppData.jobs);
    setupJobFilters();
}

function renderJobsGrid(items) {
    const container = document.getElementById('jobsContainer');
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <div class="job-card">
            <div class="job-header">
                <h2 class="job-title">${item.title}</h2>
                <span class="job-type">${item.type || 'Full-time'}</span>
            </div>
            <div class="job-details">
                <div><i class="fas fa-building"></i> ${item.company || 'ABBAY TV'}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${item.location || 'Addis Ababa'}</div>
                <div><i class="fas fa-money-bill-wave"></i> ${item.salary || 'Negotiable'}</div>
            </div>
            <p class="job-description">${truncate(item.description || '', 200)}</p>
            <div class="job-footer">
                <span class="deadline"><i class="far fa-hourglass"></i> Deadline: ${formatDate(item.deadline)}</span>
                <a href="${item.apply_link || 'contact.html'}" class="btn-apply">Apply Now</a>
            </div>
        </div>
    `).join('');
}

function setupJobFilters() {
    const filter = document.getElementById('jobTypeFilter');
    if (filter) {
        filter.addEventListener('change', function() {
            const type = this.value;
            if (type === 'all') {
                renderJobsGrid(AppData.jobs);
            } else {
                const filtered = AppData.jobs.filter(item => item.type === type);
                renderJobsGrid(filtered);
            }
        });
    }
}

// ===== CONTACT FORM =====
function initContactForm() {
    console.log('📧 Initializing contact form...');
    
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            subject: document.getElementById('subject')?.value || '',
            message: document.getElementById('message')?.value || '',
            date: new Date().toISOString(),
            status: 'unread'
        };
        
        console.log('Form submitted:', formData);
        
        // Show success message
        const messageDiv = document.getElementById('formMessage');
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="success">✅ Message sent successfully!</div>';
            form.reset();
            
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 5000);
        }
        
        // In a real static site, you'd use Formspree or Netlify Forms
        alert('Thank you for your message! (Demo mode - message saved to console)');
    });
}

// ===== MAKE FUNCTIONS GLOBAL =====
window.loadHomepage = loadHomepage;
window.loadNewsPage = loadNewsPage;
window.loadProgramsPage = loadProgramsPage;
window.loadLivePage = loadLivePage;
window.loadJobsPage = loadJobsPage;
window.initContactForm = initContactForm;