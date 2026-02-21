// Global Variables
let siteSettings = {};
let allContent = {
    news: [],
    programs: [],
    live: [],
    jobs: [],
    messages: []
};

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    await loadSiteSettings();
    setupEventListeners();
    loadPageContent();
    setupBackToTop();
    checkActivePage();
}

// Load Site Settings
async function loadSiteSettings() {
    const settings = await loadJSON('update.json');
    if (settings && !settings.items) {
        siteSettings = settings;
        updateSocialLinks();
    }
}

// JSON Loading Function
async function loadJSON(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.items || data;
    } catch (error) {
        console.error('Error loading:', filename, error);
        showError('Failed to load content. Please refresh the page.');
        return [];
    }
}

// Page-Specific Content Loading
function loadPageContent() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(path) {
        case 'index.html':
            loadHomepage();
            break;
        case 'news.html':
            loadNewsPage();
            break;
        case 'programs.html':
            loadProgramsPage();
            break;
        case 'live.html':
            loadLivePage();
            break;
        case 'jobs.html':
            loadJobsPage();
            break;
        case 'contact.html':
            loadContactPage();
            setupContactForm();
            break;
        default:
            loadHomepage();
    }
}

// Homepage Loader
async function loadHomepage() {
    showSpinner();
    
    try {
        const [news, programs, live, jobs] = await Promise.all([
            loadJSON('news.json'),
            loadJSON('programs.json'),
            loadJSON('live.json'),
            loadJSON('jobs.json')
        ]);
        
        allContent = { news, programs, live, jobs };
        
        const container = document.getElementById('contentGrid');
        if (!container) return;
        
        let html = '';
        
        // Latest News Section
        if (news && news.length > 0) {
            const latestNews = sortByNewest(news).slice(0, siteSettings.homepage?.latest_news_limit || 6);
            html += '<div class="section-title">Latest News</div>';
            html += renderNewsCards(latestNews);
        }
        
        // Latest Programs Section
        if (programs && programs.length > 0) {
            const latestPrograms = sortByNewest(programs).slice(0, siteSettings.homepage?.latest_programs_limit || 4);
            html += '<div class="section-title">Popular Programs</div>';
            html += renderProgramCards(latestPrograms);
        }
        
        // Live Now Section
        if (live && live.length > 0) {
            const liveNow = live.filter(item => item.is_live);
            if (liveNow.length > 0) {
                html += '<div class="section-title">Live Now</div>';
                html += renderLiveCards(liveNow);
            }
        }
        
        // Latest Jobs Section
        if (jobs && jobs.length > 0) {
            const latestJobs = sortByNewest(jobs).slice(0, siteSettings.homepage?.latest_jobs_limit || 3);
            html += '<div class="section-title">Career Opportunities</div>';
            html += renderJobCards(latestJobs);
        }
        
        if (!html) {
            html = getEmptyStateHTML('No content available');
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading homepage:', error);
        showError('Failed to load homepage content');
    } finally {
        hideSpinner();
    }
}

// News Page Loader
async function loadNewsPage() {
    showSpinner();
    
    try {
        const news = await loadJSON('news.json');
        allContent.news = news;
        
        const container = document.getElementById('contentGrid');
        if (!container) return;
        
        if (news && news.length > 0) {
            const sortedNews = sortByNewest(news);
            container.innerHTML = renderNewsCards(sortedNews);
        } else {
            container.innerHTML = getEmptyStateHTML('No news available');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Failed to load news');
    } finally {
        hideSpinner();
    }
}

// Programs Page Loader
async function loadProgramsPage() {
    showSpinner();
    
    try {
        const programs = await loadJSON('programs.json');
        allContent.programs = programs;
        
        const container = document.getElementById('contentGrid');
        if (!container) return;
        
        if (programs && programs.length > 0) {
            const sortedPrograms = sortByNewest(programs);
            container.innerHTML = renderProgramCards(sortedPrograms);
        } else {
            container.innerHTML = getEmptyStateHTML('No programs available');
        }
    } catch (error) {
        console.error('Error loading programs:', error);
        showError('Failed to load programs');
    } finally {
        hideSpinner();
    }
}

// Live Page Loader
async function loadLivePage() {
    showSpinner();
    
    try {
        const live = await loadJSON('live.json');
        allContent.live = live;
        
        const container = document.getElementById('contentGrid');
        if (!container) return;
        
        if (live && live.length > 0) {
            const sortedLive = sortByNewest(live);
            container.innerHTML = renderLiveCards(sortedLive);
        } else {
            container.innerHTML = getEmptyStateHTML('No live streams available');
        }
    } catch (error) {
        console.error('Error loading live:', error);
        showError('Failed to load live streams');
    } finally {
        hideSpinner();
    }
}

// Jobs Page Loader
async function loadJobsPage() {
    showSpinner();
    
    try {
        const jobs = await loadJSON('jobs.json');
        allContent.jobs = jobs;
        
        const container = document.getElementById('contentGrid');
        if (!container) return;
        
        if (jobs && jobs.length > 0) {
            const sortedJobs = sortByNewest(jobs);
            container.innerHTML = renderJobCards(sortedJobs);
        } else {
            container.innerHTML = getEmptyStateHTML('No jobs available');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('Failed to load jobs');
    } finally {
        hideSpinner();
    }
}

// Contact Page Loader
async function loadContactPage() {
    try {
        const messages = await loadJSON('messages.json');
        allContent.messages = messages;
        
        const container = document.getElementById('messagesGrid');
        const spinner = document.getElementById('messagesSpinner');
        
        if (spinner) spinner.classList.remove('active');
        
        if (container && messages && messages.length > 0) {
            const sortedMessages = sortByNewest(messages).slice(0, 5);
            container.innerHTML = renderMessageCards(sortedMessages);
        } else if (container) {
            container.innerHTML = '<div class="empty-state">No messages yet</div>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// YouTube Thumbnail Extraction
function getYoutubeThumbnail(url) {
    if (!url) return '';
    
    try {
        let videoId = '';
        
        // Handle different YouTube URL formats
        if (url.includes('v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }
        
        if (!videoId) return '';
        
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } catch (error) {
        console.error('Error extracting YouTube thumbnail:', error);
        return '';
    }
}

// Sort by ID (newest first)
function sortByNewest(items) {
    if (!items || !Array.isArray(items)) return [];
    return [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
}

// Render Functions
function renderNewsCards(news) {
    if (!news || news.length === 0) return '';
    
    return news.map(item => `
        <div class="card" data-type="news" data-id="${item.id}" data-youtube="${item.youtube_url || ''}">
            <div class="card-media" onclick="openVideo('${item.youtube_url || ''}')">
                ${item.youtube_url ? 
                    `<img src="${getYoutubeThumbnail(item.youtube_url)}" alt="${item.title}">
                     <div class="play-overlay"><i class="fas fa-play"></i></div>` :
                    `<div class="fallback-media"><i class="fas fa-newspaper"></i></div>`
                }
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description">${item.description || ''}</p>
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> ${item.date || ''}</span>
                    <span><i class="fas fa-user"></i> ${item.author || ''}</span>
                </div>
                <span class="card-category">${item.category || 'News'}</span>
            </div>
        </div>
    `).join('');
}

function renderProgramCards(programs) {
    if (!programs || programs.length === 0) return '';
    
    return programs.map(item => `
        <div class="card" data-type="program" data-id="${item.id}" data-youtube="${item.youtube_url || ''}">
            <div class="card-media" onclick="openVideo('${item.youtube_url || ''}')">
                ${item.youtube_url ? 
                    `<img src="${getYoutubeThumbnail(item.youtube_url)}" alt="${item.name}">
                     <div class="play-overlay"><i class="fas fa-play"></i></div>` :
                    `<div class="fallback-media"><i class="fas fa-tv"></i></div>`
                }
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name || 'Untitled'}</h3>
                <p class="card-description">${item.description || ''}</p>
                <div class="card-meta">
                    <span><i class="fas fa-user"></i> ${item.host || ''}</span>
                    <span><i class="fas fa-clock"></i> ${item.schedule || ''}</span>
                </div>
                <span class="card-category">${item.category || 'Program'}</span>
            </div>
        </div>
    `).join('');
}

function renderLiveCards(live) {
    if (!live || live.length === 0) return '';
    
    return live.map(item => `
        <div class="card" data-type="live" data-id="${item.id}" data-youtube="${item.youtube_url || ''}">
            <div class="card-media" onclick="openVideo('${item.youtube_url || ''}')">
                ${item.youtube_url ? 
                    `<img src="${getYoutubeThumbnail(item.youtube_url)}" alt="${item.title}">
                     <div class="play-overlay"><i class="fas fa-play"></i></div>` :
                    `<div class="fallback-media"><i class="fas fa-circle"></i></div>`
                }
                ${item.is_live ? '<span class="live-badge"><span class="live-dot"></span> LIVE</span>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description">${item.description || ''}</p>
                <div class="card-meta">
                    <span><i class="fas fa-eye"></i> ${item.viewers || 0} viewers</span>
                    <span><i class="fas fa-clock"></i> ${formatSchedule(item.schedule_date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderJobCards(jobs) {
    if (!jobs || jobs.length === 0) return '';
    
    return jobs.map(item => `
        <div class="card" data-type="job" data-id="${item.id}">
            <div class="card-content">
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description">${item.description || ''}</p>
                <div class="card-meta">
                    <span><i class="fas fa-building"></i> ${item.company || ''}</span>
                    <span><i class="fas fa-map-marker"></i> ${item.location || ''}</span>
                    <span><i class="fas fa-briefcase"></i> ${item.type || ''}</span>
                </div>
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> Deadline: ${item.deadline || ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderMessageCards(messages) {
    if (!messages || messages.length === 0) return '';
    
    return messages.map(item => `
        <div class="message-card">
            <h3>${item.name || 'Anonymous'}</h3>
            <div class="message-meta">
                <span><i class="fas fa-envelope"></i> ${item.email || ''}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(item.date)}</span>
            </div>
            <p class="message-content">${item.message || ''}</p>
        </div>
    `).join('');
}

// Helper Functions
function formatSchedule(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function getEmptyStateHTML(message) {
    return `
        <div class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>${message}</p>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('contentGrid');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Video Functions
window.openVideo = function(youtubeUrl) {
    if (!youtubeUrl) {
        showToast('No video available');
        return;
    }
    
    try {
        let videoId = '';
        
        if (youtubeUrl.includes('v=')) {
            videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
        } else if (youtubeUrl.includes('youtu.be/')) {
            videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (youtubeUrl.includes('embed/')) {
            videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
        }
        
        if (!videoId) {
            showToast('Invalid video URL');
            return;
        }
        
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('youtubePlayer');
        
        if (modal && player) {
            player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error opening video:', error);
        showToast('Failed to open video');
    }
};

// Close Video Modal
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-modal') || 
        e.target.classList.contains('video-modal')) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('youtubePlayer');
        if (modal && player) {
            player.src = '';
            modal.classList.remove('active');
        }
    }
});

// Menu Functions
function setupEventListeners() {
    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeMenuFunction);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenuFunction);
    }
    
    function closeMenuFunction() {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    }
    
    // Search Toggle
    const searchToggle = document.getElementById('searchToggle');
    const closeSearch = document.getElementById('closeSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    const globalSearchInput = document.getElementById('globalSearchInput');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => globalSearchInput?.focus(), 100);
        });
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }
    
    // Global Search
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', debounce(performGlobalSearch, 300));
    }
    
    // Menu Search
    const menuSearchInput = document.getElementById('menuSearchInput');
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', debounce(performMenuSearch, 300));
    }
}

// Search Functions
function performGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) return;
    
    const results = [];
    
    // Search through all content
    Object.keys(allContent).forEach(key => {
        if (Array.isArray(allContent[key])) {
            allContent[key].forEach(item => {
                const searchableText = JSON.stringify(item).toLowerCase();
                if (searchableText.includes(query)) {
                    results.push({...item, type: key});
                }
            });
        }
    });
    
    displaySearchResults(results.slice(0, 10));
}

function performMenuSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    // Similar to global search but for menu context
    performGlobalSearch(e);
}

function displaySearchResults(results) {
    const container = document.getElementById('contentGrid');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = getEmptyStateHTML('No results found');
        return;
    }
    
    let html = '<h2 class="page-title">Search Results</h2>';
    
    // Group results by type
    const grouped = results.reduce((acc, item) => {
        acc[item.type] = acc[item.type] || [];
        acc[item.type].push(item);
        return acc;
    }, {});
    
    Object.keys(grouped).forEach(type => {
        html += `<div class="section-title">${type.toUpperCase()}</div>`;
        
        switch(type) {
            case 'news':
                html += renderNewsCards(grouped[type]);
                break;
            case 'programs':
                html += renderProgramCards(grouped[type]);
                break;
            case 'live':
                html += renderLiveCards(grouped[type]);
                break;
            case 'jobs':
                html += renderJobCards(grouped[type]);
                break;
        }
    });
    
    container.innerHTML = html;
}

// Contact Form
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            date: new Date().toISOString()
        };
        
        // Save to localStorage
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push(formData);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Show success message
        showToast('Message sent successfully!');
        
        // Clear form
        form.reset();
        
        // Refresh messages display
        loadContactPage();
    });
}

// Utility Functions
function showSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('active');
}

function hideSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('active');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function checkActivePage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = path.replace('.html', '');
    
    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === path) {
            item.classList.add('active');
        }
    });
}

function updateSocialLinks() {
    if (!siteSettings.social) return;
    
    document.querySelectorAll('.social-icon').forEach((icon, index) => {
        const platforms = ['facebook', 'youtube', 'telegram', 'twitter', 'instagram', 'tiktok'];
        const platform = platforms[index];
        if (platform && siteSettings.social[platform]) {
            icon.href = siteSettings.social[platform];
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add Section Title Styles
const style = document.createElement('style');
style.textContent = `
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--gold);
        margin: 2rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--gold);
        grid-column: 1 / -1;
    }
    
    .section-title:first-of-type {
        margin-top: 0;
    }
`;
document.head.appendChild(style);