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
    console.log('🔍 Initializing DOM elements...');
    
    // Basic elements
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

    // Views
    views = {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    };

    // Debug: Log found elements
    console.log('📋 Found elements:', {
        loadingScreen: !!elements.loadingScreen,
        appContainer: !!elements.appContainer,
        navButtons: elements.navButtons?.length || 0,
        homeHeader: !!elements.homeHeader,
        viewHeader: !!elements.viewHeader,
        homeView: !!views.home,
        settingsView: !!views.settings
    });
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
        
        /* Enhanced search bar with profile */
        .search-bar-enhanced {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 15px;
            width: 100%;
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
        .popup-modal {
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
        
        .popup-modal.active {
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
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        
        .popup-modal.active .popup-content {
            transform: translateY(0);
        }
        
        .popup-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-color);
        }
        
        .popup-message {
            margin-bottom: 25px;
            color: var(--text-muted);
            line-height: 1.5;
        }
        
        .popup-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .popup-btn {
            padding: 10px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 100px;
        }
        
        .popup-btn.cancel {
            background: var(--border-color);
            color: var(--text-color);
        }
        
        .popup-btn.confirm {
            background: var(--primary-color);
            color: white;
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
            display: none;
        }
        
        #authView.active {
            display: block;
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
        .view {
            display: none;
        }
        
        .view.active {
            display: block;
        }
        
        /* Mobile responsive */
        @media (max-width: 1024px) {
            #externalPageView iframe,
            #aiChatView iframe {
                height: calc(100vh - 60px) !important;
            }
        }
        
        @media (min-width: 1025px) {
            #externalPageView iframe,
            #aiChatView iframe {
                height: calc(100vh - 120px) !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    console.log('✅ Custom styles added');
}

// ========== Authentication System ==========

function checkBYPROAuthentication() {
    console.log('🔐 Checking authentication...');
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
                
                console.log('✅ User authenticated');
                return true;
            }
        } catch (error) {
            console.error('❌ Error parsing user data');
        }
    }
    
    // Clear invalid data
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    
    console.log('❌ User not authenticated');
    return false;
}

function createAuthView() {
    console.log('🔐 Creating auth view...');
    
    // Hide main app
    if (elements.appContainer) {
        elements.appContainer.style.display = 'none';
    }
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Create auth view
    const authHTML = `
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
    
    // Add to main content or body
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = authHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', authHTML);
    }
    
    views.auth = document.getElementById('authView');
    
    // Setup auth message listener
    setupAuthIframeListener();
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
            console.log('✅ User authenticated via message');
            handleSuccessfulAuth();
        }
    }
    
    window.addEventListener('message', handleAuthMessage);
    
    // Periodic check for authentication
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        }
    }, 1000);
    
    // Stop checking after 5 minutes
    setTimeout(() => {
        clearInterval(checkAuthInterval);
    }, 5 * 60 * 1000);
}

function handleSuccessfulAuth() {
    console.log('✅ Authentication successful, reloading...');
    appState.isAuthenticated = true;
    
    // Extract and save user avatar
    const user = getAuthenticatedUser();
    if (user && user.image) {
        appState.userAvatarUrl = user.image;
        localStorage.setItem('ultraspace_user_avatar_url', user.image);
    }
    
    // Reload page to initialize app properly
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function getAuthenticatedUser() {
    const userData = localStorage.getItem('bypro_user');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

// ========== View Management ==========

function switchView(viewId) {
    console.log(`🔄 Switching to view: ${viewId}`);
    
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
        console.log('🚫 User not authenticated, cannot switch views');
        return;
    }
    
    // Hide current view
    if (views[appState.currentView]) {
        views[appState.currentView].classList.remove('active');
    }
    
    // Show new view
    if (views[viewId]) {
        views[viewId].classList.add('active');
        appState.currentView = viewId;
        
        // Add to history
        const lastView = appState.viewHistory[appState.viewHistory.length - 1];
        if (lastView !== viewId) {
            appState.viewHistory.push(viewId);
        }
    } else {
        console.error(`❌ View ${viewId} not found`);
        return;
    }
    
    // Update navigation buttons
    updateNavButtons(viewId);
    
    // Update UI
    updateHeaderVisibility();
    updateBottomNavVisibility();
    updateViewTitle(viewId);
    
    console.log(`✅ Switched to ${viewId}`);
}

function updateNavButtons(activeView) {
    if (elements.navButtons) {
        elements.navButtons.forEach(btn => {
            const viewId = btn.dataset.view;
            if (viewId) {
                btn.classList.toggle('active', viewId === activeView);
            }
        });
    }
}

function updateHeaderVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
        return;
    }
    
    if (appState.currentView === 'home') {
        if (elements.homeHeader) {
            elements.homeHeader.style.display = 'flex';
            updateHomeHeader();
        }
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) {
            elements.viewHeader.style.display = 'flex';
            updateViewHeader();
        }
    }
}

function updateHomeHeader() {
    if (!elements.homeHeader) return;
    
    let searchBar = elements.homeHeader.querySelector('.search-bar');
    if (searchBar && !searchBar.classList.contains('enhanced')) {
        const user = getAuthenticatedUser();
        const avatarUrl = appState.userAvatarUrl || (user ? user.image : '');
        
        const enhancedHTML = `
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
        
        searchBar.outerHTML = enhancedHTML;
        searchBar.classList.add('enhanced');
    }
}

