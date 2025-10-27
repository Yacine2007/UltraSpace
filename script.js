// App State
const appState = {
    currentView: 'home',
    isAuthenticated: false,
    userAvatarUrl: ''
};

// DOM Elements
let elements = {};
let views = {};

// Initialize DOM Elements
function initializeDOMElements() {
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        appContainer: document.getElementById('appContainer'),
        navButtons: document.querySelectorAll('.nav-btn'),
        homeHeader: document.getElementById('homeHeader'),
        viewHeader: document.getElementById('viewHeader'),
        backBtn: document.getElementById('backBtn'),
        externalIframe: document.getElementById('externalIframe'),
        bottomNav: document.getElementById('bottomNav'),
        viewTitle: document.getElementById('viewTitle')
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

// Add Custom Styles
function addCustomStyles() {
    const styles = `
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

        .view.active {
            display: block !important;
        }
        
        .view:not(.active) {
            display: none !important;
        }

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

        #externalPageView iframe,
        #aiChatView iframe {
            width: 100%;
            height: calc(100vh - 120px);
            border: none;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Authentication System
function checkAuthentication() {
    const userData = localStorage.getItem('bypro_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.id && user.password) {
                appState.isAuthenticated = true;
                appState.userAvatarUrl = user.image || '';
                return true;
            }
        } catch (error) {
            // Authentication failed
        }
    }
    
    appState.isAuthenticated = false;
    return false;
}

function createAuthView() {
    // Hide all UI first
    if (elements.appContainer) {
        elements.appContainer.style.display = 'none';
    }
    
    // Create auth view
    const authHTML = `
        <div class="view active" id="authView">
            <div class="view-content">
                <div class="auth-container">
                    <iframe 
                        src="https://yacine2007.github.io/secure-auth-app/login.html" 
                        class="auth-iframe" 
                        id="authIframe"
                        allow="camera; microphone"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', authHTML);
    
    // Setup message listener for auth
    window.addEventListener('message', function(event) {
        if (event.origin === 'https://yacine2007.github.io') {
            if (event.data && event.data.type === 'USER_AUTHENTICATED') {
                handleSuccessfulAuth();
            }
        }
    });
}

function handleSuccessfulAuth() {
    appState.isAuthenticated = true;
    
    // Remove auth view
    const authView = document.getElementById('authView');
    if (authView) {
        authView.remove();
    }
    
    // Show main app
    if (elements.appContainer) {
        elements.appContainer.style.display = 'block';
    }
    
    // Reload to initialize app properly
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// View Management
function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
        return;
    }
    
    // Hide current view
    const currentView = views[appState.currentView];
    if (currentView) {
        currentView.classList.remove('active');
    }
    
    // Show new view
    const newView = views[viewId];
    if (newView) {
        newView.classList.add('active');
        appState.currentView = viewId;
    }
    
    updateHeaderVisibility();
    updateBottomNavVisibility();
}

function updateHeaderVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
        return;
    }
    
    if (appState.currentView === 'home') {
        if (elements.homeHeader) elements.homeHeader.style.display = 'flex';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'flex';
    }
}

function updateBottomNavVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
        return;
    }
    
    const mobileViews = ['home', 'notifications', 'messages', 'settings'];
    if (mobileViews.includes(appState.currentView)) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'flex';
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    }
}

function goBack() {
    switchView('home');
}

// External Pages
function loadExternalPage(url, title = 'Page') {
    if (!appState.isAuthenticated) return;
    
    if (elements.externalIframe) {
        elements.externalIframe.src = url;
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
    loadExternalPage('Profile/Profile.html', 'Profile');
}

function openHelpCenter() {
    loadExternalPage('HCA.html', 'Help Center');
}

// Event Listeners
function setupEventListeners() {
    // Navigation buttons
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
    
    // Back button
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', goBack);
    }
    
    // Message items
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            const userType = this.getAttribute('data-user');
            
            if (userType === 'ai') {
                openAIChat();
            } else if (userType === 'support') {
                openHelpCenter();
            }
        });
    });
    
    // Story items
    document.addEventListener('click', function(e) {
        if (e.target.closest('.story-item')) {
            const storyItem = e.target.closest('.story-item');
            const storyName = storyItem.querySelector('.story-name')?.textContent;
            
            if (storyName === 'Yacine') {
                openYacine();
            }
        }
        
        // Page items
        if (e.target.closest('.page-item')) {
            const pageItem = e.target.closest('.page-item');
            const pageUrl = pageItem.getAttribute('data-page-url');
            
            if (pageUrl) {
                loadExternalPage(pageUrl, pageItem.querySelector('.page-name')?.textContent);
            }
        }
        
        // Settings items
        if (e.target.closest('.settings-item[data-page]')) {
            const settingsItem = e.target.closest('.settings-item[data-page]');
            const pageUrl = settingsItem.getAttribute('data-page');
            
            if (pageUrl === 'Ai/AI.html') {
                openAIChat();
            } else if (pageUrl === 'Profile/Profile.html') {
                openProfile();
            } else if (pageUrl === 'HCA.html') {
                openHelpCenter();
            } else {
                loadExternalPage(pageUrl, settingsItem.querySelector('span')?.textContent);
            }
        }
    });
}

// Initialize App
function initializeApp() {
    initializeDOMElements();
    addCustomStyles();
    
    const isAuthenticated = checkAuthentication();
    
    if (isAuthenticated) {
        // User is authenticated - start main app
        if (elements.loadingScreen) {
            elements.loadingScreen.style.display = 'none';
        }
        if (elements.appContainer) {
            elements.appContainer.style.display = 'block';
        }
        
        setupEventListeners();
        updateHeaderVisibility();
        updateBottomNavVisibility();
        switchView('home');
        
    } else {
        // User not authenticated - show login
        if (elements.loadingScreen) {
            elements.loadingScreen.style.display = 'none';
        }
        createAuthView();
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global functions for HTML onclick
window.openAIChat = openAIChat;
window.openProfile = openProfile;
window.openYacine = openYacine;
window.openHelpCenter = openHelpCenter;
window.loadExternalPage = loadExternalPage;
