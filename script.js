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

// تهيئة التطبيق
function initApp() {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
            appContainer.style.display = 'block';
            setupEventListeners();
            updateHeaderVisibility();
            updateBottomNavVisibility();
            
            // إعداد ضبط أبعاد الـ iframe
            setupIframeResizing();
            setupIframeResizeHandler();
            
        }, 500);
    }, 2000);

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

// تبديل الواجهة - تم التحديث مع الأنيميشن
function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    const currentActiveView = document.querySelector('.view.active');
    
    // إخفاء الواجهة الحالية مع أنيميشن
    if (currentActiveView) {
        currentActiveView.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            currentActiveView.classList.remove('active');
            currentActiveView.style.animation = '';
        }, 150);
    }
    
    // إظهار الواجهة الجديدة
    setTimeout(() => {
        if (views[viewId]) {
            views[viewId].classList.add('active');
            appState.currentView = viewId;
            
            // تحديث السجل - فقط إذا كانت واجهة مختلفة
            const lastView = appState.viewHistory[appState.viewHistory.length - 1];
            if (lastView !== viewId) {
                appState.viewHistory.push(viewId);
            }
        }
        
        // تحديث أزرار التنقل
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });
        
        // تحديث رأس الصفحة والشريط السفلي
        updateHeaderVisibility();
        updateBottomNavVisibility();
        updateViewTitle(viewId);
        
        // ضبط ارتفاع الـ iframe إذا كانت الواجهة تحتوي على iframe
        if (viewId === 'aiChat' || viewId === 'externalPage') {
            setTimeout(() => {
                const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
                if (activeIframe) {
                    adjustIframeHeight(activeIframe);
                }
            }, 100);
        }
    }, 150);
}

// تحديث رأس الصفحة - النسخة المحسنة
function updateHeaderVisibility() {
    const currentView = appState.currentView;
    const mainArea = document.querySelector('.main-area');
    
    // احذف كلا الهيدرين أولاً لضمان بداية نظيفة
    const existingHomeHeader = document.getElementById('homeHeader');
    const existingViewHeader = document.getElementById('viewHeader');
    
    if (existingHomeHeader) {
        existingHomeHeader.remove();
    }
    if (existingViewHeader) {
        existingViewHeader.remove();
    }
    
    if (currentView === 'home') {
        // في الواجهة الرئيسية: أضف homeHeader فقط
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
        
        // أعد إضافة event listeners
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.addEventListener('click', openProfile);
        }
        
    } else {
        // في جميع الواجهات الأخرى: أضف viewHeader فقط
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
        
        // أعد إضافة event listener
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', goBack);
        }
        
        // تحديث العنوان
        const viewTitle = document.getElementById('viewTitle');
        if (viewTitle) {
            viewTitle.textContent = viewTitles[currentView] || 'View';
        }
    }
    
    // تأكيد إظهار/إخفاء الهيدر المناسب
    forceHeaderVisibility();
}

// وظيفة إضافية لتأكيد إظهار/إخفاء الهيدر المناسب
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

// تحديث الشريط السفلي
function updateBottomNavVisibility() {
    const isMobile = window.innerWidth <= 1024;
    const currentView = appState.currentView;
    
    if (isMobile && bottomNav) {
        // في الهواتف: إظهار الشريط السفلي فقط في الواجهة الرئيسية
        if (currentView === 'home') {
            bottomNav.classList.remove('hidden');
            bottomNav.classList.add('visible');
        } else {
            bottomNav.classList.remove('visible');
            bottomNav.classList.add('hidden');
        }
    }
}

// تحديث عنوان الواجهة
function updateViewTitle(viewId) {
    if (viewTitle) {
        viewTitle.textContent = viewTitles[viewId] || 'View';
    }
}