function updateViewHeader() {
    if (!elements.viewHeader) return;
    
    // Update back button
    if (elements.backBtn && !elements.backBtn.classList.contains('enhanced')) {
        elements.backBtn.classList.add('back-btn-circle');
        elements.backBtn.classList.add('enhanced');
        
        if (!elements.backBtn.querySelector('i')) {
            elements.backBtn.innerHTML = '<i class="fas fa-chevron-left" style="color: var(--text-color);"></i>';
        }
    }
    
    // Update title
    updateViewTitle(appState.currentView);
}

function updateViewTitle(viewId) {
    if (elements.viewTitle) {
        elements.viewTitle.textContent = viewTitles[viewId] || 'View';
    }
}

function updateBottomNavVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
        return;
    }
    
    const mobileViews = ['home', 'notifications', 'messages', 'settings'];
    if (appState.isMobile && mobileViews.includes(appState.currentView)) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'flex';
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
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

// ========== User Profile Management ==========

function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (!user) return;
    
    updateProfileAvatar(user);
    updateSettingsProfile(user);
}

function updateProfileAvatar(user) {
    if (elements.profileAvatar) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        elements.profileAvatar.src = avatarUrl || getDefaultAvatarUrl(user);
        elements.profileAvatar.alt = user.name || `User ${user.id}`;
        elements.profileAvatar.onerror = function() {
            this.src = getDefaultAvatarUrl(user);
        };
    }
}

function updateSettingsProfile(user) {
    const settingsSection = document.querySelector('.settings-section');
    if (!settingsSection) return;
    
    let profileCard = settingsSection.querySelector('.user-profile-card');
    
    if (!profileCard) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        const profileHTML = `
            <div class="user-profile-card">
                <div class="user-avatar-container">
                    <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                         alt="${user.name || 'User'}" 
                         class="user-avatar"
                         onerror="this.src='${getDefaultAvatarUrl(user)}'">
                </div>
                <div class="user-name">${user.name || `User ${user.id}`}</div>
                <div class="user-id">ID: ${user.id || 'N/A'}</div>
                <div class="user-email">${user.email || 'No email provided'}</div>
            </div>
        `;
        settingsSection.insertAdjacentHTML('afterbegin', profileHTML);
    }
}

function getDefaultAvatarUrl(user) {
    const name = user && user.name ? user.name : (user && user.id ? user.id : 'User');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3a86ff&color=fff`;
}

// ========== Popup Management ==========

function showLogoutPopup() {
    const popupHTML = `
        <div class="popup-modal active" id="logoutPopup">
            <div class="popup-content">
                <div class="popup-title">Logout</div>
                <div class="popup-message">Are you sure you want to logout?</div>
                <div class="popup-buttons">
                    <button class="popup-btn cancel" onclick="closePopup()">Cancel</button>
                    <button class="popup-btn confirm" onclick="confirmLogout()">Logout</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closePopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    }
}

