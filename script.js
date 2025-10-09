// حالة التطبيق
const appState = {
    currentView: 'home',
    language: localStorage.getItem('language') || 'en',
    isLoading: false,
    viewHistory: ['home']
};

// عناصر DOM
const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');
const navButtons = document.querySelectorAll('.nav-btn');
const views = {
    home: document.getElementById('homeView'),
    notifications: document.getElementById('notificationsView'),
    messages: document.getElementById('messagesView'),
    settings: document.getElementById('settingsView'),
    aiChat: document.getElementById('aiChatView'),
    externalPage: document.getElementById('externalPageView'),
    error: document.getElementById('errorView')
};

const homeHeader = document.getElementById('homeHeader');
const viewHeader = document.getElementById('viewHeader');
const backBtn = document.getElementById('backBtn');
const profileAvatar = document.getElementById('profileAvatar');
const languageSelect = document.getElementById('languageSelect');
const logoutBtn = document.getElementById('settingsLogoutBtn');
const errorHomeBtn = document.getElementById('errorHomeBtn');
const messageItems = document.querySelectorAll('.message-item');
const externalIframe = document.getElementById('externalIframe');
const aiIframe = document.getElementById('aiIframe');
const bottomNav = document.getElementById('bottomNav');
const viewTitle = document.getElementById('viewTitle');

// عناوين الواجهات
const viewTitles = {
    home: 'Home',
    notifications: 'Notifications',
    messages: 'Messages',
    settings: 'Settings',
    aiChat: 'UltraSpace AI',
    externalPage: 'Page',
    error: 'Error'
};

// ========== نظام مشاركة المنشورات والروابط المباشرة ==========

// وظيفة لقراءة معلمات URL وتحديد المنشور المطلوب
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const pageParam = urlParams.get('page');
    
    console.log('URL Parameters detected:', { postId, pageParam });
    
    // إذا كان هناك معلمة page، قم بتحميل الصفحة المطلوبة
    if (pageParam === 'yacine') {
        loadExternalPage('Yacine/index.html', 'Yacine');
        return true;
    }
    
    // إذا كان هناك معلمة post، قم بتحميل Yacine مع المنشور المحدد
    if (postId) {
        loadYacineWithPost(postId);
        return true;
    }
    
    return false;
}

// تحميل صفحة Yacine مع منشور محدد
function loadYacineWithPost(postId) {
    console.log('Loading Yacine with post:', postId);
    
    // تحميل صفحة Yacine
    loadExternalPage('Yacine/index.html', 'Yacine');
    
    // إرسال رسالة بالمنشور المطلوب بعد تحميل الـ iframe
    if (externalIframe) {
        const checkIframeLoaded = setInterval(() => {
            if (externalIframe.contentWindow && externalIframe.src.includes('Yacine/index.html')) {
                clearInterval(checkIframeLoaded);
                
                setTimeout(() => {
                    externalIframe.contentWindow.postMessage({
                        type: 'SHOW_POST',
                        postId: postId
                    }, '*');
                    
                    console.log('Message sent to iframe for post:', postId);
                }, 1000);
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkIframeLoaded), 5000);
    }
}

// استمع لرسائل من الـ iframe
window.addEventListener('message', function(event) {
    // تحقق من مصدر الرسالة لأسباب أمنية
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
    
    if (!originAllowed) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
    }
    
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
});

