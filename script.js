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
    
    // Basic elements that should exist
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        appContainer: document.getElementById('appContainer')
    };

    // Try to find views
    views = {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    };

    // If main views don't exist, create them
    if (!views.home) {
        createMissingViews();
    }

    // Find other elements after views are created
    elements.navButtons = document.querySelectorAll('.nav-btn');
    elements.homeHeader = document.getElementById('homeHeader');
    elements.viewHeader = document.getElementById('viewHeader');
    elements.backBtn = document.getElementById('backBtn');
    elements.profileAvatar = document.getElementById('profileAvatar');
    elements.languageSelect = document.getElementById('languageSelect');
    elements.logoutBtn = document.getElementById('settingsLogoutBtn');
    elements.errorHomeBtn = document.getElementById('errorHomeBtn');
    elements.messageItems = document.querySelectorAll('.message-item');
    elements.externalIframe = document.getElementById('externalIframe');
    elements.aiIframe = document.getElementById('aiIframe');
    elements.bottomNav = document.getElementById('bottomNav');
    elements.viewTitle = document.getElementById('viewTitle');
    elements.searchInput = document.querySelector('.search-bar input');

    console.log('📋 DOM elements initialized');
}

function createMissingViews() {
    console.log('🛠️ Creating missing views...');
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('❌ main-content not found');
        return;
    }

    // Create basic view structure if it doesn't exist
    const viewStructure = `
        <!-- Home View -->
        <div class="view active" id="homeView">
            <div class="view-content">
                <div class="header" id="homeHeader">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search...">
                    </div>
                </div>
                <div class="stories-section">
                    <div class="story-item">
                        <div class="story-avatar"></div>
                        <div class="story-name">Yacine</div>
                    </div>
                </div>
                <div class="pages-section">
                    <div class="page-item" data-page-url="Yacine/index.html">
                        <div class="page-avatar"></div>
                        <div class="page-name">Yacine</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notifications View -->
        <div class="view" id="notificationsView">
            <div class="view-content">
                <div class="header" id="viewHeader">
                    <button class="back-btn-circle" id="backBtn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="header-title" id="viewTitle">Notifications</div>
                </div>
                <div class="notifications-list">
                    <div class="notification-item">No notifications</div>
                </div>
            </div>
        </div>

        <!-- Messages View -->
        <div class="view" id="messagesView">
            <div class="view-content">
                <div class="header" id="viewHeader">
                    <button class="back-btn-circle" id="backBtn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="header-title" id="viewTitle">Messages</div>
                </div>
                <div class="messages-list">
                    <div class="message-item" data-user="ai">
                        <div class="message-avatar"></div>
                        <div class="message-info">
                            <div class="message-name">UltraSpace AI</div>
                            <div class="message-preview">AI Assistant</div>
                        </div>
                    </div>
                    <div class="message-item" data-user="support">
                        <div class="message-avatar"></div>
                        <div class="message-info">
                            <div class="message-name">Support</div>
                            <div class="message-preview">Get help</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings View -->
        <div class="view" id="settingsView">
            <div class="view-content">
                <div class="header" id="viewHeader">
                    <button class="back-btn-circle" id="backBtn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="header-title" id="viewTitle">Settings</div>
                </div>
                <div class="settings-section">
                    <div class="settings-item" data-page="Profile/Profile.html">
                        <i class="fas fa-user"></i>
                        <span>Edit Profile</span>
                    </div>
                    <div class="settings-item" data-page="Ai/AI.html">
                        <i class="fas fa-robot"></i>
                        <span>UltraSpace AI</span>
                    </div>
                    <div class="settings-item" data-page="HCA.html">
                        <i class="fas fa-question-circle"></i>
                        <span>Help Center</span>
                    </div>
                    <div class="settings-item" id="settingsLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Chat View -->
        <div class="view" id="aiChatView">
            <div class="view-content">
                <div class="header" id="viewHeader">
                    <button class="back-btn-circle" id="backBtn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="header-title" id="viewTitle">UltraSpace AI</div>
                </div>
                <div class="iframe-container">
                    <iframe src="Ai/AI.html" class="ai-iframe" id="aiIframe"></iframe>
                </div>
            </div>
        </div>

        <!-- External Page View -->
        <div class="view" id="externalPageView">
            <div class="view-content">
                <div class="header" id="viewHeader">
                    <button class="back-btn-circle" id="backBtn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="header-title" id="viewTitle">External Page</div>
                </div>
                <div class="iframe-container">
                    <iframe src="" class="external-iframe" id="externalIframe"></iframe>
                </div>
            </div>
        </div>

        <!-- Error View -->
        <div class="view" id="errorView">
            <div class="view-content">
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Something went wrong</h2>
                    <p>Please try again later</p>
                    <button class="error-home-btn" id="errorHomeBtn">Go Home</button>
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = viewStructure;

    // Re-initialize views after creating them
    views = {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    };

    console.log('✅ Missing views created');
}

// ========== Add Custom Styles ==========

function addCustomStyles() {
    const styles = `
        /* Basic view management */
        .view {
            display: none;
            width: 100%;
            height: 100%;
        }
        
        .view.active {
            display: block;
        }

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
        }
        
        .back-btn-circle:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
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
        
        /* User profile card */
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
        }
        
        .user-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-name {
            font-weight: 700;
            color: var(--text-color);
            font-size: 1.3rem;
            margin-bottom: 5px;
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
        
        /* Popup modal */
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
        }
        
        .popup-content {
            background: var(--background-color);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
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
        
        /* Auth view */
        #authView {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 10000;
            background: var(--background-color);
        }
        
        .auth-iframe {
            width: 100%;
            height: 100vh;
            border: none;
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

        /* Bottom navigation */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--background-color);
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            z-index: 1000;
        }

        /* Header styles */
        .header {
            display: flex;
            align-items: center;
            padding: 15px;
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
            gap: 15px;
        }

        .header-title {
            font-weight: 600;
            font-size: 1.2rem;
        }

        /* Search bar */
        .search-bar {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            background: var(--input-background);
            border-radius: 20px;
            padding: 8px 15px;
            gap: 10px;
        }

        .search-bar input {
            border: none;
            background: none;
            outline: none;
            width: 100%;
            color: var(--text-color);
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
            }
        } catch (error) {
            // Error parsing user data
        }
    }
    
    // Clear invalid data
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    
    return false;
}

