/* ==================================================
   ABBAY TV ETHIOPIA - MAIN APPLICATION LOGIC
   Black & Gold | Instagram Style | Full Functionality
   ================================================== */

// ===== GLOBAL STATE =====
const AppState = {
    settings: null,
    news: [],
    programs: [],
    live: [],
    jobs: [],
    currentSearch: '',
    searchResults: [],
    menuOpen: false,
    searchOpen: false
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        await loadSiteSettings();
        await loadAllContent();
        setupSearchFunctionality();
    } catch (error) {
        console.error('Init error:', error);
        showErrorMessage('Failed to load content');
    }
}

// ===== LOAD SITE SETTINGS =====
async function loadSiteSettings() {
    try {
        const response = await fetch('update.json');
        if (!response.ok) throw new Error('Settings not found');
        AppState.settings = await response.json();
    } catch (error) {
        console.warn('Using default settings');
        AppState.settings = {
            sort_order: "desc",
            homepage: {
                latest_news_limit: 6,
                latest_programs_limit: 4,
                latest_jobs_limit: 3
            }
        };
    }
}

// ===== LOAD ALL CONTENT =====
async function loadAllContent() {
    const [news, programs, live, jobs] = await Promise.all([
        fetchJSON('news.json'),
        fetchJSON('programs.json'),
        fetchJSON('live.json'),
        fetchJSON('jobs.json')
    ]);
    
    AppState.news = sortByNewest(news);
    AppState.programs = sortByNewest(programs);
    AppState.live = sortByNewest(live);
    AppState.jobs = sortByNewest(jobs);
    
    console.log('Content loaded:', {
        news: AppState.news.length,
        programs: AppState.programs.length,
        live: AppState.live.length,
        jobs: AppState.jobs.length
    });
}

async function fetchJSON(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) return [];
        const data = await response.json();
        return data.items || data;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

function sortByNewest(items) {
    return [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearchFunctionality() {
    const globalSearch = document.getElementById('globalSearch');
    const mobileSearch = document.getElementById('mobileSearch');
    const clearBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            AppState.currentSearch = query;
            
            if (query.length < 2) {
                searchResults.classList.remove('active');
                if (clearBtn) clearBtn.classList.remove('visible');
                return;
            }
            
            if (clearBtn) clearBtn.classList.add('visible');
            performSearch(query);
        });
    }
    
    if (mobileSearch) {
        mobileSearch.addEventListener('input', (e) => {
            performSearch(e.target.value.trim(), true);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (globalSearch) {
                globalSearch.value = '';
                globalSearch.focus();
            }
            clearBtn.classList.remove('visible');
            searchResults.classList.remove('active');
            AppState.currentSearch = '';
        });
    }
}

function performSearch(query, isMobile = false) {
    if (query.length < 2) {
        if (!isMobile) {
            document.getElementById('searchResults').classList.remove('active');
        } else {
            renderMobileSearchResults([]);
        }
        return;
    }
    
    const results = [];
    const searchLower = query.toLowerCase();
    
    // Search in news
    AppState.news.forEach(item => {
        if (matchesSearch(item, searchLower)) {
            results.push({
                ...item,
                type: 'news',
                url: `news.html?id=${item.id}`
            });
        }
    });
    
    // Search in programs
    AppState.programs.forEach(item => {
        if (matchesSearch(item, searchLower)) {
            results.push({
                ...item,
                type: 'program',
                url: `programs.html?id=${item.id}`
            });
        }
    });
    
    // Search in live
    AppState.live.forEach(item => {
        if (matchesSearch(item, searchLower)) {
            results.push({
                ...item,
                type: 'live',
                url: `live.html?id=${item.id}`
            });
        }
    });
    
    // Search in jobs
    AppState.jobs.forEach(item => {
        if (matchesSearch(item, searchLower)) {
            results.push({
                ...item,
                type: 'job',
                url: `jobs.html?id=${item.id}`
            });
        }
    });
    
    AppState.searchResults = results.slice(0, 10); // Limit to 10 results
    
    if (!isMobile) {
        renderSearchResults();
    } else {
        renderMobileSearchResults(results);
    }
}

