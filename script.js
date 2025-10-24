// حالة التطبيق
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

// عناصر DOM
const elements = {
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

// عناصر الواجهات
const views = {
    home: document.getElementById('homeView'),
    notifications: document.getElementById('notificationsView'),
    messages: document.getElementById('messagesView'),
    settings: document.getElementById('settingsView'),
    aiChat: document.getElementById('aiChatView'),
    externalPage: document.getElementById('externalPageView'),
    error: document.getElementById('errorView')
};

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

// ========== إضافة أنماط CSS ديناميكية ==========

function addDynamicStyles() {
    const styles = `
        /* تحسينات شريط العنوان العلوي */
        .view-header {
            position: relative;
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .view-header-content {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            min-height: 60px;
        }
        
        .back-btn-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--card-background);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .back-btn-circle:hover {
            background: var(--primary-light);
            transform: translateY(-1px);
        }
        
        .back-btn-circle:active {
            transform: translateY(0);
        }
        
        .view-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
        }
        
        /* تحسينات شريط البحث والصورة */
        .search-bar-container {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
            background: var(--card-background);
            border-radius: 25px;
            margin: 0 16px;
            flex: 1;
            max-width: 400px;
            transition: all 0.3s ease;
        }
        
        .search-bar-container.focused {
            box-shadow: 0 0 0 2px var(--primary-light);
        }
        
        .header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-color);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .header-avatar:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* تحسينات معلومات المستخدم في الإعدادات */
        .user-info-section {
            text-align: center;
            padding: 24px 20px;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(135deg, var(--card-background), var(--background-color));
            margin-bottom: 16px;
        }
        
        .user-avatar-large {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 16px;
            border: 3px solid var(--primary-color);
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        
        .user-name {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 4px;
            line-height: 1.4;
        }
        
        .user-id {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 8px;
            font-family: 'Courier New', monospace;
            background: var(--background-color);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .user-email {
            font-size: 0.95rem;
            color: var(--primary-color);
            margin-bottom: 0;
            word-break: break-word;
            line-height: 1.3;
        }
        
        /* تأثيرات التحميل */
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--background-color);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .loading-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .loading-pulse {
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* تحسينات الـ iframe */
        .iframe-container {
            position: relative;
            overflow: hidden;
        }
        
        .iframe-loading {
            opacity: 0.7;
            filter: blur(2px);
            transition: all 0.3s ease;
        }
        
        /* تحسينات واجهة المصادقة */
        .auth-notice {
            background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 16px;
            text-align: center;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .allowed-domain {
            font-weight: 600;
            background: rgba(255,255,255,0.2);
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0 4px;
        }

        /* تحسينات التنقل */
        .nav-btn.active {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* تحسينات عامة */
        .smooth-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ========== نظام المصادقة المحسن ==========

/**
 * التحقق من تسجيل الدخول في B.Y PRO Accounts
 */
function checkBYPROAuthentication() {
    console.log('🔍 التحقق من مصادقة B.Y PRO...');
    
    const userData = localStorage.getItem('bypro_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ تم العثور على بيانات المستخدم:', user);
            
            if (user.id && user.password) {
                appState.isAuthenticated = true;
                
                if (user.image && user.image !== appState.userAvatarUrl) {
                    appState.userAvatarUrl = user.image;
                    localStorage.setItem('ultraspace_user_avatar_url', user.image);
                    console.log('💾 تم حفظ رابط صورة المستخدم:', user.image);
                }
                
                console.log('🎉 المستخدم مصادق بنجاح مع B.Y PRO');
                return true;
            }
        } catch (error) {
            console.error('❌ خطأ في تحليل بيانات المستخدم:', error);
        }
    }
    
    // تنظيف البيانات التالفة
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
    
    console.log('❌ لم يتم العثور على بيانات مستخدم B.Y PRO');
    return false;
}

/**
 * إخفاء شاشة التحميل بسلاسة
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.5s ease';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.remove();
            if (appContainer) {
                appContainer.style.display = 'block';
                setTimeout(() => {
                    appContainer.style.opacity = '1';
                }, 50);
            }
        }, 500);
    } else if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.style.opacity = '1';
    }
    
    console.log('🎯 تم إخفاء شاشة التحميل');
}

/**
 * إنشاء واجهة المصادقة كاملة الشاشة
 */
function createAuthView() {
    console.log('🔐 إنشاء واجهة المصادقة...');
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // إخفاء جميع العناصر الأخرى
    document.querySelectorAll('.view').forEach(view => {
        if (view.id !== 'authView') view.style.display = 'none';
    });
    
    const authViewHTML = `
        <div class="view active" id="authView" style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 10000; background: var(--background-color);">
            <div class="view-content" style="height: 100vh; padding: 0; margin: 0;">
                <div class="auth-notice">
                    🔐 المصادقة الآمنة - مسموح بهذا الرابط: 
                    <span class="allowed-domain">ultraspace.wuaze.com</span>
                </div>
                <div class="auth-container">
                    <iframe 
                        src="https://yacine2007.github.io/secure-auth-app/login.html" 
                        class="auth-iframe" 
                        id="authIframe"
                        style="width: 100%; height: calc(100vh - 80px); border: none;"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', authViewHTML');
    
    // إعداد مستمع المصادقة
    setupAuthListener();
}

