// App State
const appState = {
    currentView: 'home',
    language: localStorage.getItem('language') || 'en',
    isLoading: false,
    viewHistory: ['home'],
    isAuthenticated: false,
    userAvatarUrl: localStorage.getItem('ultraspace_user_avatar_url') || '',
    currentPostId: null,
    isMobile: window.innerWidth <= 1024
};

// DOM Elements
let elements = {};
let views = {};

// View Titles
const viewTitles = {
    home: 'Home',
    notifications: 'Notifications',
    messages: 'Messages',
    settings: 'Settings',
    aiChat: 'UltraSpace AI',
    externalPage: 'Page',
    error: 'Error'
};

// ========== Initialize DOM Elements ==========

function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        appContainer: document.getElementById('appContainer'),
        navButtons: document.querySelectorAll('.nav-btn'),
        homeHeader: document.getElementById('homeHeader'),
        viewHeader: document.getElementById('viewHeader'),
        backBtn: document.getElementById('backBtn'),
        profileAvatar: document.getElementById('profileAvatar'),
        languageSelect: document.getElementById('languageSelect'),
        logoutBtn: document.getElementById('settingsLogoutBtn'),
        errorHomeBtn: document.getElementById('errorHomeBtn'),
        messageItems: document.querySelectorAll('.message-item'),
        externalIframe: document.getElementById('externalIframe'),
        aiIframe: document.getElementById('aiIframe'),
        bottomNav: document.getElementById('bottomNav'),
        viewTitle: document.getElementById('viewTitle'),
        searchInput: document.querySelector('.search-bar input')
    };

    views = {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    };
}

// ========== Add Custom Styles ==========

function addCustomStyles() {
    const styles = `
        .page-loading-indicator {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .page-loading-indicator.loading {
            animation: loadingProgress 1.5s ease-in-out infinite;
        }
        
        @keyframes loadingProgress {
            0% { transform: scaleX(0); }
            50% { transform: scaleX(0.7); }
            100% { transform: scaleX(0); }
        }
        
        .image-loading {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .image-loaded {
            opacity: 1;
        }
        
        .user-profile-card {
            text-align: center;
            padding: 25px 20px;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(135deg, rgba(58, 134, 255, 0.05), rgba(147, 51, 234, 0.05));
            margin-bottom: 15px;
        }
        
        .user-avatar-container {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            margin: 0 auto 15px;
            overflow: hidden;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .user-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .user-avatar:hover {
            transform: scale(1.05);
        }
        
        .user-name {
            font-weight: 700;
            color: var(--text-color);
            font-size: 1.3rem;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }
        
        .user-id {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 8px;
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.03);
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;
        }
        
        .user-email {
            font-size: 0.9rem;
            color: var(--primary-color);
            word-break: break-all;
            padding: 0 10px;
        }
        
        .back-btn-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--background-color);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .back-btn-circle:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
        }
        
        .back-btn-circle:hover i {
            color: white;
        }
        
        .search-bar-enhanced {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 15px;
        }
        
        .search-container {
            flex: 1;
            position: relative;
        }
        
        .avatar-mini {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-light);
            transition: all 0.3s ease;
        }
        
        .avatar-mini:hover {
            border-color: var(--primary-color);
            transform: scale(1.05);
        }
        
        .login-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(58, 134, 255, 0.4);
            z-index: 10000;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
            font-weight: 500;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-20px); }
        }

        .view.active {
            display: block !important;
            opacity: 1 !important;
        }
        
        .view:not(.active) {
            display: none !important;
        }

        .main-content {
            width: 100%;
            height: 100%;
        }

        #appContainer {
            display: block !important;
            opacity: 1 !important;
        }

        .iframe-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }

        #authView {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            z-index: 10000 !important;
            background: var(--background-color) !important;
        }
        
        .auth-container {
            width: 100%;
            height: 100vh;
            position: relative;
        }
        
        .auth-iframe {
            width: 100% !important;
            height: 100vh !important;
            border: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
        }

        #externalPageView .iframe-container,
        #aiChatView .iframe-container {
            width: 100%;
            height: calc(100vh - 120px);
            position: relative;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ========== Authentication System ==========

function checkBYPROAuthentication() {
    const userData = localStorage.getItem('bypro_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            if (user.id && user.password) {
                appState.isAuthenticated = true;
                
                if (user.image && user.image !== appState.userAvatarUrl) {
                    appState.userAvatarUrl = user.image;
                    localStorage.setItem('ultraspace_user_avatar_url', user.image);
                }
                
                return true;
            } else {
                localStorage.removeItem('bypro_user');
                localStorage.removeItem('ultraspace_user_avatar_url');
                appState.isAuthenticated = false;
                appState.userAvatarUrl = '';
                return false;
            }
        } catch (error) {
            localStorage.removeItem('bypro_user');
            localStorage.removeItem('ultraspace_user_avatar_url');
            appState.isAuthenticated = false;
            appState.userAvatarUrl = '';
            return false;
        }
    } else {
        appState.isAuthenticated = false;
        appState.userAvatarUrl = '';
        return false;
    }
}

function createAuthView() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            const newMainContent = document.createElement('div');
            newMainContent.className = 'main-content';
            appContainer.appendChild(newMainContent);
            mainContent = newMainContent;
        } else {
            return;
        }
    }
    
    hideAllUIElements();
    
    const authViewHTML = `
        <div class="view active" id="authView">
            <div class="view-content">
                <div class="auth-container">
                    <iframe 
                        src="https://yacine2007.github.io/secure-auth-app/login.html" 
                        class="auth-iframe" 
                        id="authIframe"
                        allow="camera; microphone; fullscreen"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = authViewHTML;
    views.auth = document.getElementById('authView');
    
    setupAuthIframeListener();
}

