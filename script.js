
// حالة التطبيق
const appState = {
    currentView: 'home',
    language: localStorage.getItem('language') || 'en',
    isLoading: false,
    viewHistory: ['home'],
    isAuthenticated: false,
    userAvatarUrl: localStorage.getItem('ultraspace_user_avatar_url') || '',
    currentPostId: null
};

// عناصر DOM
const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    appContainer: document.getElementById('appContainer'),
    navButtons: document.querySelectorAll('.nav-btn'),
    views: {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    },
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
    viewTitle: document.getElementById('viewTitle')
};

// عناوين الواجهات
const viewTitles = {
    home: 'Home',
    notifications: 'Notifications',
    messages: 'Messages',
    settings: 'Settings',
    aiChat: 'UltraSpace AI',
    externalPage: 'External Page',
    error: 'Error'
};

// ========== نظام المصادقة ==========

function checkBYPROAuthentication() {
    console.log('🔍 Checking B.Y PRO authentication...');
    
    const userData = localStorage.getItem('bypro_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ Found B.Y PRO user data');
            
            if (user.id && user.password) {
                appState.isAuthenticated = true;
                
                if (user.image && user.image !== appState.userAvatarUrl) {
                    appState.userAvatarUrl = user.image;
                    localStorage.setItem('ultraspace_user_avatar_url', user.image);
                }
                
                return true;
            }
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
        }
    }
    
    // تنظيف البيانات في حالة الفشل
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    return false;
}

function createAuthView() {
    const mainContent = document.querySelector('.main-content');
    
    const authViewHTML = `
        <div class="view active" id="authView">
            <div class="view-content">
                <div class="auth-container">
                    <iframe 
                        src="https://yacine2007.github.io/secure-auth-app/login.html" 
                        class="auth-iframe" 
                        id="authIframe"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', authViewHTML);
    elements.views.auth = document.getElementById('authView');
    setupAuthIframeListener();
}

function setupAuthIframeListener() {
    window.addEventListener('message', function(event) {
        const allowedOrigins = ['https://yacine2007.github.io', window.location.origin];
        
        if (!allowedOrigins.includes(event.origin)) return;
        
        if (event.data && event.data.type === 'USER_AUTHENTICATED') {
            handleSuccessfulAuth();
        }
    });
    
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        }
    }, 500);
    
    setTimeout(() => clearInterval(checkAuthInterval), 5 * 60 * 1000);
}

function handleSuccessfulAuth() {
    console.log('✅ Authentication successful');
    appState.isAuthenticated = true;
    extractAndSaveUserAvatar();
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

function extractAndSaveUserAvatar() {
    const user = getAuthenticatedUser();
    if (user && user.image) {
        appState.userAvatarUrl = user.image;
        localStorage.setItem('ultraspace_user_avatar_url', user.image);
    }
}

function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (user) {
        updateProfileAvatar(user);
        updateSettingsAvatar(user);
    }
}

function updateProfileAvatar(user) {
    if (!elements.profileAvatar) return;
    
    const avatarUrl = appState.userAvatarUrl || user.image;
    
    if (avatarUrl) {
        elements.profileAvatar.src = avatarUrl + '?t=' + Date.now();
        elements.profileAvatar.alt = user.name || `User ${user.id}`;
        elements.profileAvatar.onerror = function() {
            this.src = getDefaultAvatarUrl(user);
        };
    } else {
        elements.profileAvatar.src = getDefaultAvatarUrl(user);
    }
}

function getDefaultAvatarUrl(user) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.id) + '&background=3a86ff&color=fff';
}

function updateSettingsAvatar(user) {
    let settingsAvatar = document.getElementById('settingsAvatar');
    
    if (!settingsAvatar) {
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            const avatarUrl = appState.userAvatarUrl || user.image;
            const avatarHTML = `
                <div class="settings-item" style="text-align: center; padding: 20px; border-bottom: 1px solid var(--border-color);">
                    <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 10px; overflow: hidden; background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));">
                        <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                             alt="${user.name || 'User'}" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='${getDefaultAvatarUrl(user)}'"
                             id="settingsAvatar">
                    </div>
                    <div style="font-weight: 600; color: var(--text-color);">${user.name || `User ${user.id}`}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email || ''}</div>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', avatarHTML);
            settingsAvatar = document.getElementById('settingsAvatar');
        }
    }
    
    if (settingsAvatar) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        if (avatarUrl) {
            settingsAvatar.src = avatarUrl + '?t=' + Date.now();
            settingsAvatar.onerror = function() {
                this.src = getDefaultAvatarUrl(user);
            };
        }
    }
}

function getAuthenticatedUser() {
    const userData = localStorage.getItem('bypro_user');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    window.location.reload();
}