/**
 * إعداد مستمع المصادقة
 */
function setupAuthListener() {
    let authChecked = false;
    
    // فحص سريع للمصادقة
    const authCheckInterval = setInterval(() => {
        if (checkBYPROAuthentication() && !authChecked) {
            authChecked = true;
            clearInterval(authCheckInterval);
            console.log('✅ تم اكتشاف مصادقة ناجحة - إعادة التحميل');
            handleSuccessfulAuth();
        }
    }, 800);
    
    // إيقاف الفحص بعد 30 ثانية
    setTimeout(() => {
        if (!authChecked) {
            clearInterval(authCheckInterval);
            console.log('⏰ انتهت مدة انتظار المصادقة');
        }
    }, 30000);
    
    // مستمع الرسائل
    window.addEventListener('message', function(event) {
        const allowedOrigins = [
            'https://yacine2007.github.io',
            'https://ultraspace.wuaze.com',
            window.location.origin
        ];
        
        if (allowedOrigins.includes(event.origin)) {
            console.log('📨 رسالة من نظام المصادقة:', event.data);
            
            if (event.data && event.data.type === 'USER_AUTHENTICATED') {
                console.log('🔑 تمت المصادقة عبر الرسالة');
                handleSuccessfulAuth();
            }
        }
    });
}

/**
 * معالجة المصادقة الناجحة
 */
function handleSuccessfulAuth() {
    console.log('🔄 معالجة المصادقة الناجحة...');
    
    appState.isAuthenticated = true;
    
    // استخراج بيانات المستخدم
    const userData = localStorage.getItem('bypro_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.image) {
                appState.userAvatarUrl = user.image;
                localStorage.setItem('ultraspace_user_avatar_url', user.image);
            }
        } catch (error) {
            console.error('❌ خطأ في بيانات المستخدم');
        }
    }
    
    // إعادة تحميل الصفحة
    setTimeout(() => {
        console.log('🔄 إعادة تحميل الصفحة...');
        window.location.reload();
    }, 1500);
}

// ========== نظام الواجهات المحسن ==========

/**
 * تحديث واجهة الهيدر الرئيسية
 */
function updateMainHeader() {
    const homeHeader = document.getElementById('homeHeader');
    if (!homeHeader || !appState.isAuthenticated) return;
    
    let searchContainer = homeHeader.querySelector('.search-bar-container');
    let headerAvatar = homeHeader.querySelector('.header-avatar');
    
    // إنشاء شريط البحث إذا لم يكن موجوداً
    if (!searchContainer) {
        searchContainer = document.createElement('div');
        searchContainer.className = 'search-bar-container';
        searchContainer.innerHTML = `
            <i class="fas fa-search" style="color: var(--text-muted);"></i>
            <input type="text" placeholder="Search..." style="border: none; background: none; outline: none; flex: 1; color: var(--text-color);" class="search-input">
        `;
        
        const searchInput = searchContainer.querySelector('.search-input');
        searchInput.addEventListener('focus', function() {
            searchContainer.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', function() {
            searchContainer.classList.remove('focused');
        });
        
        searchInput.addEventListener('input', function() {
            console.log('🔍 بحث:', this.value);
        });
    }
    
    // إنشاء صورة المستخدم إذا لم تكن موجودة
    if (!headerAvatar) {
        headerAvatar = document.createElement('img');
        headerAvatar.className = 'header-avatar';
        headerAvatar.alt = 'Profile';
        headerAvatar.addEventListener('click', openProfile);
    }
    
    // تحديث صورة المستخدم
    const user = getAuthenticatedUser();
    if (user && appState.userAvatarUrl) {
        headerAvatar.src = appState.userAvatarUrl + '?t=' + Date.now();
        headerAvatar.onerror = function() {
            this.src = getDefaultAvatarUrl(user);
        };
    } else {
        headerAvatar.src = getDefaultAvatarUrl(user || { id: 'user' });
    }
    
    // إضافة العناصر إذا لم تكن موجودة
    if (!homeHeader.querySelector('.search-bar-container')) {
        homeHeader.appendChild(searchContainer);
    }
    if (!homeHeader.querySelector('.header-avatar')) {
        homeHeader.appendChild(headerAvatar);
    }
}