function hideAllUIElements() {
    if (elements.appContainer) {
        elements.appContainer.style.display = 'none';
    }
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';
    
    if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    
    if (elements.homeHeader) elements.homeHeader.style.display = 'none';
    if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    
    Object.values(views).forEach(view => {
        if (view && view.id !== 'authView') {
            view.style.display = 'none';
            view.classList.remove('active');
        }
    });
}

function showAllUIElements() {
    if (elements.appContainer) {
        elements.appContainer.style.display = 'block';
        elements.appContainer.style.opacity = '1';
    }
    
    updateHeaderVisibility();
    updateBottomNavVisibility();
    
    if (views[appState.currentView]) {
        views[appState.currentView].style.display = 'block';
        views[appState.currentView].classList.add('active');
    }
}

function setupAuthIframeListener() {
    function handleAuthMessage(event) {
        const allowedOrigins = [
            'https://yacine2007.github.io',
            window.location.origin,
            'https://ultraspace.wuaze.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
            return;
        }
        
        if (event.data && event.data.type === 'USER_AUTHENTICATED') {
            handleSuccessfulAuth();
        }
    }
    
    window.addEventListener('message', handleAuthMessage);
    
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        }
    }, 1000);
    
    setTimeout(() => {
        clearInterval(checkAuthInterval);
    }, 5 * 60 * 1000);
}

