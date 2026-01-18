// ===== CONFIGURATION =====
const CONFIG = {
    itemsPerPage: 12,
    youtubeThumbnailBase: 'https://img.youtube.com/vi/',
    defaultThumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    logoUrl: 'https://tse3.mm.bing.net/th/id/OIP.ORz2qWwloYPBTWgHSTnCKAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    socialMedia: {
        facebook: 'https://facebook.com/abbaytv',
        youtube: 'https://youtube.com/@abbaytv',
        instagram: 'https://instagram.com/abbaytv',
        telegram: 'https://t.me/abbaytv'
    },
    autoRefreshInterval: 30000 // 30 seconds
};

// ===== STATE MANAGEMENT =====
let state = {
    currentPage: '',
    news: [],
    programs: [],
    liveStreams: [],
    jobs: [],
    currentFilter: 'all',
    currentCategory: '',
    currentSort: 'newest',
    isLoading: false,
    currentPageIndex: {
        news: 1,
        programs: 1,
        live: 1,
        jobs: 1
    },
    searchTerm: '',
    announcements: [
        "Welcome to Abbay TV Ethiopia - Your Premier Television Network",
        "Watch Live TV 24/7 - Never miss your favorite shows",
        "Check out our latest job opportunities",
        "New programs added every week"
    ],
    currentAnnouncement: 0
};

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Abbay TV Ethiopia - Initializing...');
    
    // Get current page
    state.currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Setup all functionalities
    setupHamburgerMenu();
    setActiveNavigation();
    setupSearch();
    setupModals();
    setupFilters();
    setupContactForm();
    setupBackToTop();
    setupAnnouncementRotator();
    setupSocialMedia();
    setupLoadMoreButtons();
    setupPagination();
    setupKeyboardShortcuts();
    
    // Load appropriate content based on page
    loadPageContent();
    
    // Start auto-refresh
    if (CONFIG.autoRefreshInterval > 0) {
        startAutoRefresh();
    }
    
    console.log('✅ Initialization complete - Current page:', state.currentPage);
});

// ===== ANNOUNCEMENT ROTATOR =====
function setupAnnouncementRotator() {
    const announcementElement = document.getElementById('announcement-text');
    if (!announcementElement) return;
    
    function rotateAnnouncement() {
        if (state.announcements.length === 0) return;
        
        announcementElement.textContent = state.announcements[state.currentAnnouncement];
        announcementElement.style.opacity = '0';
        
        setTimeout(() => {
            announcementElement.style.transition = 'opacity 0.5s';
            announcementElement.style.opacity = '1';
            
            state.currentAnnouncement = (state.currentAnnouncement + 1) % state.announcements.length;
        }, 500);
    }
    
    // Set initial announcement
    if (state.announcements.length > 0) {
        announcementElement.textContent = state.announcements[0];
    }
    
    // Rotate every 10 seconds
    setInterval(rotateAnnouncement, 10000);
}

