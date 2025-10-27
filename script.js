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
    externalPage: 'External Page',
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
        /* Enhanced back button */
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
        
        /* Enhanced search bar with avatar */
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
            cursor: pointer;
        }
        
        .avatar-mini:hover {
            border-color: var(--primary-color);
            transform: scale(1.05);
        }
        
        /* User profile card in settings */
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
        
        /* Custom popup modal */
        .custom-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .custom-popup.active {
            opacity: 1;
            visibility: visible;
        }
        
        .popup-content {
            background: var(--background-color);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .custom-popup.active .popup-content {
            transform: scale(1);
        }
        
        .popup-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-color);
        }
        
        .popup-message {
            margin-bottom: 20px;
            color: var(--text-muted);
            line-height: 1.5;
        }
        
        .popup-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .popup-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 100px;
        }
        
        .popup-btn.confirm {
            background: var(--primary-color);
            color: white;
        }
        
        .popup-btn.confirm:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        
        .popup-btn.cancel {
            background: var(--border-color);
            color: var(--text-color);
        }
        
        .popup-btn.cancel:hover {
            background: var(--text-muted);
            color: white;
        }
        
        /* Full screen iframe */
        .iframe-fullscreen {
            width: 100%;
            height: 100vh;
            border: none;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
        }
        
        /* Auth view styles */
        #authView {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 10000;
            background: var(--background-color);
        }
        
        .auth-container {
            width: 100%;
            height: 100vh;
        }
        
        .auth-iframe {
            width: 100%;
            height: 100vh;
            border: none;
        }
        
        /* View management */
        .view.active {
            display: block !important;
        }
        
        .view:not(.active) {
            display: none !important;
        }
        
        /* Mobile and desktop responsive */
        @media (max-width: 1024px) {
            .search-bar-enhanced {
                padding: 0 10px;
            }
            
            .user-profile-card {
                padding: 20px 15px;
            }
        }
        
        @media (min-width: 1025px) {
            .search-bar-enhanced {
                max-width: 500px;
                margin: 0 auto;
            }
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
    
    document.querySelector('.main-content').innerHTML = authViewHTML;
    
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
    updateViewHeader();
    
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
            'https://ultraspace.wuaze.com'
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
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
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

// ========== Custom Popup System ==========

function showCustomPopup(title, message, confirmCallback, cancelCallback) {
    const popupHTML = `
        <div class="custom-popup active" id="customPopup">
            <div class="popup-content">
                <div class="popup-title">${title}</div>
                <div class="popup-message">${message}</div>
                <div class="popup-buttons">
                    <button class="popup-btn cancel" onclick="closeCustomPopup()">Cancel</button>
                    <button class="popup-btn confirm" onclick="handleConfirm()">Confirm</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    window.handleConfirm = function() {
        if (confirmCallback) confirmCallback();
        closeCustomPopup();
    };
}

function closeCustomPopup() {
    const popup = document.getElementById('customPopup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

function logout() {
    showCustomPopup(
        'Logout Confirmation',
        'Are you sure you want to logout?',
        function() {
            localStorage.removeItem('bypro_user');
            localStorage.removeItem('ultraspace_user_avatar_url');
            appState.isAuthenticated = false;
            appState.userAvatarUrl = '';
            window.location.reload();
        }
    );
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
            profileAvatar.src = avatarUrl + '?t=' + Date.now();
            profileAvatar.alt = user.name || `User ${user.id}`;
            profileAvatar.onerror = function() {
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
                         class="user-avatar"
                         onerror="this.src='${getDefaultAvatarUrl(user)}'"
                         id="settingsAvatar">
                </div>
                <div class="user-name">${user.name || `User ${user.id}`}</div>
                <div class="user-id">ID: ${user.id || 'N/A'}</div>
                <div class="user-email">${user.email || 'No email provided'}</div>
            </div>
        `;
        settingsSection.insertAdjacentHTML('afterbegin', userProfileHTML);
    } else {
        const avatar = userProfileCard.querySelector('#settingsAvatar');
        const name = userProfileCard.querySelector('.user-name');
        const userId = userProfileCard.querySelector('.user-id');
        const email = userProfileCard.querySelector('.user-email');
        
        if (avatar) {
            avatar.src = (appState.userAvatarUrl || user.image) + '?t=' + Date.now();
            avatar.onerror = function() {
                this.src = getDefaultAvatarUrl(user);
            };
        }
        if (name) name.textContent = user.name || `User ${user.id}`;
        if (userId) userId.textContent = `ID: ${user.id || 'N/A'}`;
        if (email) email.textContent = user.email || 'No email provided';
    }
}

// ========== Iframe Management ==========

function setupIframeDimensions(iframe) {
    if (!iframe) return;
    
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '9999';
}

function setupIframeMessageListener() {
    window.addEventListener('message', function(event) {
        const allowedOrigins = [
            'https://yacine2007.github.io',
            window.location.origin,
            'https://ultraspace.wuaze.com'
        ];
        
        let originAllowed = false;
        for (const allowedOrigin of allowedOrigins) {
            if (event.origin === allowedOrigin || event.origin.startsWith(allowedOrigin)) {
                originAllowed = true;
                break;
            }
        }
        
        if (!originAllowed) return;
        
        if (event.data && event.data.type === 'SHARE_LINK_REQUEST') {
            const postId = event.data.postId;
            const shareLink = generatePostShareLink(postId);
            
            event.source.postMessage({
                type: 'SHARE_LINK_RESPONSE',
                shareLink: shareLink
            }, event.origin);
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
            elements.externalIframe.className = 'iframe-fullscreen';
            elements.externalIframe.src = url;
            viewTitles.externalPage = title;
            
            elements.externalIframe.onload = function() {
                setupIframeDimensions(this);
            };
            
            elements.externalIframe.onerror = function() {
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

// ========== Event Listeners ==========

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

// ========== Start App ==========

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Global functions
window.openAIChat = openAIChat;
window.openProfile = openProfile;
window.openYacine = openYacine;
window.openHelpCenter = openHelpCenter;
window.loadExternalPage = loadExternalPage;
window.logout = logout;
window.closeCustomPopup = closeCustomPopup;
window.switchView = switchView;