function handleSuccessfulAuth() {
    appState.isAuthenticated = true;
    extractAndSaveUserAvatar();
    showLoginNotification();
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

function showLoginNotification() {
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle" style="font-size: 1.1rem;"></i>
            <span>Successfully logged in to ultraspace.wuaze.com</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function extractAndSaveUserAvatar() {
    const user = getAuthenticatedUser();
    if (user && user.image) {
        appState.userAvatarUrl = user.image;
        localStorage.setItem('ultraspace_user_avatar_url', user.image);
    }
}

function getAuthenticatedUser() {
    const userData = localStorage.getItem('bypro_user');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('bypro_user');
        localStorage.removeItem('ultraspace_user_avatar_url');
        appState.isAuthenticated = false;
        appState.userAvatarUrl = '';
        window.location.reload();
    }
}

// ========== View Management ==========

function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
        return;
    }
    
    const currentActiveView = document.querySelector('.view.active');
    
    if (currentActiveView) {
        currentActiveView.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            currentActiveView.classList.remove('active');
            currentActiveView.style.display = 'none';
            currentActiveView.style.animation = '';
        }, 150);
    }
    
    setTimeout(() => {
        if (views[viewId]) {
            views[viewId].style.display = 'block';
            views[viewId].classList.add('active');
            appState.currentView = viewId;
            
            const lastView = appState.viewHistory[appState.viewHistory.length - 1];
            if (lastView !== viewId) {
                appState.viewHistory.push(viewId);
            }
        } else {
            if (views.home) {
                views.home.style.display = 'block';
                views.home.classList.add('active');
                appState.currentView = 'home';
            }
        }
        
        if (elements.navButtons) {
            elements.navButtons.forEach(btn => {
                if (btn.dataset.view) {
                    btn.classList.toggle('active', btn.dataset.view === viewId);
                }
            });
        }
        
        updateHeaderVisibility();
        updateBottomNavVisibility();
        updateViewTitle(viewId);
        updateViewHeader();
        
    }, 150);
}

function updateHeaderVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
        return;
    }
    
    const currentView = appState.currentView;
    
    if (currentView === 'home') {
        if (elements.homeHeader) {
            elements.homeHeader.style.display = 'flex';
            elements.homeHeader.style.opacity = '1';
        }
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) {
            elements.viewHeader.style.display = 'flex';
            elements.viewHeader.style.opacity = '1';
        }
    }
}

function updateBottomNavVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
        return;
    }
    
    const isMobile = appState.isMobile;
    const currentView = appState.currentView;
    
    if (isMobile && elements.bottomNav) {
        if (currentView === 'home' || currentView === 'notifications' || 
            currentView === 'messages' || currentView === 'settings') {
            elements.bottomNav.style.display = 'flex';
            elements.bottomNav.style.opacity = '1';
        } else {
            elements.bottomNav.style.display = 'none';
        }
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    }
}

function updateViewTitle(viewId) {
    if (elements.viewTitle) {
        elements.viewTitle.textContent = viewTitles[viewId] || 'View';
    }
}

function updateViewHeader() {
    const viewHeader = document.getElementById('viewHeader');
    if (!viewHeader) return;
    
    const backBtn = viewHeader.querySelector('#backBtn');
    if (backBtn && !backBtn.classList.contains('enhanced')) {
        backBtn.classList.add('back-btn-circle');
        backBtn.classList.add('enhanced');
        
        if (!backBtn.querySelector('i')) {
            backBtn.innerHTML = '<i class="fas fa-chevron-left" style="color: var(--text-color);"></i>';
        }
    }
    
    updateHomeHeader();
}

function updateHomeHeader() {
    const homeHeader = document.getElementById('homeHeader');
    if (!homeHeader) return;
    
    let searchBar = homeHeader.querySelector('.search-bar');
    
    if (searchBar && !searchBar.classList.contains('enhanced')) {
        searchBar.classList.add('enhanced');
        
        const user = getAuthenticatedUser();
        const avatarUrl = appState.userAvatarUrl || (user ? user.image : '');
        
        const enhancedSearchHTML = `
            <div class="search-bar-enhanced">
                <div class="search-container">
                    ${searchBar.innerHTML}
                </div>
                <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                     alt="Profile" 
                     class="avatar-mini"
                     onerror="this.src='${getDefaultAvatarUrl(user)}'"
                     onclick="openProfile()">
            </div>
        `;
        
        searchBar.outerHTML = enhancedSearchHTML;
    }
}

function goBack() {
    if (appState.viewHistory.length > 1) {
        appState.viewHistory.pop();
        const previousView = appState.viewHistory[appState.viewHistory.length - 1];
        switchView(previousView);
    } else {
        switchView('home');
    }
}

// ========== User Info Display ==========

function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (user) {
        updateProfileAvatar(user);
        updateEnhancedSettingsAvatar(user);
    }
}