/**
 * تحديث شريط العنوان للواجهات
 */
function updateViewHeader(viewId) {
    const viewHeader = document.getElementById('viewHeader');
    if (!viewHeader) return;
    
    let headerContent = viewHeader.querySelector('.view-header-content');
    if (!headerContent) {
        headerContent = document.createElement('div');
        headerContent.className = 'view-header-content';
        viewHeader.innerHTML = '';
        viewHeader.appendChild(headerContent);
    }
    
    // زر الرجوع الدائري
    let backBtnCircle = headerContent.querySelector('.back-btn-circle');
    if (!backBtnCircle) {
        backBtnCircle = document.createElement('div');
        backBtnCircle.className = 'back-btn-circle';
        backBtnCircle.innerHTML = '<i class="fas fa-arrow-left" style="color: var(--text-color);"></i>';
        backBtnCircle.addEventListener('click', goBack);
        headerContent.appendChild(backBtnCircle);
    }
    
    // عنوان الواجهة
    let viewTitle = headerContent.querySelector('.view-title');
    if (!viewTitle) {
        viewTitle = document.createElement('h1');
        viewTitle.className = 'view-title';
        headerContent.appendChild(viewTitle);
    }
    
    viewTitle.textContent = viewTitles[viewId] || 'View';
}

/**
 * عرض معلومات المستخدم في الإعدادات
 */
function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (!user) return;
    
    console.log('👤 عرض معلومات المستخدم:', user);
    
    updateMainHeader();
    updateSettingsUserInfo(user);
}

/**
 * تحديث معلومات المستخدم في الإعدادات
 */
function updateSettingsUserInfo(user) {
    const settingsSection = document.querySelector('.settings-section');
    if (!settingsSection) return;
    
    const existingUserInfo = settingsSection.querySelector('.user-info-section');
    if (existingUserInfo) {
        existingUserInfo.remove();
    }
    
    const userInfoHTML = `
        <div class="user-info-section">
            <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; overflow: hidden; background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));">
                <img src="${appState.userAvatarUrl || user.image || getDefaultAvatarUrl(user)}" 
                     alt="${user.name || 'User'}" 
                     class="user-avatar-large"
                     onerror="this.src='${getDefaultAvatarUrl(user)}'">
            </div>
            <div class="user-name">${user.name || `User ${user.id}`}</div>
            <div class="user-id">ID: ${user.id}</div>
            <div class="user-email">${user.email || 'No email provided'}</div>
        </div>
    `;
    
    settingsSection.insertAdjacentHTML('afterbegin', userInfoHTML);
}

/**
 * الحصول على رابط الصورة الافتراضية
 */
function getDefaultAvatarUrl(user) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.id) + '&background=3a86ff&color=fff';
}

/**
 * الحصول على بيانات المستخدم المصادق
 */