// إنشاء رابط مشاركة للمنشور
function generatePostShareLink(postId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?post=${postId}`;
}

// ========== نهاية نظام المشاركة ==========

// تهيئة التطبيق
function initApp() {
    // أولاً: تحقق من معلمات URL للروابط المباشرة
    const hasUrlParams = handleUrlParameters();
    
    if (!hasUrlParams) {
        // التحميل العادي إذا لم توجد معلمات
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
                appContainer.style.display = 'block';
                setupEventListeners();
                updateHeaderVisibility();
                updateBottomNavVisibility();
                
                setupIframeResizing();
                setupIframeResizeHandler();
                
            }, 500);
        }, 2000);
    } else {
        // إذا كانت هناك معلمات، تخطى شاشة التحميل
        loadingScreen.remove();
        appContainer.style.display = 'block';
        setupEventListeners();
        updateHeaderVisibility();
        updateBottomNavVisibility();
        setupIframeResizing();
        setupIframeResizeHandler();
    }

    applyLanguage();
}

// تطبيق اللغة
function applyLanguage() {
    document.documentElement.lang = appState.language;
    localStorage.setItem('language', appState.language);
    
    if (languageSelect) {
        languageSelect.value = appState.language;
    }
}

// تبديل الواجهة
function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    const currentActiveView = document.querySelector('.view.active');
    
    if (currentActiveView) {
        currentActiveView.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            currentActiveView.classList.remove('active');
            currentActiveView.style.animation = '';
        }, 150);
    }
    
    setTimeout(() => {
        if (views[viewId]) {
            views[viewId].classList.add('active');
            appState.currentView = viewId;
            
            const lastView = appState.viewHistory[appState.viewHistory.length - 1];
            if (lastView !== viewId) {
                appState.viewHistory.push(viewId);
            }
        }
        
        navButtons.forEach(btn => {
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

// تحديث رأس الصفحة
function updateHeaderVisibility() {
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
    const isMobile = window.innerWidth <= 1024;
    const currentView = appState.currentView;
    
    if (isMobile && bottomNav) {
        if (currentView === 'home') {
            bottomNav.classList.remove('hidden');
            bottomNav.classList.add('visible');
        } else {
            bottomNav.classList.remove('visible');
            bottomNav.classList.add('hidden');
        }
    }
}

function updateViewTitle(viewId) {
    if (viewTitle) {
        viewTitle.textContent = viewTitles[viewId] || 'View';
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

// إعداد أبعاد الـ iframe
function setupIframeDimensions(iframe) {
    const isMobile = window.innerWidth <= 1024;
    const viewportHeight = window.innerHeight;
    
    if (isMobile) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
        const navHeight = document.querySelector('.bottom-nav')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight - navHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '500px';
        iframe.style.maxHeight = 'none';
        
    } else {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '600px';
    }
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
                const viewportHeight = window.innerHeight;
                const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
                const navHeight = document.querySelector('.bottom-nav')?.offsetHeight || 70;
                const availableHeight = viewportHeight - headerHeight - navHeight;
                
                const finalHeight = Math.max(height, availableHeight);
                iframe.style.height = finalHeight + 'px';
            } else {
                const maxHeight = window.innerHeight - 100;
                const finalHeight = Math.min(height, maxHeight);
                iframe.style.height = finalHeight + 'px';
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

// وظيفة محسنة لتحميل الصفحات الخارجية
async function loadExternalPage(url, title = 'Page') {
    appState.isLoading = true;
    
    try {
        if (externalIframe) {
            setupIframeForLoading(externalIframe);
            
            externalIframe.src = url;
            viewTitles.externalPage = title;
            
            externalIframe.onload = function() {
                setupIframeDimensions(this);
                setTimeout(() => {
                    adjustIframeHeight(this);
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const postId = urlParams.get('post');
                    
                    if (postId && externalIframe.contentWindow) {
                        setTimeout(() => {
                            externalIframe.contentWindow.postMessage({
                                type: 'SHOW_POST',
                                postId: postId
                            }, '*');
                        }, 500);
                    }
                    
                }, 500);
                appState.isLoading = false;
            };
            
            externalIframe.onerror = function() {
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

function openAIChat() {
    if (aiIframe) {
        setupIframeForLoading(aiIframe);
        
        aiIframe.onload = function() {
            setupIframeDimensions(this);
            setTimeout(() => {
                adjustIframeHeight(this);
            }, 500);
        };
        
        aiIframe.onerror = function() {
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

// إعداد مستمعي الأحداث
function setupEventListeners() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = btn.dataset.view;
            switchView(viewId);
        });
    });
    
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            appState.language = e.target.value;
            applyLanguage();
        });
    }
    
    if (profileAvatar) {
        profileAvatar.addEventListener('click', openProfile);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                alert('Logout successful!');
            }
        });
    }
    
    if (errorHomeBtn) {
        errorHomeBtn.addEventListener('click', () => {
            switchView('home');
        });
    }
    
    messageItems.forEach(item => {
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