// ========== نظام مشاركة المنشورات ==========

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const pageParam = urlParams.get('page');
    
    if (pageParam === 'yacine') {
        loadExternalPage('Yacine/index.html', 'Yacine');
        return true;
    }
    
    if (postId) {
        loadYacineWithPost(postId);
        return true;
    }
    
    return false;
}

function loadYacineWithPost(postId) {
    console.log('Loading Yacine with post:', postId);
    
    loadExternalPage('Yacine/index.html', 'Yacine');
    
    if (elements.externalIframe) {
        const checkIframeLoaded = setInterval(() => {
            if (elements.externalIframe.contentWindow && elements.externalIframe.src.includes('Yacine/index.html')) {
                clearInterval(checkIframeLoaded);
                
                setTimeout(() => {
                    elements.externalIframe.contentWindow.postMessage({
                        type: 'SHOW_POST',
                        postId: postId
                    }, '*');
                    
                    setTimeout(() => {
                        resetPostParameter();
                    }, 2000);
                }, 1000);
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkIframeLoaded), 5000);
    }
}

function resetPostParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('post')) {
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        console.log('🔄 Post parameter removed from URL');
    }
}

// مستمع الرسائل العام
window.addEventListener('message', function(event) {
    const allowedOrigins = [
        'https://yacine2007.github.io',
        window.location.origin,
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
        console.log('Post loaded in iframe:', event.data.postId);
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
});

function generatePostShareLink(postId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?post=${postId}`;
}

// ========== التهيئة الرئيسية ==========

function initApp() {
    const isAuthenticated = checkBYPROAuthentication();
    
    if (!isAuthenticated) {
        console.log('🔐 User not authenticated, showing auth view');
        elements.loadingScreen.remove();
        elements.appContainer.style.display = 'block';
        hideAllUIElements();
        createAuthView();
        return;
    }
    
    console.log('✅ User authenticated, loading UltraSpace');
    
    const hasUrlParams = handleUrlParameters();
    
    if (!hasUrlParams) {
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.remove();
                elements.appContainer.style.display = 'block';
                setupEventListeners();
                updateHeaderVisibility();
                updateBottomNavVisibility();
                setupIframeResizing();
                setupIframeResizeHandler();
            }, 500);
        }, 2000);
    } else {
        elements.loadingScreen.remove();
        elements.appContainer.style.display = 'block';
        setupEventListeners();
        updateHeaderVisibility();
        updateBottomNavVisibility();
        setupIframeResizing();
        setupIframeResizeHandler();
    }

    applyLanguage();
    displayUserInfo();
}

function hideAllUIElements() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';
    
    if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    if (elements.homeHeader) elements.homeHeader.style.display = 'none';
    if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    
    Object.values(elements.views).forEach(view => {
        if (view && view.id !== 'authView') {
            view.style.display = 'none';
        }
    });
}

function applyLanguage() {
    document.documentElement.lang = appState.language;
    localStorage.setItem('language', appState.language);
    
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
    }
}

// ========== إدارة الواجهات ==========

function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
        console.log('🚫 User not authenticated, cannot switch views');
        return;
    }
    
    const currentActiveView = document.querySelector('.view.active');
    
    if (currentActiveView) {
        currentActiveView.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            currentActiveView.classList.remove('active');
            currentActiveView.style.animation = '';
        }, 150);
    }
    
    setTimeout(() => {
        if (elements.views[viewId]) {
            elements.views[viewId].classList.add('active');
            appState.currentView = viewId;
            
            const lastView = appState.viewHistory[appState.viewHistory.length - 1];
            if (lastView !== viewId) {
                appState.viewHistory.push(viewId);
            }
        }
        
        elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });
        
        updateHeaderVisibility();
        updateBottomNavVisibility();
        updateViewTitle(viewId);
        
        if (viewId === 'aiChat' || viewId === 'externalPage') {
            setTimeout(() => {
                const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
                if (activeIframe) {
                    setupIframeDimensions(activeIframe);
                }
            }, 100);
        }
    }, 150);
}

function updateHeaderVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
        return;
    }
    
    const currentView = appState.currentView;
    const mainArea = document.querySelector('.main-area');
    
    const existingHomeHeader = document.getElementById('homeHeader');
    const existingViewHeader = document.getElementById('viewHeader');
    
    if (existingHomeHeader) existingHomeHeader.remove();
    if (existingViewHeader) existingViewHeader.remove();
    
    if (currentView === 'home') {
        const homeHeaderHTML = `
            <header class="header home-header" id="homeHeader">
                <div class="header-content">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search UltraSpace">
                    </div>
                    <div class="header-actions">
                        <img src="https://ui-avatars.com/api/?name=User&background=3a86ff&color=fff" class="user-avatar" alt="Profile" id="profileAvatar">
                    </div>
                </div>
            </header>
        `;
        mainArea.insertAdjacentHTML('afterbegin', homeHeaderHTML);
        
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.addEventListener('click', openProfile);
            const user = getAuthenticatedUser();
            if (user) {
                updateProfileAvatar(user);
            }
        }
        
    } else {
        const viewHeaderHTML = `
            <header class="header view-header mobile-only" id="viewHeader">
                <div class="header-content">
                    <button class="back-btn" id="backBtn">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 class="view-title" id="viewTitle">${viewTitles[currentView] || 'View'}</h1>
                    <div class="header-spacer"></div>
                </div>
            </header>
        `;
        mainArea.insertAdjacentHTML('afterbegin', viewHeaderHTML);
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', goBack);
        }
        
        const viewTitle = document.getElementById('viewTitle');
        if (viewTitle) {
            viewTitle.textContent = viewTitles[currentView] || 'View';
        }
    }
    
    forceHeaderVisibility();
}

function forceHeaderVisibility() {
    const currentView = appState.currentView;
    const homeHeader = document.getElementById('homeHeader');
    const viewHeader = document.getElementById('viewHeader');
    
    if (homeHeader) {
        homeHeader.style.display = currentView === 'home' ? 'flex' : 'none';
    }
    
    if (viewHeader) {
        viewHeader.style.display = currentView === 'home' ? 'none' : 'flex';
    }
}

function updateBottomNavVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
        return;
    }
    
    const isMobile = window.innerWidth <= 1024;
    const currentView = appState.currentView;
    
    if (isMobile && elements.bottomNav) {
        if (currentView === 'home') {
            elements.bottomNav.classList.remove('hidden');
            elements.bottomNav.classList.add('visible');
            elements.bottomNav.style.display = 'flex';
        } else {
            elements.bottomNav.classList.remove('visible');
            elements.bottomNav.classList.add('hidden');
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

function goBack() {
    if (appState.viewHistory.length > 1) {
        appState.viewHistory.pop();
        const previousView = appState.viewHistory[appState.viewHistory.length - 1];
        switchView(previousView);
    } else {
        switchView('home');
    }
}

// ========== إدارة الـ iframes ==========

function setupIframeDimensions(iframe) {
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
        iframe.style.height = '100vh';
        iframe.style.minHeight = '100vh';
        iframe.style.maxHeight = 'none';
    } else {
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '600px';
        iframe.style.maxHeight = 'none';
    }
    
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0';
}

function setupIframeResizing() {
    const iframes = document.querySelectorAll('.ai-iframe, .external-iframe');
    
    iframes.forEach(iframe => {
        setupIframeDimensions(iframe);
        
        iframe.addEventListener('load', function() {
            adjustIframeHeight(this);
        });
        
        iframe.addEventListener('error', function() {
            console.error('Iframe failed to load:', this.src);
            setupIframeDimensions(this);
        });
    });
}

function adjustIframeHeight(iframe) {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        if (iframeDoc && iframeDoc.body) {
            const height = Math.max(
                iframeDoc.body.scrollHeight,
                iframeDoc.documentElement.scrollHeight,
                iframeDoc.body.offsetHeight,
                iframeDoc.documentElement.offsetHeight,
                iframeDoc.body.clientHeight,
                iframeDoc.documentElement.clientHeight
            );
            
            const isMobile = window.innerWidth <= 1024;
            if (isMobile) {
                iframe.style.height = '100vh';
            } else {
                iframe.style.height = height + 'px';
            }
        }
    } catch (error) {
        console.warn('Cannot access iframe content:', error);
        setupIframeDimensions(iframe);
    }
}

function setupIframeResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
            if (activeIframe) {
                setupIframeDimensions(activeIframe);
                setTimeout(() => {
                    adjustIframeHeight(activeIframe);
                }, 100);
            }
        }, 250);
    });
}

async function loadExternalPage(url, title = 'Page') {
    if (!appState.isAuthenticated) {
        console.log('🚫 User not authenticated, cannot load external pages');
        return false;
    }
    
    appState.isLoading = true;
    
    try {
        if (elements.externalIframe) {
            setupIframeForLoading(elements.externalIframe);
            
            elements.externalIframe.src = url;
            viewTitles.externalPage = title;
            
            elements.externalIframe.onload = function() {
                setupIframeDimensions(this);
                setTimeout(() => {
                    adjustIframeHeight(this);
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const postId = urlParams.get('post');
                    
                    if (postId && elements.externalIframe.contentWindow) {
                        setTimeout(() => {
                            elements.externalIframe.contentWindow.postMessage({
                                type: 'SHOW_POST',
                                postId: postId
                            }, '*');
                        }, 500);
                    }
                    
                }, 500);
                appState.isLoading = false;
            };
            
            elements.externalIframe.onerror = function() {
                console.error('Failed to load iframe content:', url);
                setupIframeDimensions(this);
                appState.isLoading = false;
                showErrorView();
            };
            
            switchView('externalPage');
        }
        
        return true;
        
    } catch (error) {
        console.error('Error loading page:', error);
        showErrorView();
        appState.isLoading = false;
        return false;
    }
}

function setupIframeForLoading(iframe) {
    iframe.style.opacity = '0.7';
    setupIframeDimensions(iframe);
    
    setTimeout(() => {
        iframe.style.opacity = '1';
    }, 500);
}

// ========== وظائف الصفحات ==========

function openAIChat() {
    if (elements.aiIframe) {
        setupIframeForLoading(elements.aiIframe);
        
        elements.aiIframe.onload = function() {
            setupIframeDimensions(this);
            setTimeout(() => {
                adjustIframeHeight(this);
            }, 500);
        };
        
        elements.aiIframe.onerror = function() {
            setupIframeDimensions(this);
        };
    }
    
    loadExternalPage('Ai/AI.html', 'UltraSpace AI');
}

function openBlueBadgeVerification() {
    loadExternalPage('Blue Badge Verification.html', 'Blue Badge Verification');
}

function openProfile() {
    loadExternalPage('Profile/Profile.html', 'Edit Profile');
}

function openHelpCenter() {
    loadExternalPage('HCA.html', 'Help Center');
}

function showErrorView() {
    switchView('error');
    appState.isLoading = false;
}

// ========== إعداد المستمعين ==========

function setupEventListeners() {
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = btn.dataset.view;
            switchView(viewId);
        });
    });
    
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', goBack);
    }
    
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            appState.language = e.target.value;
            applyLanguage();
        });
    }
    
    if (elements.profileAvatar) {
        elements.profileAvatar.addEventListener('click', openProfile);
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
    
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', () => {
            switchView('home');
        });
    }
    
    elements.messageItems.forEach(item => {
        item.addEventListener('click', () => {
            const userType = item.getAttribute('data-user');
            
            if (userType === 'ai') {
                openAIChat();
            } else if (userType === 'support') {
                openHelpCenter();
            }
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!appState.isAuthenticated) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 User not authenticated, action blocked');
            return;
        }
        
        if (e.target.closest('.story-item')) {
            const storyItem = e.target.closest('.story-item');
            const storyName = storyItem.querySelector('.story-name').textContent;
            
            if (storyName === 'Yacine') {
                loadExternalPage('Yacine/index.html', 'Yacine');
            }
        }
        
        if (e.target.closest('.page-item')) {
            const pageItem = e.target.closest('.page-item');
            const pageName = pageItem.querySelector('.page-name').textContent;
            const pageUrl = pageItem.getAttribute('data-page-url');
            
            if (pageUrl) {
                loadExternalPage(pageUrl, pageName);
            } else if (pageName === 'Yacine') {
                loadExternalPage('Yacine/index.html', 'Yacine');
            } else if (pageName === 'B.Y PRO') {
                loadExternalPage('BYUS/B.Y%20PRO.html', 'B.Y PRO');
            } else if (pageName === 'UltraSpace') {
                loadExternalPage('BYUS/USP.html', 'UltraSpace');
            }
        }
        
        if (e.target.closest('.settings-item[data-page]')) {
            const settingsItem = e.target.closest('.settings-item[data-page]');
            const pageUrl = settingsItem.getAttribute('data-page');
            const pageTitle = settingsItem.querySelector('span').textContent;
            
            if (pageUrl === 'Ai/AI.html') {
                openAIChat();
            } else if (pageUrl === 'Blue Badge Verification.html') {
                openBlueBadgeVerification();
            } else if (pageUrl === 'Profile/Profile.html') {
                openProfile();
            } else if (pageUrl === 'HCA.html') {
                openHelpCenter();
            } else {
                loadExternalPage(pageUrl, pageTitle);
            }
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderVisibility();
            updateBottomNavVisibility();
            
            const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
            if (activeIframe) {
                setupIframeDimensions(activeIframe);
            }
        }, 250);
    });
    
    const headerFixInterval = setInterval(() => {
        const currentView = appState.currentView;
        const isMobile = window.innerWidth <= 1024;
        
        const homeHeader = document.getElementById('homeHeader');
        if (homeHeader) {
            if (isMobile) {
                homeHeader.style.display = currentView === 'home' ? 'flex' : 'none';
            } else {
                homeHeader.style.display = 'flex';
            }
        }
        
        const viewHeader = document.getElementById('viewHeader');
        if (viewHeader) {
            if (isMobile) {
                viewHeader.style.display = currentView === 'home' ? 'none' : 'flex';
            } else {
                viewHeader.style.display = 'none';
            }
        }
    }, 100);
    
    window.addEventListener('beforeunload', () => {
        clearInterval(headerFixInterval);
    });
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);