function updateProfileAvatar(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        
        if (avatarUrl) {
            profileAvatar.classList.add('image-loading');
            profileAvatar.src = avatarUrl + '?t=' + Date.now();
            profileAvatar.alt = user.name || `User ${user.id}`;
            profileAvatar.onload = function() {
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
            profileAvatar.onerror = function() {
                this.classList.remove('image-loading');
                this.src = getDefaultAvatarUrl(user);
            };
        } else {
            profileAvatar.src = getDefaultAvatarUrl(user);
        }
        profileAvatar.alt = user.name || `User ${user.id}`;
    }
}

function getDefaultAvatarUrl(user) {
    const name = user && user.name ? user.name : (user && user.id ? user.id : 'User');
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=3a86ff&color=fff';
}

function updateEnhancedSettingsAvatar(user) {
    if (!user) return;
    
    let settingsSection = document.querySelector('.settings-section');
    if (!settingsSection) return;
    
    let userProfileCard = settingsSection.querySelector('.user-profile-card');
    
    if (!userProfileCard) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        const userProfileHTML = `
            <div class="user-profile-card">
                <div class="user-avatar-container">
                    <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                         alt="${user.name || 'User'}" 
                         class="user-avatar image-loading"
                         onload="this.classList.remove('image-loading'); this.classList.add('image-loaded');"
                         onerror="this.src='${getDefaultAvatarUrl(user)}'; this.classList.remove('image-loading'); this.classList.add('image-loaded');"
                         id="settingsAvatar">
                </div>
                <div class="user-name">${user.name || `User ${user.id}`}</div>
                <div class="user-id">ID: ${user.id || 'N/A'}</div>
                <div class="user-email">${user.email || 'No email provided'}</div>
            </div>
        `;
        settingsSection.insertAdjacentHTML('afterbegin', userProfileHTML);
    }
}

// ========== Iframe Management ==========

function setupIframeDimensions(iframe) {
    if (!iframe) return;
    
    const isMobile = appState.isMobile;
    
    if (isMobile) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = availableHeight + 'px';
    } else {
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '600px';
    }
    
    iframe.style.maxHeight = 'none';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0';
    iframe.style.width = '100%';
}