function createAuthView() {
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
    
    document.body.insertAdjacentHTML('beforeend', authHTML);
    
    // Setup auth message listener
    setupAuthIframeListener();
}

function setupAuthIframeListener() {
    function handleAuthMessage(event) {
        if (event.origin === 'https://yacine2007.github.io') {
            if (event.data && event.data.type === 'USER_AUTHENTICATED') {
                handleSuccessfulAuth();
            }
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
    appState.isAuthenticated = true;
    
    // Extract and save user avatar
    const user = getAuthenticatedUser();
    if (user && user.image) {
        appState.userAvatarUrl = user.image;
        localStorage.setItem('ultraspace_user_avatar_url', user.image);
    }
    
    // Remove auth view
    const authView = document.getElementById('authView');
    if (authView) {
        authView.remove();
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
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
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
    }
    
    // Update UI
    updateHeaderVisibility();
    updateBottomNavVisibility();
    updateViewTitle(viewId);
}

function updateHeaderVisibility() {
    if (!appState.isAuthenticated) return;
    
    const homeHeaders = document.querySelectorAll('#homeHeader');
    const viewHeaders = document.querySelectorAll('#viewHeader');
    
    if (appState.currentView === 'home') {
        homeHeaders.forEach(header => header.style.display = 'flex');
        viewHeaders.forEach(header => header.style.display = 'none');
        updateHomeHeader();
    } else {
        homeHeaders.forEach(header => header.style.display = 'none');
        viewHeaders.forEach(header => header.style.display = 'flex');
        updateViewHeader();
    }
}

function updateHomeHeader() {
    const homeHeader = document.querySelector('#homeHeader');
    if (!homeHeader) return;
    
    let searchBar = homeHeader.querySelector('.search-bar');
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
    }
}

function updateViewHeader() {
    const viewHeader = document.querySelector('#viewHeader');
    if (!viewHeader) return;
    
    // Update back buttons
    const backBtns = document.querySelectorAll('#backBtn');
    backBtns.forEach(btn => {
        if (!btn.classList.contains('enhanced')) {
            btn.classList.add('back-btn-circle');
            btn.classList.add('enhanced');
        }
    });
    
    // Update title
    updateViewTitle(appState.currentView);
}

function updateViewTitle(viewId) {
    const viewTitles = document.querySelectorAll('#viewTitle');
    viewTitles.forEach(title => {
        title.textContent = viewTitles[viewId] || 'View';
    });
}

function updateBottomNavVisibility() {
    if (!appState.isAuthenticated) return;
    
    const bottomNavs = document.querySelectorAll('.bottom-nav');
    const mobileViews = ['home', 'notifications', 'messages', 'settings'];
    
    if (appState.isMobile && mobileViews.includes(appState.currentView)) {
        bottomNavs.forEach(nav => nav.style.display = 'flex');
    } else {
        bottomNavs.forEach(nav => nav.style.display = 'none');
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
    
    updateSettingsProfile(user);
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
        <div class="popup-modal" id="logoutPopup">
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
    
    // Show popup with animation
    setTimeout(() => {
        const popup = document.getElementById('logoutPopup');
        if (popup) popup.style.display = 'flex';
    }, 10);
}

function closePopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) {
        popup.remove();
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
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = btn.dataset.view;
            if (viewId) switchView(viewId);
        });
    });
    
    // Back buttons
    const backBtns = document.querySelectorAll('#backBtn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', goBack);
    });
    
    // Logout button
    const logoutBtns = document.querySelectorAll('#settingsLogoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', showLogoutPopup);
    });
    
    // Error home button
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', () => switchView('home'));
    }
    
    // Message items
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            const userType = this.getAttribute('data-user');
            if (userType === 'ai') openAIChat();
            else if (userType === 'support') openHelpCenter();
        });
    });
    
    // Click listeners
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
}

// ========== App Initialization ==========

function initializeApp() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Add custom styles
    addCustomStyles();
    
    // Check authentication
    const isAuthenticated = checkBYPROAuthentication();
    
    if (isAuthenticated) {
        startMainApp();
    } else {
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
}

function showAuthScreen() {
    // Hide loading screen
    hideLoadingScreen();
    
    // Create auth view
    createAuthView();
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
    // Small delay to ensure all elements are loaded
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