function confirmLogout() {
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    
    closePopup();
    
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// ========== External Pages ==========

function loadExternalPage(url, title = 'Page') {
    if (!appState.isAuthenticated) return;
    
    if (elements.externalIframe) {
        elements.externalIframe.src = url;
        viewTitles.externalPage = title;
        switchView('externalPage');
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
    console.log('🎯 Setting up event listeners...');
    
    // Navigation buttons
    if (elements.navButtons) {
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = btn.dataset.view;
                if (viewId) switchView(viewId);
            });
        });
    }
    
    // Back button
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', goBack);
    }
    
    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', showLogoutPopup);
    }
    
    // Error home button
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', () => switchView('home'));
    }
    
    // Language select
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        elements.languageSelect.addEventListener('change', function() {
            appState.language = this.value;
            localStorage.setItem('language', this.value);
        });
    }
    
    // Message items
    if (elements.messageItems) {
        elements.messageItems.forEach(item => {
            item.addEventListener('click', function() {
                const userType = this.getAttribute('data-user');
                if (userType === 'ai') openAIChat();
                else if (userType === 'support') openHelpCenter();
            });
        });
    }
    
    // Click listeners for stories and pages
    document.addEventListener('click', (e) => {
        // Stories
        if (e.target.closest('.story-item')) {
            const story = e.target.closest('.story-item');
            const name = story.querySelector('.story-name')?.textContent;
            if (name === 'Yacine') openYacine();
        }
        
        // Pages
        if (e.target.closest('.page-item')) {
            const page = e.target.closest('.page-item');
            const url = page.getAttribute('data-page-url');
            const name = page.querySelector('.page-name')?.textContent;
            if (url) loadExternalPage(url, name);
            else if (name === 'Yacine') openYacine();
        }
        
        // Settings items
        if (e.target.closest('.settings-item[data-page]')) {
            const item = e.target.closest('.settings-item[data-page]');
            const url = item.getAttribute('data-page');
            const name = item.querySelector('span')?.textContent;
            
            if (url === 'Ai/AI.html') openAIChat();
            else if (url === 'Profile/Profile.html') openProfile();
            else if (url === 'HCA.html') openHelpCenter();
            else if (url) loadExternalPage(url, name);
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        appState.isMobile = window.innerWidth <= 1024;
        updateBottomNavVisibility();
    });
    
    console.log('✅ Event listeners setup complete');
}

// ========== App Initialization ==========

function initializeApp() {
    console.log('🚀 Initializing UltraSpace App...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Add custom styles
    addCustomStyles();
    
    // Check authentication
    const isAuthenticated = checkBYPROAuthentication();
    
    if (isAuthenticated) {
        console.log('✅ Starting main app...');
        startMainApp();
    } else {
        console.log('🔐 Showing auth screen...');
        showAuthScreen();
    }
}

function startMainApp() {
    // Hide loading screen
    hideLoadingScreen();
    
    // Show main app
    if (elements.appContainer) {
        elements.appContainer.style.display = 'block';
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Display user info
    displayUserInfo();
    
    // Update UI
    updateHeaderVisibility();
    updateBottomNavVisibility();
    
    // Start with home view
    switchView('home');
    
    console.log('🎉 Main app started successfully');
}

function showAuthScreen() {
    // Hide loading screen
    hideLoadingScreen();
    
    // Create auth view
    createAuthView();
    
    console.log('🔐 Auth screen shown');
}

function hideLoadingScreen() {
    if (elements.loadingScreen) {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (elements.loadingScreen && elements.loadingScreen.parentNode) {
                elements.loadingScreen.parentNode.removeChild(elements.loadingScreen);
            }
        }, 500);
    }
}

// ========== Start Application ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, starting app...');
    
    // Small delay to ensure all elements are loaded
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Global functions for HTML onclick attributes
window.openAIChat = openAIChat;
window.openProfile = openProfile;
window.openYacine = openYacine;
window.openHelpCenter = openHelpCenter;
window.loadExternalPage = loadExternalPage;
window.closePopup = closePopup;
window.confirmLogout = confirmLogout;
window.showLogoutPopup = showLogoutPopup;

// Export for debugging
window.UltraSpace = {
    appState,
    switchView,
    loadExternalPage,
    openAIChat,
    openProfile,
    logout: showLogoutPopup,
    getAuthenticatedUser
};

console.log('🤖 UltraSpace Enhancer loaded successfully');