function getAuthenticatedUser() {
    const userData = localStorage.getItem('bypro_user');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

// ========== نظام التنقل المحسن ==========

/**
 * تبديل الواجهة بسلاسة
 */
function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    if (!appState.isAuthenticated && viewId !== 'auth') {
        console.log('🚫 المستخدم غير مصادق، لا يمكن تبديل الواجهات');
        return;
    }
    
    console.log(`🔄 تبديل الواجهة إلى: ${viewId}`);
    
    const currentActiveView = document.querySelector('.view.active');
    
    if (currentActiveView) {
        currentActiveView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        currentActiveView.style.opacity = '0';
        currentActiveView.style.transform = 'translateX(-10px)';
        
        setTimeout(() => {
            currentActiveView.classList.remove('active');
            currentActiveView.style.opacity = '';
            currentActiveView.style.transform = '';
            currentActiveView.style.transition = '';
        }, 300);
    }
    
    setTimeout(() => {
        if (views[viewId]) {
            views[viewId].style.opacity = '0';
            views[viewId].style.transform = 'translateX(10px)';
            views[viewId].classList.add('active');
            
            setTimeout(() => {
                views[viewId].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                views[viewId].style.opacity = '1';
                views[viewId].style.transform = 'translateX(0)';
            }, 50);
            
            appState.currentView = viewId;
            
            const lastView = appState.viewHistory[appState.viewHistory.length - 1];
            if (lastView !== viewId) {
                appState.viewHistory.push(viewId);
            }
        }
        
        // تحديد أزرار التنقل
        elements.navButtons.forEach(btn => {
            const isActive = btn.dataset.view === viewId;
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('smooth-transition', true);
        });
        
        updateHeaderVisibility();
        updateBottomNavVisibility();
        updateViewHeader(viewId);
        
        // إعداد تأثيرات التحميل للـ iframes
        if (viewId === 'aiChat' || viewId === 'externalPage') {
            setTimeout(() => {
                const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
                if (activeIframe) {
                    setupIframeDimensions(activeIframe);
                    showLoadingOverlay(activeIframe);
                }
            }, 100);
        }
    }, 300);
}

/**
 * تحديث رأس الصفحة
 */
function updateHeaderVisibility() {
    if (!appState.isAuthenticated) {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
        return;
    }
    
    const currentView = appState.currentView;
    const isMobile = appState.isMobile;
    
    if (currentView === 'home') {
        if (elements.homeHeader) {
            elements.homeHeader.style.display = 'flex';
            updateMainHeader();
        }
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) {
            elements.viewHeader.style.display = 'flex';
            updateViewHeader(currentView);
        }
    }
    
    if (!isMobile && currentView === 'home') {
        if (elements.homeHeader) elements.homeHeader.style.display = 'flex';
    }
}

/**
 * تحديث شريط التنقل السفلي
 */
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
            elements.bottomNav.style.transition = 'all 0.3s ease';
            elements.bottomNav.style.display = 'flex';
            elements.bottomNav.style.opacity = '1';
            elements.bottomNav.style.transform = 'translateY(0)';
        } else {
            elements.bottomNav.style.transition = 'all 0.3s ease';
            elements.bottomNav.style.opacity = '0';
            elements.bottomNav.style.transform = 'translateY(20px)';
            setTimeout(() => {
                elements.bottomNav.style.display = 'none';
            }, 300);
        }
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    }
}

/**
 * الرجوع للخلف
 */
function goBack() {
    if (appState.viewHistory.length > 1) {
        appState.viewHistory.pop();
        const previousView = appState.viewHistory[appState.viewHistory.length - 1];
        switchView(previousView);
    } else {
        switchView('home');
    }
}

// ========== نظام تأثيرات التحميل ==========

/**
 * إظهار تأثير التحميل للـ iframe
 */
function showLoadingOverlay(iframe) {
    let loadingOverlay = iframe.parentElement.querySelector('.loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        iframe.parentElement.style.position = 'relative';
        iframe.parentElement.appendChild(loadingOverlay);
    }
    
    iframe.classList.add('iframe-loading', 'loading-pulse');
    loadingOverlay.classList.add('active');
    
    iframe.addEventListener('load', function() {
        setTimeout(() => {
            iframe.classList.remove('iframe-loading', 'loading-pulse');
            loadingOverlay.classList.remove('active');
        }, 600);
    });
    
    iframe.addEventListener('error', function() {
        setTimeout(() => {
            iframe.classList.remove('iframe-loading', 'loading-pulse');
            loadingOverlay.classList.remove('active');
        }, 1000);
    });
}

// ========== نظام الـ iframes المحسن ==========

/**
 * إعداد أبعاد الـ iframe
 */
function setupIframeDimensions(iframe) {
    const isMobile = appState.isMobile;
    
    if (isMobile) {
        const headerHeight = document.querySelector('.view-header')?.offsetHeight || 60;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = availableHeight + 'px';
    } else {
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.view-header')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '600px';
    }
    
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0';
    iframe.style.width = '100%';
}

/**
 * إعداد تغيير حجم الـ iframe
 */
function setupIframeResizing() {
    const iframes = document.querySelectorAll('.ai-iframe, .external-iframe');
    
    iframes.forEach(iframe => {
        setupIframeDimensions(iframe);
        
        iframe.addEventListener('load', function() {
            adjustIframeHeight(this);
        });
        
        iframe.addEventListener('error', function() {
            console.error('❌ فشل تحميل الـ iframe:', this.src);
            setupIframeDimensions(this);
        });
    });
}