// ===== HAMBURGER MENU FUNCTIONALITY =====
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                // Mobile view - show overlay menu
                if (mobileMenu) {
                    mobileMenu.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            } else {
                // Desktop view - toggle sidebar
                if (sidebar) {
                    sidebar.classList.toggle('active');
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        if (sidebar.classList.contains('active')) {
                            mainContent.style.marginLeft = '0';
                        } else {
                            mainContent.style.marginLeft = 'var(--sidebar-width)';
                        }
                    }
                }
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (mobileMenu) {
                mobileMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    const mobileLinks = document.querySelectorAll('.mobile-nav-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenu) {
                mobileMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                mobileMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (sidebar && sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !hamburger.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ===== NAVIGATION =====
function setActiveNavigation() {
    const currentPage = state.currentPage;
    const pageMap = {
        'index': 'index.html',
        'news': 'news.html',
        'programs': 'programs.html',
        'live': 'live.html',
        'jobs': 'jobs.html',
        'contact': 'contact.html'
    };
    
    const currentFile = pageMap[currentPage] || 'index.html';
    
    // Desktop navigation
    const navItems = document.querySelectorAll('.nav-item a');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        const parent = item.parentElement;
        
        if (href === currentFile) {
            parent.classList.add('active');
        } else {
            parent.classList.remove('active');
        }
    });
    
    // Mobile navigation
    const mobileItems = document.querySelectorAll('.mobile-nav-menu a');
    mobileItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentFile) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ===== PAGE CONTENT LOADING =====
function loadPageContent() {
    state.isLoading = true;
    showLoading();
    
    switch(state.currentPage) {
        case 'index':
            loadHomePage();
            break;
        case 'news':
            loadNewsPage();
            break;
        case 'programs':
            loadProgramsPage();
            break;
        case 'live':
            loadLivePage();
            break;
        case 'jobs':
            loadJobsPage();
            break;
        case 'contact':
            loadContactPage();
            break;
    }
}

async function loadHomePage() {
    try {
        // Load all data in parallel
        const [news, programs, live, jobs] = await Promise.all([
            loadJSONData('news'),
            loadJSONData('programs'),
            loadJSONData('live'),
            loadJSONData('jobs')
        ]);
        
        // Store in state
        state.news = news;
        state.programs = programs;
        state.liveStreams = live;
        state.jobs = jobs;
        
        // Update stats
        updateStatistics(jobs);
        
        // Display featured content
        displayFeaturedContent();
        
        // Hide loading
        hideLoading();
        
        console.log('🏠 Homepage loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading homepage data:', error);
        showError('Failed to load content. Please check your JSON files.');
    } finally {
        state.isLoading = false;
    }
}

function displayFeaturedContent() {
    // Featured News
    const featuredNews = state.news
        .filter(item => item.is_featured)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
    
    if (featuredNews.length > 0) {
        const container = document.getElementById('featured-news');
        if (container) {
            container.innerHTML = featuredNews.map(item => createNewsCard(item)).join('');
            attachVideoClickListeners(container);
        }
    }
    
    // Popular Programs
    const popularPrograms = state.programs
        .sort((a, b) => new Date(b.air_date) - new Date(a.air_date))
        .slice(0, 4);
    
    if (popularPrograms.length > 0) {
        const container = document.getElementById('popular-programs');
        if (container) {
            container.innerHTML = popularPrograms.map(item => createProgramCard(item)).join('');
            attachVideoClickListeners(container);
        }
    }
    
    // Live Now
    const liveNow = state.liveStreams
        .filter(item => item.is_live)
        .slice(0, 3);
    
    if (liveNow.length > 0) {
        const container = document.getElementById('live-now');
        if (container) {
            container.innerHTML = liveNow.map(item => createLiveCard(item)).join('');
            attachVideoClickListeners(container);
        }
    }
    
    // Job Highlights
    const jobHighlights = state.jobs
        .sort((a, b) => new Date(b.deadline || 0) - new Date(a.deadline || 0))
        .slice(0, 3);
    
    if (jobHighlights.length > 0) {
        const container = document.getElementById('job-highlights');
        if (container) {
            container.innerHTML = jobHighlights.map(item => createJobCard(item)).join('');
            attachJobClickListeners(container);
        }
    }
}

async function loadNewsPage() {
    const container = document.getElementById('news-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const news = await loadJSONData('news');
        state.news = news;
        
        if (news && news.length > 0) {
            // Populate category filter
            populateCategoryFilter('category-filter', news, 'category');
            
            // Display all news
            displayNews(news);
            updateCount('news-count', news.length);
        } else {
            container.innerHTML = createEmptyState('newspaper', 'No News Articles', 'Add news articles to news.json file');
        }
        
    } catch (error) {
        console.error('❌ Error loading news:', error);
        container.innerHTML = createEmptyState('exclamation-circle', 'Error Loading News', 'Failed to load news.json file');
    } finally {
        state.isLoading = false;
    }
}

async function loadProgramsPage() {
    const container = document.getElementById('programs-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const programs = await loadJSONData('programs');
        state.programs = programs;
        
        if (programs && programs.length > 0) {
            // Populate category filter
            populateCategoryFilter('category-filter', programs, 'category');
            
            // Display all programs
            displayPrograms(programs);
            updateCount('programs-count', programs.length);
        } else {
            container.innerHTML = createEmptyState('tv', 'No TV Programs', 'Add TV programs to programs.json file');
        }
        
    } catch (error) {
        console.error('❌ Error loading programs:', error);
        container.innerHTML = createEmptyState('exclamation-circle', 'Error Loading Programs', 'Failed to load programs.json file');
    } finally {
        state.isLoading = false;
    }
}

async function loadLivePage() {
    const container = document.getElementById('streams-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const liveStreams = await loadJSONData('live');
        state.liveStreams = liveStreams;
        
        if (liveStreams && liveStreams.length > 0) {
            // Display live streams
            displayLiveStreams(liveStreams);
            updateCount('streams-count', liveStreams.length);
            
            // Update live now count
            const liveNow = liveStreams.filter(item => item.is_live);
            updateCount('live-now-count', liveNow.length);
        } else {
            container.innerHTML = createEmptyState('satellite-dish', 'No Live Streams', 'Add live streams to live.json file');
        }
        
    } catch (error) {
        console.error('❌ Error loading live streams:', error);
        container.innerHTML = createEmptyState('exclamation-circle', 'Error Loading Live Streams', 'Failed to load live.json file');
    } finally {
        state.isLoading = false;
    }
}

async function loadJobsPage() {
    const container = document.getElementById('jobs-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const jobs = await loadJSONData('jobs');
        state.jobs = jobs;
        
        if (jobs && jobs.length > 0) {
            // Populate filters
            populateJobFilters(jobs);
            
            // Display all jobs
            displayJobs(jobs);
            updateCount('jobs-count', jobs.length);
            
            // Update statistics
            updateStatistics(jobs);
        } else {
            container.innerHTML = createEmptyState('briefcase', 'No Job Listings', 'Add job listings to jobs.json file');
        }
        
    } catch (error) {
        console.error('❌ Error loading jobs:', error);
        container.innerHTML = createEmptyState('exclamation-circle', 'Error Loading Jobs', 'Failed to load jobs.json file');
    } finally {
        state.isLoading = false;
    }
}

async function loadContactPage() {
    try {
        // Add social media links
        const socialContainer = document.getElementById('social-media');
        if (socialContainer) {
            socialContainer.innerHTML = `
                <a href="${CONFIG.socialMedia.facebook}" target="_blank" class="social-icon facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="${CONFIG.socialMedia.youtube}" target="_blank" class="social-icon youtube">
                    <i class="fab fa-youtube"></i>
                </a>
                <a href="${CONFIG.socialMedia.instagram}" target="_blank" class="social-icon instagram">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="${CONFIG.socialMedia.telegram}" target="_blank" class="social-icon twitter">
                    <i class="fab fa-telegram"></i>
                </a>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading contact page:', error);
    }
}

// ===== JSON DATA LOADING =====
async function loadJSONData(type) {
    const url = `${type}.json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${type}.json - Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate data is array
        if (!Array.isArray(data)) {
            console.warn(`⚠️ ${type}.json is not an array, converting to array`);
            return [data];
        }
        
        console.log(`✅ Loaded ${data.length} items from ${type}.json`);
        return data;
        
    } catch (error) {
        console.error(`❌ Error loading ${type}.json:`, error);
        // Return empty array instead of throwing to prevent page crash
        return [];
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayNews(news) {
    const container = document.getElementById('news-grid');
    if (!container) return;
    
    if (news.length === 0) {
        container.innerHTML = createEmptyState('newspaper', 'No News Found', 'Try changing your filters');
        return;
    }
    
    container.innerHTML = news.map(item => createNewsCard(item)).join('');
    attachVideoClickListeners(container);
}

function displayPrograms(programs) {
    const container = document.getElementById('programs-grid');
    if (!container) return;
    
    if (programs.length === 0) {
        container.innerHTML = createEmptyState('tv', 'No Programs Found', 'Try changing your filters');
        return;
    }
    
    container.innerHTML = programs.map(item => createProgramCard(item)).join('');
    attachVideoClickListeners(container);
}

function displayLiveStreams(streams) {
    const container = document.getElementById('streams-grid');
    if (!container) return;
    
    if (streams.length === 0) {
        container.innerHTML = createEmptyState('satellite-dish', 'No Streams Found', 'Try changing your filters');
        return;
    }
    
    container.innerHTML = streams.map(item => createLiveCard(item)).join('');
    attachVideoClickListeners(container);
}

function displayJobs(jobs) {
    const container = document.getElementById('jobs-grid');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = createEmptyState('briefcase', 'No Jobs Found', 'Try changing your filters');
        return;
    }
    
    container.innerHTML = jobs.map(item => createJobCard(item)).join('');
    attachJobClickListeners(container);
}

// ===== CARD CREATION =====
function createNewsCard(item) {
    const youtubeId = extractYouTubeId(item.youtube_url);
    const thumbnail = getThumbnailUrl(item, youtubeId);
    const date = item.date ? formatDate(item.date) : 'No date';
    const readTime = item.read_time || '3 min';
    const author = item.author || 'Abbay TV';
    
    return `
        <div class="card" data-youtube="${item.youtube_url || ''}" data-id="${item.id}">
            <div class="card-image">
                <img src="${thumbnail}" alt="${item.title}" loading="lazy">
                ${youtubeId ? '<div class="play-button"><i class="fas fa-play"></i></div>' : ''}
                ${item.is_featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description">${item.description || 'No description'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-tag"></i> ${item.category || 'General'}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                </div>
                <div class="card-meta">
                    <span><i class="fas fa-user"></i> ${author}</span>
                    <span><i class="fas fa-clock"></i> ${readTime}</span>
                </div>
            </div>
        </div>
    `;
}

function createProgramCard(item) {
    const youtubeId = extractYouTubeId(item.youtube_url);
    const thumbnail = getThumbnailUrl(item, youtubeId);
    const airDate = item.air_date ? formatDate(item.air_date) : 'No date';
    const duration = item.duration ? `${item.duration} min` : '';
    const episode = item.episode ? `Episode ${item.episode}` : '';
    
    return `
        <div class="card" data-youtube="${item.youtube_url || ''}" data-id="${item.id}">
            <div class="card-image">
                <img src="${thumbnail}" alt="${item.name}" loading="lazy">
                ${youtubeId ? '<div class="play-button"><i class="fas fa-play"></i></div>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name || 'Untitled'}</h3>
                <p class="card-description">${item.description || 'No description'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-tag"></i> ${item.category || 'General'}</span>
                    <span><i class="fas fa-clock"></i> ${airDate} ${duration ? '• ' + duration : ''}</span>
                </div>
                ${episode ? `<div class="card-meta"><span><i class="fas fa-list-ol"></i> ${episode}</span></div>` : ''}
            </div>
        </div>
    `;
}

function createLiveCard(item) {
    const thumbnail = getThumbnailUrl(item);
    const scheduleDate = item.schedule_date ? formatDate(item.schedule_date) : 'No schedule';
    
    return `
        <div class="card" data-youtube="${item.youtube_url || ''}" data-id="${item.id}">
            <div class="card-image">
                <img src="${thumbnail}" alt="${item.title}" loading="lazy">
                <div class="play-button"><i class="fas fa-play"></i></div>
                ${item.is_live ? '<div class="live-badge"><i class="fas fa-circle"></i> LIVE NOW</div>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description">${item.description || 'No description'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${scheduleDate}</span>
                    <span><i class="fas fa-circle"></i> ${item.is_live ? 'Live Now' : 'Upcoming'}</span>
                </div>
            </div>
        </div>
    `;
}

function createJobCard(item) {
    const deadline = item.deadline ? formatDate(item.deadline) : 'No deadline';
    const salary = item.salary ? `• ${item.salary}` : '';
    
    return `
        <div class="card" data-job-id="${item.id || ''}">
            <div class="card-content">
                <div class="card-meta" style="margin-bottom: 10px;">
                    ${item.logo_url ? `
                        <img src="${item.logo_url}" alt="${item.company}" style="width: 40px; height: 40px; border-radius: 5px; margin-right: 10px;">
                    ` : ''}
                    <span><i class="fas fa-building"></i> ${item.company || 'Unknown'}</span>
                </div>
                <h3 class="card-title">${item.title || 'Untitled'}</h3>
                <p class="card-description"><i class="fas fa-map-marker-alt"></i> ${item.location || 'Not specified'} ${salary}</p>
                <p class="card-description" style="-webkit-line-clamp: 2;">${item.description || 'No description'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-briefcase"></i> ${item.job_type || 'Not specified'}</span>
                    <span><i class="fas fa-clock"></i> ${deadline}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return '';
    
    // If it's already a YouTube ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
        return url;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^#&?]*)/,
        /youtube\.com\/live\/([^#&?]*)/,
        /youtube\.com\/shorts\/([^#&?]*)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return '';
}

function getThumbnailUrl(item, youtubeId = null) {
    // Priority: custom image_url > YouTube thumbnail > default thumbnail
    if (item.image_url && item.image_url.trim() !== '') {
        return item.image_url;
    }
    
    if (youtubeId === null) {
        youtubeId = extractYouTubeId(item.youtube_url);
    }
    
    if (youtubeId) {
        return `${CONFIG.youtubeThumbnailBase}${youtubeId}/hqdefault.jpg`;
    }
    
    return CONFIG.defaultThumbnail;
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('⚠️ Error formatting date:', dateString, error);
        return dateString;
    }
}

function populateCategoryFilter(filterId, items, fieldName = 'category') {
    const filter = document.getElementById(filterId);
    if (!filter) return;
    
    // Clear existing options except first
    while (filter.options.length > 1) {
        filter.remove(1);
    }
    
    // Get unique categories
    const categories = [...new Set(items
        .map(item => item[fieldName])
        .filter(Boolean)
        .sort())];
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

function populateJobFilters(jobs) {
    const typeFilter = document.getElementById('job-type-filter');
    const locationFilter = document.getElementById('location-filter');
    
    if (typeFilter) {
        const jobTypes = [...new Set(jobs
            .map(item => item.job_type)
            .filter(Boolean)
            .sort())];
        
        jobTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });
    }
    
    if (locationFilter) {
        const locations = [...new Set(jobs
            .map(item => item.location)
            .filter(Boolean)
            .sort())];
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }
}

function updateStatistics(jobs) {
    if (!jobs || !Array.isArray(jobs)) return;
    
    // Update job count
    const jobCountElement = document.getElementById('job-count');
    if (jobCountElement) {
        jobCountElement.textContent = jobs.length.toString();
    }
    
    // Update urgent jobs (deadline in next 7 days)
    const urgentJobsElement = document.getElementById('urgent-jobs');
    if (urgentJobsElement) {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const urgentJobs = jobs.filter(job => {
            if (!job.deadline) return false;
            try {
                const deadline = new Date(job.deadline);
                return deadline >= now && deadline <= nextWeek;
            } catch (e) {
                return false;
            }
        });
        
        urgentJobsElement.textContent = urgentJobs.length.toString();
    }
}

function updateCount(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    }
}

function createEmptyState(icon, title, message) {
    return `
        <div class="empty-state">
            <i class="fas fa-${icon}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// ===== EVENT LISTENER ATTACHMENT =====
function attachVideoClickListeners(container) {
    if (!container) return;
    
    container.querySelectorAll('.card[data-youtube]').forEach(card => {
        const youtubeUrl = card.getAttribute('data-youtube');
        if (!youtubeUrl) return;
        
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on links or buttons
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            const title = this.querySelector('.card-title')?.textContent || 'Video';
            openVideoModal(title, youtubeUrl);
        });
        
        card.style.cursor = 'pointer';
    });
}

function attachJobClickListeners(container) {
    if (!container) return;
    
    container.querySelectorAll('.card[data-job-id]').forEach(card => {
        const jobId = card.getAttribute('data-job-id');
        if (!jobId) return;
        
        card.addEventListener('click', async function(e) {
            // Don't trigger if clicking on links or buttons
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            try {
                const job = state.jobs.find(j => j.id && j.id.toString() === jobId);
                if (job) {
                    openJobModal(job);
                }
            } catch (error) {
                console.error('❌ Error loading job details:', error);
                showError('Failed to load job details');
            }
        });
        
        card.style.cursor = 'pointer';
    });
}

// ===== MODAL FUNCTIONS =====
function setupModals() {
    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const videoModal = document.getElementById('video-modal');
            if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            }
            
            const jobModal = document.getElementById('job-modal');
            if (jobModal && jobModal.style.display === 'flex') {
                closeJobModal();
            }
            
            const mobileMenu = document.querySelector('.mobile-menu-overlay');
            if (mobileMenu && mobileMenu.style.display === 'flex') {
                mobileMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
}

function openVideoModal(title, youtubeUrl) {
    const modal = document.getElementById('video-modal');
    const titleElement = document.getElementById('video-title');
    const player = document.getElementById('video-player');
    
    if (!modal || !titleElement || !player) {
        console.error('❌ Video modal elements not found');
        return;
    }
    
    titleElement.textContent = title;
    
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (youtubeId) {
        player.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    } else {
        console.warn('⚠️ No YouTube ID found for URL:', youtubeUrl);
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    if (player) {
        player.src = '';
    }
}

function openJobModal(job) {
    const modal = document.getElementById('job-modal');
    if (!modal) {
        console.error('❌ Job modal not found');
        return;
    }
    
    const modalContent = createJobModalContent(job);
    modal.innerHTML = modalContent;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeJobModal);
    }
    
    // Add event listener to apply button
    const applyBtn = modal.querySelector('.btn-primary');
    if (applyBtn && applyBtn.getAttribute('href')) {
        applyBtn.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('mailto:')) {
                e.preventDefault();
                window.location.href = this.getAttribute('href');
            }
        });
    }
}