// الرجوع للخلف
function goBack() {
    if (appState.viewHistory.length > 1) {
        appState.viewHistory.pop(); // إزالة الواجهة الحالية
        const previousView = appState.viewHistory[appState.viewHistory.length - 1];
        switchView(previousView);
    } else {
        switchView('home');
    }
}

// ========== إدارة الـ iframe المحسنة ==========

// ضبط ارتفاع الـ iframe تلقائياً بناءً على المحتوى
function setupIframeResizing() {
    const iframes = document.querySelectorAll('.ai-iframe, .external-iframe');
    
    iframes.forEach(iframe => {
        // استمع لتغيرات المحتوى في الـ iframe
        iframe.addEventListener('load', function() {
            adjustIframeHeight(this);
        });
        
        // أيضاً استمع لأخطاء التحميل
        iframe.addEventListener('error', function() {
            console.error('Iframe failed to load:', this.src);
            setDefaultIframeHeight(this);
        });
    });
}

// ضبط ارتفاع الـ iframe
function adjustIframeHeight(iframe) {
    try {
        // حاول الوصول لمحتوى الـ iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        if (iframeDoc && iframeDoc.body) {
            // احسب الارتفاع المطلوب
            const height = Math.max(
                iframeDoc.body.scrollHeight,
                iframeDoc.documentElement.scrollHeight,
                iframeDoc.body.offsetHeight,
                iframeDoc.documentElement.offsetHeight,
                iframeDoc.body.clientHeight,
                iframeDoc.documentElement.clientHeight
            );
            
            // حدد ارتفاعاً أقصى لمنع الصفحات الطويلة جداً
            const maxHeight = window.innerHeight - 100;
            const finalHeight = Math.min(height, maxHeight);
            
            iframe.style.height = finalHeight + 'px';
            iframe.style.minHeight = '400px'; // ارتفاع أدنى
            
            console.log('Iframe height adjusted to:', finalHeight);
        }
    } catch (error) {
        // إذا فشل الوصول لمحتوى الـ iframe (مشكلة CORS)
        console.warn('Cannot access iframe content:', error);
        setDefaultIframeHeight(iframe);
    }
}

// تعيين ارتفاع افتراضي للـ iframe
function setDefaultIframeHeight(iframe) {
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
    const navHeight = document.querySelector('.bottom-nav')?.offsetHeight || 80;
    
    // احسب الارتفاع المتاح
    const availableHeight = viewportHeight - headerHeight - navHeight - 40;
    
    iframe.style.height = availableHeight + 'px';
    iframe.style.minHeight = '500px';
    
    console.log('Default iframe height set to:', availableHeight);
}

// تحديث أبعاد الـ iframe عند تغيير حجم النافذة
function setupIframeResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
            if (activeIframe) {
                adjustIframeHeight(activeIframe);
            }
        }, 250);
    });
}