/**
 * ضبط ارتفاع الـ iframe
 */
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
            
            const isMobile = appState.isMobile;
            if (isMobile) {
                const headerHeight = document.querySelector('.view-header')?.offsetHeight || 60;
                const viewportHeight = window.innerHeight;
                const availableHeight = viewportHeight - headerHeight;
                iframe.style.height = availableHeight + 'px';
            } else {
                iframe.style.height = height + 'px';
            }
        }
    } catch (error) {
        console.warn('⚠️ لا يمكن الوصول إلى محتوى الـ iframe:', error);
        setupIframeDimensions(iframe);
    }
}

/**
 * إعداد معالج تغيير حجم النافذة
 */
function setupIframeResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            appState.isMobile = window.innerWidth <= 1024;
            
            updateHeaderVisibility();
            updateBottomNavVisibility();
            
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

// ========== نظام الصفحات الخارجية ==========

/**
 * تحميل الصفحات الخارجية
 */
async function loadExternalPage(url, title = 'Page') {
    if (!appState.isAuthenticated) {
        console.log('🚫 المستخدم غير مصادق، لا يمكن تحميل الصفحات');
        return false;
    }
    
    console.log(`🌐 جاري تحميل الصفحة الخارجية: ${url}`);
    appState.isLoading = true;
    
    try {
        if (elements.externalIframe) {
            showLoadingOverlay(elements.externalIframe);
            
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
                console.error('❌ فشل تحميل محتوى الـ iframe:', url);
                setupIframeDimensions(this);
                appState.isLoading = false;
                showErrorView();
            };
            
            switchView('externalPage');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الصفحة الخارجية:', error);
        appState.isLoading = false;
        showErrorView();
        return false;
    }
}

/**
 * استمع لرسائل من الـ iframe
 */
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
        
        if (!originAllowed) {
            console.warn('⚠️ رسالة من مصدر غير مصرح به:', event.origin);
            return;
        }
        
        if (event.data && event.data.type === 'POST_LOADED') {
            console.log('✅ تم تحميل المنشور في iframe:', event.data.postId);
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
            resizeIframe(height);
        }
    });
}

/**
 * إنشاء رابط مشاركة للمنشور
 */