function setupIframeMessageListener() {
    window.addEventListener('message', function(event) {
        const allowedOrigins = [
            'https://yacine2007.github.io',
            window.location.origin,
            'https://ultraspace.wuaze.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        let originAllowed = false;
        for (const allowedOrigin of allowedOrigins) {
            if (event.origin === allowedOrigin || event.origin.startsWith(allowedOrigin)) {
                originAllowed = true;
                break;
            }
        }
        
        if (!originAllowed) return;
        
        if (event.data && event.data.type === 'POST_LOADED') {
            // Post loaded successfully
        }
        
        if (event.data && event.data.type === 'SHARE_LINK_REQUEST') {
            const postId = event.data.postId;
            const shareLink = generatePostShareLink(postId);
            
            event.source.postMessage({
                type: 'SHARE_LINK_RESPONSE',
                shareLink: shareLink
            }, event.origin);
        }
        
        if (event.data && event.data.type === 'OPEN_EXTERNAL_URL') {
            const url = event.data.url;
            window.open(url, '_blank');
        }
        
        if (event.data && event.data.type === 'RESIZE_IFRAME') {
            const height = event.data.height;
            if (elements.externalIframe) {
                elements.externalIframe.style.height = height + 'px';
            }
        }
    });
}

function generatePostShareLink(postId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?post=${postId}`;
}

async function loadExternalPage(url, title = 'Page') {
    if (!appState.isAuthenticated) return false;
    
    try {
        if (elements.externalIframe) {
            elements.externalIframe.style.opacity = '0';
            elements.externalIframe.style.transition = 'opacity 0.3s ease';
            
            elements.externalIframe.src = url;
            viewTitles.externalPage = title;
            
            elements.externalIframe.onload = function() {
                this.style.opacity = '1';
                setupIframeDimensions(this);
                
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('post');
                
                if (postId && url.includes('Yacine') && this.contentWindow) {
                    setTimeout(() => {
                        this.contentWindow.postMessage({
                            type: 'SHOW_POST',
                            postId: postId
                        }, '*');
                    }, 1000);
                }
            };
            
            elements.externalIframe.onerror = function() {
                this.style.opacity = '1';
                switchView('error');
            };
        }
        
        switchView('externalPage');
        return true;
        
    } catch (error) {
        switchView('error');
        return false;
    }
}

function openAIChat() {
    loadExternalPage('Ai/AI.html', 'UltraSpace AI');
}

function openYacine() {
    loadExternalPage('Yacine/index.html', 'Yacine');
}

function openProfile() {
    loadExternalPage('Profile/Profile.html', 'Edit Profile');
}

function openHelpCenter() {
    loadExternalPage('HCA.html', 'Help Center');
}

// ========== Message Items Click Handlers ==========

function setupMessageItemsClick() {
    if (elements.messageItems) {
        elements.messageItems.forEach(item => {
            item.addEventListener('click', function() {
                const userType = this.getAttribute('data-user');
                
                if (userType === 'ai') {
                    openAIChat();
                } else if (userType === 'support') {
                    openHelpCenter();
                }
            });
        });
    }
}

// ========== App Initialization ==========

function initializeApp() {
    initializeDOMElements();
    addCustomStyles();
    setupIframeMessageListener();
    
    const isAuthenticated = checkBYPROAuthentication();
    
    if (isAuthenticated) {
        startApp();
    } else {
        createAuthView();
    }
}

function startApp() {
    hideLoadingScreen();
    showAllUIElements();
    setupEventListeners();
    displayUserInfo();
    updateHeaderVisibility();
    updateBottomNavVisibility();
    updateViewHeader();
    switchView('home');
}

function setupEventListeners() {
    if (elements.navButtons) {
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const viewId = this.dataset.view;
                if (viewId) {
                    switchView(viewId);
                }
            });
        });
    }
    
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', goBack);
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', function() {
            switchView('home');
        });
    }
    
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        elements.languageSelect.addEventListener('change', function() {
            appState.language = this.value;
            localStorage.setItem('language', this.value);
        });
    }
    
    setupMessageItemsClick();
    setupClickListeners();
}

function setupClickListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.story-item')) {
            const storyItem = e.target.closest('.story-item');
            const storyName = storyItem.querySelector('.story-name')?.textContent;
            
            if (storyName === 'Yacine') {
                openYacine();
            }
        }
        
        if (e.target.closest('.page-item')) {
            const pageItem = e.target.closest('.page-item');
            const pageName = pageItem.querySelector('.page-name')?.textContent;
            const pageUrl = pageItem.getAttribute('data-page-url');
            
            if (pageUrl) {
                loadExternalPage(pageUrl, pageName);
            } else if (pageName === 'Yacine') {
                openYacine();
            }
        }
        
        if (e.target.closest('.settings-item[data-page]')) {
            const settingsItem = e.target.closest('.settings-item[data-page]');
            const pageUrl = settingsItem.getAttribute('data-page');
            const pageTitle = settingsItem.querySelector('span')?.textContent;
            
            if (pageUrl === 'Ai/AI.html') {
                openAIChat();
            } else if (pageUrl === 'Profile/Profile.html') {
                openProfile();
            } else if (pageUrl === 'HCA.html') {
                openHelpCenter();
            } else {
                loadExternalPage(pageUrl, pageTitle);
            }
        }
    });
}

function hideLoadingScreen() {
    if (elements.loadingScreen) {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (elements.loadingScreen.parentNode) {
                elements.loadingScreen.parentNode.removeChild(elements.loadingScreen);
            }
        }, 500);
    }
}

// ========== Start App ==========

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeApp();
    }, 100);
});

window.UltraSpace = {
    appState,
    switchView,
    loadExternalPage,
    openAIChat,
    openProfile,
    logout,
    getAuthenticatedUser
};