function matchesSearch(item, searchLower) {
    const fields = [
        item.title,
        item.name,
        item.description,
        item.summary,
        item.content,
        item.category,
        item.host,
        item.company
    ];
    
    return fields.some(field => 
        field && field.toLowerCase().includes(searchLower)
    );
}

function renderSearchResults() {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (AppState.searchResults.length === 0) {
        container.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-title">No results found</div>
                <div class="search-result-category">Try different keywords</div>
            </div>
        `;
        container.classList.add('active');
        return;
    }
    
    container.innerHTML = AppState.searchResults.map(result => `
        <div class="search-result-item" onclick="window.location.href='${result.url}'">
            <div class="search-result-title">${escapeHtml(result.title || result.name)}</div>
            <div class="search-result-category">
                <span style="color: var(--gold);">${result.type}</span> • ${result.category || ''}
            </div>
            <div class="search-result-type">${truncate(result.description || result.summary || '', 60)}</div>
        </div>
    `).join('');
    
    container.classList.add('active');
}

function renderMobileSearchResults(results) {
    const container = document.getElementById('mobileSearchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-search"></i>
                <p>No results found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.slice(0, 20).map(result => `
        <div class="search-result-item" onclick="window.location.href='${result.url}'">
            <div class="search-result-title">${escapeHtml(result.title || result.name)}</div>
            <div class="search-result-category">${result.type} • ${result.category || ''}</div>
        </div>
    `).join('');
}

// ===== HOMEPAGE RENDERING =====
function loadHomepage() {
    const settings = AppState.settings?.homepage || {};
    
    // Render live stories
    renderLiveStories();
    
    // Render news feed
    renderNewsFeed(settings.latest_news_limit || 6);
    
    // Render programs feed
    renderProgramsFeed(settings.latest_programs_limit || 4);
    
    // Render jobs feed
    renderJobsFeed(settings.latest_jobs_limit || 3);
}

function renderLiveStories() {
    const container = document.getElementById('liveStories');
    if (!container) return;
    
    const liveItems = AppState.live.filter(item => item.is_live);
    
    if (liveItems.length === 0) {
        document.getElementById('liveStoriesSection').style.display = 'none';
        return;
    }
    
    document.getElementById('liveStoriesSection').style.display = 'block';
    
    container.innerHTML = liveItems.map(item => `
        <div class="story-item" onclick="window.location.href='live.html'">
            <div class="story-avatar live">
                <img src="${item.image_url || 'https://via.placeholder.com/80x80?text=LIVE'}" 
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/80x80?text=ABBAY'">
            </div>
            <div class="story-title">${truncate(item.title, 15)}</div>
            <div class="live-indicator">LIVE</div>
        </div>
    `).join('');
}

function renderNewsFeed(limit) {
    const container = document.getElementById('newsFeed');
    if (!container) return;
    
    const news = AppState.news.slice(0, limit);
    
    container.innerHTML = news.map(item => `
        <div class="feed-card" onclick="window.location.href='news.html?id=${item.id}'">
            <img src="${item.image_url || 'https://via.placeholder.com/300x300?text=NEWS'}" 
                 alt="${item.title}"
                 onerror="this.src='https://via.placeholder.com/300x300?text=ABBAY'">
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

function renderProgramsFeed(limit) {
    const container = document.getElementById('programsFeed');
    if (!container) return;
    
    const programs = AppState.programs.slice(0, limit);
    
    container.innerHTML = programs.map(item => `
        <div class="feed-card" onclick="window.location.href='programs.html?id=${item.id}'">
            <img src="${item.image_url || 'https://via.placeholder.com/300x300?text=PROGRAM'}" 
                 alt="${item.name || item.title}"
                 onerror="this.src='https://via.placeholder.com/300x300?text=ABBAY'">
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

function renderJobsFeed(limit) {
    const container = document.getElementById('jobsFeed');
    if (!container) return;
    
    const jobs = AppState.jobs.slice(0, limit);
    
    container.innerHTML = jobs.map(item => `
        <div class="job-mini-card" onclick="window.location.href='jobs.html?id=${item.id}'">
            <div class="job-mini-info">
                <h4>${item.title}</h4>
                <p><i class="fas fa-building"></i> ${item.company || 'ABBAY TV'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${item.location || 'Addis Ababa'}</p>
            </div>
            <div class="job-mini-type">${item.type || 'Full-time'}</div>
        </div>
    `).join('');
}

// ===== NEWS PAGE RENDERING =====
function loadNewsPage() {
    renderNewsGrid(AppState.news);
    setupCategoryFilters();
}

function renderNewsGrid(newsItems) {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    if (newsItems.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-newspaper"></i>
                <p>No news available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = newsItems.map(item => `
        <div class="news-card">
            <div class="news-card-media">
                <img src="${item.image_url || 'https://via.placeholder.com/400x225?text=NEWS'}" 
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/400x225?text=ABBAY+TV'">
                <span class="news-card-category">${item.category || 'News'}</span>
                ${item.youtube_url ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${item.title}</h3>
                <div class="news-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(item.date)}</span>
                    ${item.author ? `<span><i class="far fa-user"></i> ${item.author}</span>` : ''}
                </div>
                <p class="news-card-excerpt">${truncate(item.description || item.summary || item.content || '', 120)}</p>
                <div class="news-card-footer">
                    <a href="${item.youtube_url || '#'}" class="read-more" target="${item.youtube_url ? '_blank' : '_self'}">
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
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.dataset.category;
            if (category === 'all') {
                renderNewsGrid(AppState.news);
            } else {
                const filtered = AppState.news.filter(item => item.category === category);
                renderNewsGrid(filtered);
            }
        });
    });
}

// ===== PROGRAMS PAGE RENDERING =====
function loadProgramsPage() {
    const container = document.getElementById('programsContainer');
    if (!container) return;
    
    if (AppState.programs.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-tv"></i>
                <p>No programs available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.programs.map(item => `
        <div class="news-card">
            <div class="news-card-media">
                <img src="${item.image_url || 'https://via.placeholder.com/400x225?text=PROGRAM'}" 
                     alt="${item.name || item.title}"
                     onerror="this.src='https://via.placeholder.com/400x225?text=ABBAY+TV'">
                <span class="news-card-category">${item.category || 'Program'}</span>
                ${item.youtube_url ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${item.name || item.title}</h3>
                <div class="news-card-meta">
                    ${item.host ? `<span><i class="fas fa-microphone"></i> ${item.host}</span>` : ''}
                    <span><i class="far fa-clock"></i> ${item.schedule || 'Weekly'}</span>
                </div>
                <p class="news-card-excerpt">${truncate(item.description || '', 120)}</p>
                <div class="news-card-footer">
                    <a href="${item.youtube_url || '#'}" class="read-more" target="${item.youtube_url ? '_blank' : '_self'}">
                        ${item.youtube_url ? 'Watch Episode' : 'View Schedule'} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== LIVE PAGE RENDERING =====
function loadLivePage() {
    const liveNowContainer = document.getElementById('liveNowContainer');
    const upcomingContainer = document.getElementById('upcomingContainer');
    
    if (liveNowContainer) {
        const liveNow = AppState.live.filter(item => item.is_live);
        if (liveNow.length > 0) {
            renderLiveNow(liveNow[0], liveNowContainer);
        } else {
            document.getElementById('liveNowSection').style.display = 'none';
        }
    }
    
    if (upcomingContainer) {
        const upcoming = AppState.live.filter(item => !item.is_live);
        renderUpcomingLive(upcoming, upcomingContainer);
    }
}

function renderLiveNow(liveItem, container) {
    const embedUrl = liveItem.youtube_url?.replace('watch?v=', 'embed/') || '';
    
    container.innerHTML = `
        <div class="live-card">
            <div class="live-embed">
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="live-info">
                <h2>${liveItem.title}</h2>
                <p>${liveItem.description || 'Live now on ABBAY TV'}</p>
            </div>
        </div>
    `;
}

function renderUpcomingLive(upcoming, container) {
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="error-state">No upcoming streams</div>';
        return;
    }
    
    container.innerHTML = upcoming.map(item => `
        <div class="schedule-item">
            <div class="schedule-date">
                <span class="day">${new Date(item.schedule_date).getDate()}</span>
                <span class="month">${new Date(item.schedule_date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div class="schedule-content">
                <h4>${item.title}</h4>
                <p><i class="far fa-clock"></i> ${new Date(item.schedule_date).toLocaleTimeString()}</p>
                <p>${truncate(item.description || '', 60)}</p>
            </div>
        </div>
    `).join('');
}

// ===== JOBS PAGE RENDERING =====
function loadJobsPage() {
    const container = document.getElementById('jobsContainer');
    if (!container) return;
    
    if (AppState.jobs.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-briefcase"></i>
                <p>No jobs available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.jobs.map(item => `
        <div class="job-card">
            <div class="job-header">
                <h2 class="job-title">${item.title}</h2>
                <span class="job-type">${item.type || 'Full-time'}</span>
            </div>
            
            <div class="job-details">
                <div><i class="fas fa-building"></i> ${item.company || 'ABBAY TV'}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${item.location || 'Addis Ababa'}</div>
                <div><i class="fas fa-money-bill-wave"></i> ${item.salary || 'Negotiable'}</div>
                <div><i class="far fa-calendar"></i> Posted: ${formatDate(item.posted_date)}</div>
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
                    <i class="far fa-hourglass"></i> Deadline: ${formatDate(item.deadline)}
                </div>
                <a href="${item.apply_link || 'contact.html'}" class="btn-apply">
                    Apply Now <i class="fas fa-paper-plane"></i>
                </a>
            </div>
        </div>
    `).join('');
    
    setupJobFilters();
}

function setupJobFilters() {
    const filterSelect = document.getElementById('jobTypeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'all') {
                renderJobsGrid(AppState.jobs);
            } else {
                const filtered = AppState.jobs.filter(item => (item.type || item.job_type) === type);
                renderJobsGrid(filtered);
            }
        });
    }
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                id: Date.now(),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                date: new Date().toISOString(),
                status: 'unread'
            };
            
            // Save to localStorage (simulate storage)
            const messages = JSON.parse(localStorage.getItem('abbay_messages') || '[]');
            messages.push(formData);
            localStorage.setItem('abbay_messages', JSON.stringify(messages));
            
            // Show success
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Message sent successfully!';
            form.reset();
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        });
    }
}

// ===== UTILITY FUNCTIONS =====
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

function truncate(str, length) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showErrorMessage(message) {
    const containers = ['newsContainer', 'programsContainer', 'jobsContainer'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const overlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeSideMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSideMenu);
    }
    
    // Search toggle
    const searchToggle = document.getElementById('searchToggle');
    const closeSearch = document.getElementById('closeSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                document.getElementById('mobileSearch')?.focus();
            }, 300);
        });
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSideMenu();
            if (searchOverlay) searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function closeSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== PAGE-SPECIFIC LOADERS =====
window.loadHomepage = loadHomepage;
window.loadNewsPage = loadNewsPage;
window.loadProgramsPage = loadProgramsPage;
window.loadLivePage = loadLivePage;
window.loadJobsPage = loadJobsPage;
window.initContactForm = initContactForm;