function generatePostShareLink(postId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?post=${postId}`;
}

/**
 * تغيير حجم الـ iframe ديناميكياً
 */
function resizeIframe(height) {
    if (elements.externalIframe) {
        elements.externalIframe.style.height = height + 'px';
    }
}

// ========== نظام معالجة URL ==========

/**
 * معالجة معلمات URL
 */
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const pageParam = urlParams.get('page');
    
    console.log('🔗 معلمات URL المكتشفة:', { postId, pageParam });
    
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

/**
 * تحميل صفحة Yacine مع منشور محدد
 */
function loadYacineWithPost(postId) {
    console.log('📖 جاري تحميل Yacine مع المنشور:', postId);
    
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
                    
                    console.log('📨 تم إرسال الرسالة إلى iframe للمنشور:', postId);
                    
                    setTimeout(() => {
                        resetPostParameter();
                    }, 2000);
                }, 1000);
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkIframeLoaded), 5000);
    }
}

/**
 * إعادة تعيين معلمة post من الرابط
 */
function resetPostParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('post')) {
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        console.log('🔄 تمت إزالة معلمة post من URL');
    }
}

// ========== نظام الوظائف المساعدة ==========

/**
 * فتح الدردشة AI
 */
function openAIChat() {
    console.log('🤖 فتح الدردشة AI...');
    loadExternalPage('Ai/AI.html', 'UltraSpace AI');
}

/**
 * فتح التحقق من الشارة الزرقاء
 */
function openBlueBadgeVerification() {
    console.log('🔵 فتح التحقق من الشارة الزرقاء...');
    loadExternalPage('Blue Badge Verification.html', 'Blue Badge Verification');
}

/**
 * فتح الملف الشخصي
 */
function openProfile() {
    console.log('👤 فتح الملف الشخصي...');
    loadExternalPage('Profile/Profile.html', 'Edit Profile');
}

/**
 * فتح مركز المساعدة
 */
function openHelpCenter() {
    console.log('❓ فتح مركز المساعدة...');
    loadExternalPage('HCA.html', 'Help Center');
}

/**
 * إظهار واجهة الخطأ
 */
function showErrorView() {
    console.error('🚨 إظهار واجهة الخطأ');
    switchView('error');
}

/**
 * تسجيل الخروج
 */
function logout() {
    console.log('🚪 جاري تسجيل الخروج...');
    
    if (confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟')) {
        localStorage.removeItem('bypro_user');
        localStorage.removeItem('ultraspace_user_avatar_url');
        appState.isAuthenticated = false;
        appState.userAvatarUrl = '';
        
        window.location.reload();
    }
}

// ========== إعدادات اللغة ==========

/**
 * تغيير اللغة
 */
function changeLanguage(lang) {
    appState.language = lang;
    localStorage.setItem('language', lang);
    updateLanguageUI();
    console.log(`🌐 تم تغيير اللغة إلى: ${lang}`);
}

/**
 * تحديث واجهة المستخدم بناءً على اللغة
 */
function updateLanguageUI() {
    const elementsToUpdate = {
        home: { en: 'Home', ar: 'الرئيسية' },
        notifications: { en: 'Notifications', ar: 'الإشعارات' },
        messages: { en: 'Messages', ar: 'الرسائل' },
        settings: { en: 'Settings', ar: 'الإعدادات' },
        aiChat: { en: 'UltraSpace AI', ar: 'الذكاء الاصطناعي' },
        externalPage: { en: 'Page', ar: 'الصفحة' },
        error: { en: 'Error', ar: 'خطأ' }
    };
    
    Object.keys(elementsToUpdate).forEach(viewId => {
        viewTitles[viewId] = elementsToUpdate[viewId][appState.language];
    });
    
    updateViewHeader(appState.currentView);
    
    const searchInput = document.querySelector('.search-bar-container .search-input');
    if (searchInput) {
        searchInput.placeholder = appState.language === 'ar' ? 'بحث...' : 'Search...';
    }
}

// ========== إعدادات الأحداث ==========

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    console.log('🎯 إعداد مستمعي الأحداث...');
    
    // أزرار التنقل
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = btn.dataset.view;
            switchView(viewId);
        });
    });
    
    // زر الرجوع
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', goBack);
    }
    
    // زر تسجيل الخروج
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    
    // زر العودة للرئيسية من صفحة الخطأ
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', () => {
            switchView('home');
        });
    }
    
    // عناصر الرسائل
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
    
    // اختيار اللغة
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        elements.languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // النقر على القصص والصفحات
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
}

// ========== التهيئة الرئيسية ==========

/**
 * تهيئة التطبيق
 */
function initializeApp() {
    console.log('🚀 بدء تهيئة تطبيق UltraSpace...');
    
    // إضافة الأنماط الديناميكية أولاً
    addDynamicStyles();
    
    // إخفاء شاشة التحميل فوراً
    hideLoadingScreen();
    
    // التحقق من المصادقة
    const isAuthenticated = checkBYPROAuthentication();
    
    if (!isAuthenticated) {
        console.log('🔐 المستخدم غير مصادق، عرض واجهة المصادقة');
        createAuthView();
        return;
    }
    
    console.log('✅ المستخدم مصادق، تحميل التطبيق الرئيسي');
    appState.isAuthenticated = true;
    
    // إعداد الواجهة الرئيسية
    setupMainInterface();
    
    // التحقق من معلمات URL
    const hasUrlParams = handleUrlParameters();
    
    if (!hasUrlParams) {
        switchView('home');
    }
}

/**
 * إعداد الواجهة الرئيسية
 */
function setupMainInterface() {
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // إعداد نظام الرسائل
    setupIframeMessageListener();
    
    // إعداد تغيير الحجم
    setupIframeResizeHandler();
    setupIframeResizing();
    
    // تحديث اللغة
    updateLanguageUI();
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    console.log('🎉 تم تحميل التطبيق بنجاح');
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء التهيئة...');
    initializeApp();
});

// التأكيد على التحميل الكامل
window.addEventListener('load', function() {
    console.log('🖼️ تم تحميل الصفحة بالكامل');
    
    if (appState.isAuthenticated) {
        updateMainHeader();
        updateViewHeader(appState.currentView);
    }
});

// تصدير للاستخدام العالمي
window.UltraSpace = {
    appState,
    switchView,
    loadExternalPage,
    openAIChat,
    openProfile,
    logout,
    getAuthenticatedUser
};

console.log('📦 تم تحميل script.js المحسن بالكامل');