function createJobModalContent(job) {
    const deadline = job.deadline ? formatDate(job.deadline) : 'No deadline';
    const requirements = job.requirements ? job.requirements.split('\n').filter(r => r.trim()) : [];
    
    return `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${job.title || 'Job Details'}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="job-detail-content">
                <div class="job-detail-header">
                    ${job.logo_url ? 
                        `<img src="${job.logo_url}" alt="${job.company}" class="company-logo">` : 
                        `<div class="company-logo" style="background: var(--primary-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
                            ${(job.company || 'A').charAt(0)}
                        </div>`
                    }
                    <div class="job-detail-info">
                        <h3>${job.title || 'Untitled'}</h3>
                        <div class="job-meta">
                            <span><i class="fas fa-building"></i> ${job.company || 'Unknown'}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${job.location || 'Not specified'}</span>
                            <span><i class="fas fa-clock"></i> ${job.job_type || 'Not specified'}</span>
                            ${job.salary ? `<span><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>` : ''}
                            ${job.deadline ? `<span><i class="fas fa-calendar-alt"></i> Deadline: ${deadline}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="job-detail-section">
                    <h4><i class="fas fa-align-left"></i> Job Description</h4>
                    <p>${job.description || 'No description available.'}</p>
                </div>
                
                ${requirements.length > 0 ? `
                <div class="job-detail-section">
                    <h4><i class="fas fa-tasks"></i> Requirements</h4>
                    <ul class="job-requirements">
                        ${requirements.map(req => `<li>${req.trim()}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="job-detail-section">
                    <h4><i class="fas fa-paper-plane"></i> How to Apply</h4>
                    <p>
                        ${job.apply_link ? 
                            `Apply by clicking the button below or send your application to: ${job.apply_link}` :
                            'To apply for this position, please contact us through our contact page.'
                        }
                    </p>
                    ${job.apply_link ? 
                        `<a href="${job.apply_link.startsWith('http') ? job.apply_link : 'mailto:' + job.apply_link}" 
                           class="btn btn-primary" 
                           ${job.apply_link.startsWith('http') ? 'target="_blank"' : ''}
                           style="margin-top: 20px;">
                            <i class="fas fa-external-link-alt"></i> Apply Now
                        </a>` : ''
                    }
                </div>
            </div>
        </div>
    `;
}

function closeJobModal() {
    const modal = document.getElementById('job-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modal.innerHTML = '';
    }
}

// ===== FILTERS =====
function setupFilters() {
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            state.currentCategory = e.target.value;
            filterContent();
        });
    }
    
    // Type filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
        typeFilter.addEventListener('change', function(e) {
            state.currentFilter = e.target.value;
            filterContent();
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function(e) {
            state.currentSort = e.target.value;
            filterContent();
        });
    }
    
    // Job-specific filters
    const jobTypeFilter = document.getElementById('job-type-filter');
    if (jobTypeFilter) {
        jobTypeFilter.addEventListener('change', function() {
            filterContent();
        });
    }
    
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
        locationFilter.addEventListener('change', function() {
            filterContent();
        });
    }
    
    // Reset filters button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetFilters();
        });
    }
    
    // Search filter
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(function(e) {
            state.searchTerm = e.target.value.toLowerCase();
            filterContent();
        }, 300));
    }
}

function resetFilters() {
    state.currentFilter = 'all';
    state.currentCategory = '';
    state.currentSort = 'newest';
    state.searchTerm = '';
    
    // Reset all filter inputs
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) categoryFilter.value = '';
    
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) typeFilter.value = 'all';
    
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) sortFilter.value = 'newest';
    
    const jobTypeFilter = document.getElementById('job-type-filter');
    if (jobTypeFilter) jobTypeFilter.value = 'all';
    
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) locationFilter.value = '';
    
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) searchFilter.value = '';
    
    filterContent();
}

function filterContent() {
    const page = state.currentPage;
    
    switch(page) {
        case 'news':
            filterNews();
            break;
        case 'programs':
            filterPrograms();
            break;
        case 'live':
            filterLive();
            break;
        case 'jobs':
            filterJobs();
            break;
        case 'index':
            // Homepage doesn't need filtering
            break;
    }
}

function filterNews() {
    if (!state.news || state.news.length === 0) return;
    
    let filtered = [...state.news];
    
    // Apply category filter
    if (state.currentCategory) {
        filtered = filtered.filter(item => 
            item.category && item.category.toLowerCase() === state.currentCategory.toLowerCase()
        );
    }
    
    // Apply type filter
    if (state.currentFilter === 'featured') {
        filtered = filtered.filter(item => item.is_featured);
    } else if (state.currentFilter === 'video') {
        filtered = filtered.filter(item => item.youtube_url);
    }
    
    // Apply search filter
    if (state.searchTerm) {
        filtered = filtered.filter(item => 
            (item.title && item.title.toLowerCase().includes(state.searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(state.searchTerm)) ||
            (item.category && item.category.toLowerCase().includes(state.searchTerm))
        );
    }
    
    // Apply sorting
    filtered = sortItems(filtered, state.currentSort, 'date');
    
    // Display filtered news
    displayNews(filtered);
    updateCount('news-count', filtered.length);
}

function filterPrograms() {
    if (!state.programs || state.programs.length === 0) return;
    
    let filtered = [...state.programs];
    
    // Apply category filter
    if (state.currentCategory) {
        filtered = filtered.filter(item => 
            item.category && item.category.toLowerCase() === state.currentCategory.toLowerCase()
        );
    }
    
    // Apply type filter
    if (state.currentFilter === 'series') {
        filtered = filtered.filter(item => item.episode);
    } else if (state.currentFilter === 'special') {
        filtered = filtered.filter(item => !item.episode);
    }
    
    // Apply search filter
    if (state.searchTerm) {
        filtered = filtered.filter(item => 
            (item.name && item.name.toLowerCase().includes(state.searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(state.searchTerm)) ||
            (item.category && item.category.toLowerCase().includes(state.searchTerm))
        );
    }
    
    // Apply sorting
    filtered = sortItems(filtered, state.currentSort, 'air_date');
    
    // Display filtered programs
    displayPrograms(filtered);
    updateCount('programs-count', filtered.length);
}

function filterLive() {
    if (!state.liveStreams || state.liveStreams.length === 0) return;
    
    let filtered = [...state.liveStreams];
    
    // Apply stream type filter
    if (state.currentFilter === 'live') {
        filtered = filtered.filter(item => item.is_live);
    } else if (state.currentFilter === 'upcoming') {
        filtered = filtered.filter(item => !item.is_live);
    }
    
    // Apply search filter
    if (state.searchTerm) {
        filtered = filtered.filter(item => 
            (item.title && item.title.toLowerCase().includes(state.searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(state.searchTerm))
        );
    }
    
    // Apply sorting
    filtered = sortItems(filtered, state.currentSort, 'schedule_date');
    
    // Display filtered streams
    displayLiveStreams(filtered);
    updateCount('streams-count', filtered.length);
    
    // Update live count
    const liveNow = filtered.filter(item => item.is_live);
    updateCount('live-now-count', liveNow.length);
}

function filterJobs() {
    if (!state.jobs || state.jobs.length === 0) return;
    
    let filtered = [...state.jobs];
    
    // Apply job type filter
    const jobTypeFilter = document.getElementById('job-type-filter');
    if (jobTypeFilter && jobTypeFilter.value !== 'all') {
        filtered = filtered.filter(item => 
            item.job_type && item.job_type.toLowerCase() === jobTypeFilter.value.toLowerCase()
        );
    }
    
    // Apply location filter
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter && locationFilter.value) {
        filtered = filtered.filter(item => 
            item.location && item.location.toLowerCase().includes(locationFilter.value.toLowerCase())
        );
    }
    
    // Apply search filter
    if (state.searchTerm) {
        filtered = filtered.filter(item => 
            (item.title && item.title.toLowerCase().includes(state.searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(state.searchTerm)) ||
            (item.company && item.company.toLowerCase().includes(state.searchTerm)) ||
            (item.location && item.location.toLowerCase().includes(state.searchTerm))
        );
    }
    
    // Apply sorting
    filtered = sortItems(filtered, state.currentSort, 'deadline');
    
    // Display filtered jobs
    displayJobs(filtered);
    updateCount('jobs-count', filtered.length);
}

function sortItems(items, sortType, dateField = 'date') {
    const sorted = [...items];
    
    switch(sortType) {
        case 'newest':
            return sorted.sort((a, b) => 
                new Date(b[dateField] || 0) - new Date(a[dateField] || 0)
            );
        case 'oldest':
            return sorted.sort((a, b) => 
                new Date(a[dateField] || 0) - new Date(b[dateField] || 0)
            );
        case 'az':
            return sorted.sort((a, b) => 
                (a.title || a.name || '').localeCompare(b.title || b.name || '')
            );
        case 'za':
            return sorted.sort((a, b) => 
                (b.title || b.name || '').localeCompare(a.title || a.name || '')
            );
        case 'deadline':
            return sorted.sort((a, b) => 
                new Date(a.deadline || 0) - new Date(b.deadline || 0)
            );
        default:
            return sorted;
    }
}

// ===== SEARCH =====
function setupSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function(e) {
        const term = e.target.value.toLowerCase().trim();
        
        if (term.length < 2) {
            // Reset to original content if search term is too short
            loadPageContent();
            return;
        }
        
        performSearch(term);
    }, 300));
}

function performSearch(term) {
    const page = state.currentPage;
    
    switch(page) {
        case 'index':
            searchAll(term);
            break;
        case 'news':
            searchNews(term);
            break;
        case 'programs':
            searchPrograms(term);
            break;
        case 'jobs':
            searchJobs(term);
            break;
        case 'live':
            searchLive(term);
            break;
    }
}

function searchAll(term) {
    // Search across all content types on homepage
    const newsResults = state.news.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
    
    const programResults = state.programs.filter(item => 
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
    
    const jobResults = state.jobs.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.company && item.company.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term))
    );
    
    const liveResults = state.liveStreams.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
    
    // Update homepage sections with search results
    updateHomepageWithSearchResults(newsResults, programResults, jobResults, liveResults);
}

function searchNews(term) {
    const filtered = state.news.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
    
    displayNews(filtered);
    updateCount('news-count', filtered.length);
}

function searchPrograms(term) {
    const filtered = state.programs.filter(item => 
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
    
    displayPrograms(filtered);
    updateCount('programs-count', filtered.length);
}

function searchJobs(term) {
    const filtered = state.jobs.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.company && item.company.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term))
    );
    
    displayJobs(filtered);
    updateCount('jobs-count', filtered.length);
}

function searchLive(term) {
    const filtered = state.liveStreams.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
    
    displayLiveStreams(filtered);
    updateCount('streams-count', filtered.length);
}

function updateHomepageWithSearchResults(newsResults, programResults, jobResults, liveResults) {
    // Featured News
    const featuredNewsContainer = document.getElementById('featured-news');
    if (featuredNewsContainer) {
        if (newsResults.length > 0) {
            featuredNewsContainer.innerHTML = newsResults.slice(0, 4).map(item => createNewsCard(item)).join('');
            attachVideoClickListeners(featuredNewsContainer);
        } else {
            featuredNewsContainer.innerHTML = createEmptyState('search', 'No News Found', 'Try a different search term');
        }
    }
    
    // Popular Programs
    const programsContainer = document.getElementById('popular-programs');
    if (programsContainer) {
        if (programResults.length > 0) {
            programsContainer.innerHTML = programResults.slice(0, 4).map(item => createProgramCard(item)).join('');
            attachVideoClickListeners(programsContainer);
        } else {
            programsContainer.innerHTML = createEmptyState('search', 'No Programs Found', 'Try a different search term');
        }
    }
    
    // Live Now
    const liveContainer = document.getElementById('live-now');
    if (liveContainer) {
        if (liveResults.length > 0) {
            liveContainer.innerHTML = liveResults.slice(0, 3).map(item => createLiveCard(item)).join('');
            attachVideoClickListeners(liveContainer);
        } else {
            liveContainer.innerHTML = createEmptyState('search', 'No Live Streams Found', 'Try a different search term');
        }
    }
    
    // Job Highlights
    const jobsContainer = document.getElementById('job-highlights');
    if (jobsContainer) {
        if (jobResults.length > 0) {
            jobsContainer.innerHTML = jobResults.slice(0, 3).map(item => createJobCard(item)).join('');
            attachJobClickListeners(jobsContainer);
        } else {
            jobsContainer.innerHTML = createEmptyState('search', 'No Jobs Found', 'Try a different search term');
        }
    }
}

// ===== CONTACT FORM =====
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            date: new Date().toISOString(),
            status: 'New'
        };
        
        // Validation
        if (!formData.name || !formData.email || !formData.message) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (formData.phone && !isValidPhone(formData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Save to localStorage (in real app, this would be an API call)
            await saveContactMessage(formData);
            
            showNotification('Message sent successfully! We will contact you soon.', 'success');
            contactForm.reset();
            
        } catch (error) {
            console.error('❌ Error submitting contact form:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

async function saveContactMessage(formData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    const messages = JSON.parse(localStorage.getItem('abbaytv_contact_messages') || '[]');
    messages.push({
        ...formData,
        id: Date.now().toString()
    });
    
    localStorage.setItem('abbaytv_contact_messages', JSON.stringify(messages));
    
    // In a real application, you would send this to your server
    console.log('📧 Contact message saved:', formData);
    
    return { success: true, message: 'Message saved locally' };
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation - adjust based on your needs
    const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// ===== SOCIAL MEDIA =====
function setupSocialMedia() {
    // Social media links are added in loadContactPage()
}

// ===== LOAD MORE BUTTONS =====
function setupLoadMoreButtons() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreContent();
        });
    }
}

function loadMoreContent() {
    const page = state.currentPage;
    const currentPageIndex = state.currentPageIndex[page] || 1;
    
    // Calculate items to show
    const itemsToShow = currentPageIndex * CONFIG.itemsPerPage;
    const allItems = getAllItemsForPage(page);
    
    if (itemsToShow >= allItems.length) {
        // Hide load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
        return;
    }
    
    // Show next batch of items
    const itemsToDisplay = allItems.slice(0, itemsToShow + CONFIG.itemsPerPage);
    
    switch(page) {
        case 'news':
            displayNews(itemsToDisplay);
            break;
        case 'programs':
            displayPrograms(itemsToDisplay);
            break;
        case 'live':
            displayLiveStreams(itemsToDisplay);
            break;
        case 'jobs':
            displayJobs(itemsToDisplay);
            break;
    }
    
    // Update page index
    state.currentPageIndex[page] = currentPageIndex + 1;
}

function getAllItemsForPage(page) {
    switch(page) {
        case 'news': return state.news;
        case 'programs': return state.programs;
        case 'live': return state.liveStreams;
        case 'jobs': return state.jobs;
        default: return [];
    }
}

// ===== PAGINATION =====
function setupPagination() {
    // Pagination is handled by load more button for now
    // In a more advanced version, you could implement numbered pagination
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + key combinations
        if (e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    window.location.href = 'index.html';
                    break;
                case 'n':
                    e.preventDefault();
                    window.location.href = 'news.html';
                    break;
                case 'p':
                    e.preventDefault();
                    window.location.href = 'programs.html';
                    break;
                case 'l':
                    e.preventDefault();
                    window.location.href = 'live.html';
                    break;
                case 'j':
                    e.preventDefault();
                    window.location.href = 'jobs.html';
                    break;
                case 'c':
                    e.preventDefault();
                    window.location.href = 'contact.html';
                    break;
                case 's':
                    e.preventDefault();
                    const searchInput = document.getElementById('global-search') || 
                                      document.getElementById('search-filter');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                    break;
            }
        }
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function showError(message) {
    console.error('❌ Error:', message);
    showNotification(message, 'error');
}

// ===== LOADING STATE =====
function showLoading() {
    // You could add a global loading spinner here
}

function hideLoading() {
    // Hide global loading spinner
}

// ===== BACK TO TOP =====
function setupBackToTop() {
    // Create back to top button if it doesn't exist
    if (!document.querySelector('.back-to-top')) {
        const backToTopBtn = document.createElement('div');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopBtn.title = 'Back to top';
        document.body.appendChild(backToTopBtn);
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });
}

// ===== AUTO REFRESH =====
function startAutoRefresh() {
    // Only auto-refresh on pages that need it
    if (['live', 'news', 'programs'].includes(state.currentPage)) {
        setInterval(async () => {
            if (state.isLoading) return;
            
            console.log('🔄 Auto-refreshing data...');
            
            try {
                await loadPageContent();
                showNotification('Content refreshed', 'success');
            } catch (error) {
                console.error('❌ Auto-refresh failed:', error);
            }
        }, CONFIG.autoRefreshInterval);
    }
}

// ===== UTILITY FUNCTIONS =====
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

// ===== INITIALIZATION COMPLETE =====
console.log('🚀 Abbay TV Ethiopia Website - Ready!');