// تحميل الصفحات الخارجية - نسخة محسنة
async function loadExternalPage(url, title = 'Page') {
    appState.isLoading = true;
    
    try {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
            throw new Error('Page not found');
        }
        
        if (externalIframe) {
            // إعداد الـ iframe قبل التحميل
            setupIframeForLoading(externalIframe);
            
            externalIframe.src = url;
            viewTitles.externalPage = title;
            
            // إعداد الـ iframe بعد التحميل
            externalIframe.onload = function() {
                adjustIframeHeight(this);
                appState.isLoading = false;
            };
            
            externalIframe.onerror = function() {
                console.error('Failed to load iframe content:', url);
                setDefaultIframeHeight(this);
                appState.isLoading = false;
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

// إعداد الـ iframe للتحميل
function setupIframeForLoading(iframe) {
    iframe.style.height = '600px'; // ارتفاع مؤقت أثناء التحميل
    iframe.style.opacity = '0.7'; // شفافية أثناء التحميل
    
    // إزالة الشفافية بعد التحميل
    setTimeout(() => {
        iframe.style.opacity = '1';
    }, 500);
}

// فتح شات AI - نسخة محسنة
function openAIChat() {
    if (aiIframe) {
        setupIframeForLoading(aiIframe);
        
        aiIframe.onload = function() {
            adjustIframeHeight(this);
        };
        
        aiIframe.onerror = function() {
            setDefaultIframeHeight(this);
        };
    }
    
    loadExternalPage('Ai/AI.html', 'UltraSpace AI');
}

// فتح صفحة التحقق من الشارة الزرقاء
function openBlueBadgeVerification() {
    loadExternalPage('Blue Badge Verification.html', 'Blue Badge Verification');
}

// فتح صفحة الملف الشخصي
function openProfile() {
    loadExternalPage('Profile/Profile.html', 'Edit Profile');
}

// فتح مركز المساعدة
function openHelpCenter() {
    loadExternalPage('HCA.html', 'Help Center');
}

// عرض واجهة الخطأ
function showErrorView() {
    switchView('error');
    appState.isLoading = false;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الواجهات
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = btn.dataset.view;
            switchView(viewId);
        });
    });
    
    // زر العودة
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    // تغيير اللغة
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            appState.language = e.target.value;
            applyLanguage();
        });
    }
    
    // الملف الشخصي
    if (profileAvatar) {
        profileAvatar.addEventListener('click', openProfile);
    }
    
    // تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                alert('Logout successful!');
                // في تطبيق حقيقي، سيتم إعادة التوجيه إلى صفحة تسجيل الدخول
            }
        });
    }
    
    // العودة للصفحة الرئيسية من واجهة الخطأ
    if (errorHomeBtn) {
        errorHomeBtn.addEventListener('click', () => {
            switchView('home');
        });
    }
    
    // عناصر الرسائل
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
    
    // عناصر الإعدادات
    document.addEventListener('click', (e) => {
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
    
    // تحديث الرأس والشريط السفلي عند تغيير حجم النافذة
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderVisibility();
            updateBottomNavVisibility();
        }, 250);
    });
    
    // حل نهائي: مراقبة وإصلاح أي مشاكل في الـ headers
    const headerFixInterval = setInterval(() => {
        const currentView = appState.currentView;
        const isMobile = window.innerWidth <= 1024;
        
        // إصلاح homeHeader
        const homeHeader = document.getElementById('homeHeader');
        if (homeHeader) {
            if (isMobile) {
                if (currentView === 'home') {
                    if (homeHeader.style.display !== 'flex') {
                        homeHeader.style.display = 'flex';
                    }
                } else {
                    if (homeHeader.style.display !== 'none') {
                        homeHeader.style.display = 'none';
                    }
                }
            } else {
                if (homeHeader.style.display !== 'flex') {
                    homeHeader.style.display = 'flex';
                }
            }
        }
        
        // إصلاح viewHeader - يظهر في جميع الواجهات ما عدا home
        const viewHeader = document.getElementById('viewHeader');
        if (viewHeader) {
            if (isMobile) {
                if (currentView === 'home') {
                    if (viewHeader.style.display !== 'none') {
                        viewHeader.style.display = 'none';
                    }
                } else {
                    if (viewHeader.style.display !== 'flex') {
                        viewHeader.style.display = 'flex';
                    }
                }
            } else {
                if (viewHeader.style.display !== 'none') {
                    viewHeader.style.display = 'none';
                }
            }
        }
    }, 100);
    
    // تنظيف الـ interval عندما يتم إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        clearInterval(headerFixInterval);
    });
    
    // منع السلوك الافتراضي للأزرار
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('nav-btn') || 
            e.target.classList.contains('back-btn') ||
            e.target.classList.contains('settings-item')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // تحسين تجربة المستخدم على الهواتف
    document.addEventListener('touchmove', function(e) {
        if (e.target.classList.contains('nav-btn') || 
            e.target.classList.contains('back-btn')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// إضافة أنيميشن fadeOut لـ CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
