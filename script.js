// حالة التطبيق
const appState = {
    currentView: 'home',
    language: localStorage.getItem('language') || 'en',
    isLoading: false,
    viewHistory: ['home'],
    isAuthenticated: false,
    userAvatarUrl: localStorage.getItem('ultraspace_user_avatar_url') || '',
    currentPostId: null,
    isMobile: window.innerWidth <= 1024,
    loadingStates: {}
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
    searchInput: document.querySelector('.search-bar input'),
    homeSearchBar: document.querySelector('.home-search-bar'),
    homeProfileAvatar: document.getElementById('homeProfileAvatar')
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

// ========== نظام المصادقة المحسّن ==========

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
                
                // استخراج رابط الصورة وحفظه
                if (user.image && user.image !== appState.userAvatarUrl) {
                    appState.userAvatarUrl = user.image;
                    localStorage.setItem('ultraspace_user_avatar_url', user.image);
                    console.log('💾 تم حفظ رابط صورة المستخدم:', user.image);
                }
                
                console.log('🎉 المستخدم مصادق بنجاح مع B.Y PRO');
                return true;
            } else {
                console.log('❌ هيكل بيانات المستخدم غير صالح');
                clearUserData();
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في تحليل بيانات المستخدم:', error);
            clearUserData();
            return false;
        }
    } else {
        console.log('❌ لم يتم العثور على بيانات مستخدم B.Y PRO');
        appState.isAuthenticated = false;
        appState.userAvatarUrl = '';
        return false;
    }
}

/**
 * مسح بيانات المستخدم
 */
function clearUserData() {
    localStorage.removeItem('bypro_user');
    localStorage.removeItem('ultraspace_user_avatar_url');
    appState.isAuthenticated = false;
    appState.userAvatarUrl = '';
}

/**
 * إنشاء واجهة المصادقة كاملة الشاشة
 */
function createAuthView() {
    console.log('🔐 إنشاء واجهة المصادقة...');
    
    const mainContent = document.querySelector('.main-content');
    
    const authViewHTML = `
        <div class="view active" id="authView" style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 10000; background: var(--background-color);">
            <div class="view-content" style="height: 100vh; padding: 0; margin: 0;">
                <div class="auth-container">
                    <div class="auth-header" style="text-align: center; padding: 20px; background: var(--primary-color); color: white;">
                        <h2 style="margin: 0; font-size: 1.5rem;">UltraSpace</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">🔒 Secure Authentication Required</p>
                    </div>
                    <iframe 
                        src="https://yacine2007.github.io/secure-auth-app/login.html?allowed_domain=ultraspace.wuaze.com" 
                        class="auth-iframe" 
                        id="authIframe"
                        style="width: 100%; height: calc(100vh - 80px); border: none;"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', authViewHTML);
    views.auth = document.getElementById('authView');
    
    // إعداد مستمع للرسائل من iframe المصادقة
    setupAuthIframeListener();
}

/**
 * إعداد مستمع لرسائل iframe المصادقة
 */
function setupAuthIframeListener() {
    window.addEventListener('message', function(event) {
        // التحقق من مصدر الرسالة - السماح بـ ultraspace.wuaze.com والمصادر الأخرى المسموحة
        const allowedOrigins = [
            'https://yacine2007.github.io',
            'https://ultraspace.wuaze.com',
            'http://ultraspace.wuaze.com',
            window.location.origin,
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        if (!allowedOrigins.some(origin => event.origin === origin || event.origin.includes(origin))) {
            console.warn('⚠️ رسالة من مصدر غير مصرح به:', event.origin);
            return;
        }
        
        console.log('📨 تم استلام رسالة من iframe المصادقة:', event.data);
        
        // معالجة أنواع الرسائل المختلفة
        if (event.data && event.data.type === 'USER_AUTHENTICATED') {
            console.log('🔑 تم استلام رسالة مصادقة المستخدم');
            handleSuccessfulAuth();
        }
        
        if (event.data && event.data.type === 'AUTH_READY') {
            console.log('✅ iframe المصادقة جاهز');
        }
    });
    
    // فحص دوري مكثف لحالة المصادقة
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            console.log('🔄 الفحص الدوري: المستخدم مصادق');
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        }
    }, 500);
    
    // إيقاف الفحص بعد 5 دقائق
    setTimeout(() => {
        clearInterval(checkAuthInterval);
        console.log('⏰ انتهت مدة التحقق من المصادقة');
    }, 5 * 60 * 1000);
}

/**
 * التعامل مع المصادقة الناجحة
 */
function handleSuccessfulAuth() {
    console.log('✅ تمت المصادقة بنجاح، إعادة تحميل الصفحة...');
    appState.isAuthenticated = true;
    
    // استخراج وحفظ رابط الصورة النهائي
    extractAndSaveUserAvatar();
    
    // عرض رسالة نجاح
    showLoadingMessage('تم تسجيل الدخول بنجاح!', 'success');
    
    // إعادة تحميل الصفحة بعد تأخير قصير
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

/**
 * استخراج وحفظ رابط صورة المستخدم
 */
function extractAndSaveUserAvatar() {
    const user = getAuthenticatedUser();
    if (user && user.image) {
        console.log('💾 استخراج وحفظ رابط صورة المستخدم:', user.image);
        appState.userAvatarUrl = user.image;
        localStorage.setItem('ultraspace_user_avatar_url', user.image);
        
        // تحديث الصور الرمزية مباشرة
        updateAllAvatars(user);
    }
}

/**
 * تحديث جميع الصور الرمزية
 */
function updateAllAvatars(user) {
    updateProfileAvatar(user);
    updateHomeProfileAvatar(user);
    updateSettingsAvatar(user);
}

/**
 * عرض معلومات المستخدم
 */
function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (user) {
        console.log('👤 عرض معلومات المستخدم:', user);
        
        // تحديث الصور الرمزية
        updateAllAvatars(user);
        
        // تحديث معلومات المستخدم في الإعدادات
        updateSettingsUserInfo(user);
    }
}

/**
 * تحديث الصورة الرمزية في الهيدر
 */
function updateProfileAvatar(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        updateAvatarElement(profileAvatar, user);
    }
}

/**
 * تحديث الصورة الرمزية في الهيدر الرئيسي
 */
function updateHomeProfileAvatar(user) {
    const homeProfileAvatar = document.getElementById('homeProfileAvatar');
    if (homeProfileAvatar) {
        updateAvatarElement(homeProfileAvatar, user);
    }
}

/**
 * تحديث عنصر الصورة الرمزية
 */
function updateAvatarElement(element, user) {
    const avatarUrl = appState.userAvatarUrl || user.image;
    
    if (avatarUrl) {
        // إضافة تأثير تحميل للصورة
        element.style.opacity = '0.7';
        element.style.transition = 'opacity 0.3s ease';
        
        const img = new Image();
        img.src = avatarUrl + '?t=' + Date.now();
        
        img.onload = function() {
            element.src = img.src;
            element.alt = user.name || `User ${user.id}`;
            element.style.opacity = '1';
        };
        
        img.onerror = function() {
            element.src = getDefaultAvatarUrl(user);
            element.alt = user.name || `User ${user.id}`;
            element.style.opacity = '1';
        };
    } else {
        element.src = getDefaultAvatarUrl(user);
        element.alt = user.name || `User ${user.id}`;
    }
}

/**
 * الحصول على رابط الصورة الافتراضية
 */
function getDefaultAvatarUrl(user) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.id) + '&background=3a86ff&color=fff&size=128&bold=true';
}

/**
 * تحديث الصورة ومعلومات المستخدم في الإعدادات
 */
function updateSettingsAvatar(user) {
    let settingsAvatar = document.getElementById('settingsAvatar');
    const settingsUserInfo = document.getElementById('settingsUserInfo');
    
    if (!settingsUserInfo) {
        createSettingsUserInfo(user);
    } else {
        updateSettingsUserInfo(user);
    }
    
    if (settingsAvatar) {
        updateAvatarElement(settingsAvatar, user);
    }
}

/**
 * إنشاء قسم معلومات المستخدم في الإعدادات
 */
function createSettingsUserInfo(user) {
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        const userInfoHTML = `
            <div class="settings-user-info" id="settingsUserInfo" style="text-align: center; padding: 25px 20px; border-bottom: 1px solid var(--border-color); background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); margin: -20px -20px 20px -20px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 20px; overflow: hidden; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                         alt="${user.name || 'User'}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='${getDefaultAvatarUrl(user)}'"
                         id="settingsAvatar">
                </div>
                <div style="color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                    <div style="font-weight: 700; font-size: 1.3rem; margin-bottom: 8px;">${user.name || `User ${user.id}`}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 12px; display: inline-block;">
                        ID: ${user.id || 'N/A'}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 8px;">${user.email || ''}</div>
                </div>
            </div>
        `;
        settingsSection.insertAdjacentHTML('afterbegin', userInfoHTML);
    }
}

/**
 * تحديث معلومات المستخدم في الإعدادات
 */
function updateSettingsUserInfo(user) {
    const userInfoElement = document.getElementById('settingsUserInfo');
    if (userInfoElement) {
        const nameElement = userInfoElement.querySelector('div > div:first-child');
        const idElement = userInfoElement.querySelector('div > div:nth-child(2)');
        const emailElement = userInfoElement.querySelector('div > div:last-child');
        
        if (nameElement) nameElement.textContent = user.name || `User ${user.id}`;
        if (idElement) idElement.textContent = `ID: ${user.id || 'N/A'}`;
        if (emailElement) emailElement.textContent = user.email || '';
    }
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

/**
 * تسجيل الخروج
 */
function logout() {
    console.log('🚪 جاري تسجيل الخروج...');
    
    if (confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟')) {
        showLoadingMessage('جاري تسجيل الخروج...', 'info');
        
        setTimeout(() => {
            clearUserData();
            window.location.reload();
        }, 1000);
    }
}

// ========== نظام مشاركة المنشورات والروابط المباشرة ==========

/**
 * وظيفة لقراءة معلمات URL وتحديد المنشور المطلوب
 */
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const pageParam = urlParams.get('page');
    
    console.log('🔗 معلمات URL المكتشفة:', { postId, pageParam });
    
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

/**
 * تحميل صفحة Yacine مع منشور محدد
 */
function loadYacineWithPost(postId) {
    console.log('📖 جاري تحميل Yacine مع المنشور:', postId);
    
    // تحميل صفحة Yacine
    loadExternalPage('Yacine/index.html', 'Yacine');
    
    // إرسال رسالة بالمنشور المطلوب بعد تحميل الـ iframe
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
                    
                    // إعادة تعيين الرابط بعد تحميل المنشور
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

/**
 * استمع لرسائل من الـ iframe
 */
function setupIframeMessageListener() {
    window.addEventListener('message', function(event) {
        // تحقق من مصدر الرسالة لأسباب أمنية
        const allowedOrigins = [
            'https://yacine2007.github.io',
            'https://ultraspace.wuaze.com',
            'http://ultraspace.wuaze.com',
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
            console.warn('⚠️ رسالة من مصدر غير مصرح به:', event.origin);
            return;
        }
        
        // معالجة أنواع الرسائل المختلفة
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
        
        if (event.data && event.data.type === 'CONTENT_LOADING') {
            showContentLoading(true);
        }
        
        if (event.data && event.data.type === 'CONTENT_LOADED') {
            showContentLoading(false);
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

// ========== إدارة الواجهات والتنقل المحسّن ==========

/**
 * تبديل الواجهة
 */
function switchView(viewId) {
    if (appState.currentView === viewId) return;
    
    // إذا لم يكن المستخدم مصادقاً، لا تسمح بالتبديل
    if (!appState.isAuthenticated && viewId !== 'auth') {
        console.log('🚫 المستخدم غير مصادق، لا يمكن تبديل الواجهات');
        return;
    }
    
    console.log(`🔄 تبديل الواجهة إلى: ${viewId}`);
    
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
        
        // تحديث أزرار التنقل
        elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });
        
        updateHeaderVisibility();
        updateBottomNavVisibility();
        updateViewTitle(viewId);
        updateBackButtonVisibility();
        
        // إعداد الـ iframe إذا لزم الأمر
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

/**
 * تحديث رأس الصفحة المحسّن
 */
function updateHeaderVisibility() {
    // إذا لم يكن المستخدم مصادقاً، لا تعرض الهيدر
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
            elements.homeHeader.style.animation = 'slideDown 0.3s ease';
        }
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) {
            elements.viewHeader.style.display = 'flex';
            elements.viewHeader.style.animation = 'slideDown 0.3s ease';
        }
    }
    
    // في الحواسيب، إظهار homeHeader دائماً
    if (!isMobile && currentView === 'home') {
        if (elements.homeHeader) elements.homeHeader.style.display = 'flex';
    }
}

/**
 * تحديث شريط التنقل السفلي
 */
function updateBottomNavVisibility() {
    // إذا لم يكن المستخدم مصادقاً، لا تعرض التنقل السفلي
    if (!appState.isAuthenticated) {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
        return;
    }
    
    const isMobile = appState.isMobile;
    const currentView = appState.currentView;
    
    if (isMobile && elements.bottomNav) {
        if (currentView === 'home' || currentView === 'notifications' || 
            currentView === 'messages' || currentView === 'settings') {
            elements.bottomNav.classList.remove('hidden');
            elements.bottomNav.classList.add('visible');
            elements.bottomNav.style.display = 'flex';
            elements.bottomNav.style.animation = 'slideUp 0.3s ease';
        } else {
            elements.bottomNav.classList.remove('visible');
            elements.bottomNav.classList.add('hidden');
            setTimeout(() => {
                elements.bottomNav.style.display = 'none';
            }, 300);
        }
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    }
}

/**
 * تحديث زر الرجوع
 */
function updateBackButtonVisibility() {
    if (elements.backBtn) {
        const showBackButton = appState.viewHistory.length > 1 && 
                              appState.currentView !== 'home' && 
                              appState.currentView !== 'auth';
        
        if (showBackButton) {
            elements.backBtn.style.display = 'flex';
            elements.backBtn.style.animation = 'fadeIn 0.3s ease';
        } else {
            elements.backBtn.style.display = 'none';
        }
    }
}

/**
 * تحديث عنوان الواجهة
 */
function updateViewTitle(viewId) {
    if (elements.viewTitle) {
        elements.viewTitle.textContent = viewTitles[viewId] || 'View';
        elements.viewTitle.style.animation = 'fadeIn 0.3s ease';
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

// ========== تأثيرات التحميل والانتظار ==========

/**
 * عرض رسالة تحميل
 */
function showLoadingMessage(message, type = 'info') {
    const loadingMsg = document.getElementById('loadingMessage');
    
    if (!loadingMsg) {
        const msgHTML = `
            <div id="loadingMessage" class="loading-message ${type}" 
                 style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'}; 
                        color: white; padding: 15px 25px; border-radius: 25px; 
                        z-index: 10001; box-shadow: 0 5px 15px rgba(0,0,0,0.2); 
                        animation: fadeIn 0.3s ease, pulse 2s infinite;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⏳'}
                    <span>${message}</span>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', msgHTML);
    } else {
        loadingMsg.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⏳'}
                <span>${message}</span>
            </div>
        `;
        loadingMsg.className = `loading-message ${type}`;
        loadingMsg.style.background = type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)';
        loadingMsg.style.display = 'block';
    }
    
    // إخفاء الرسالة تلقائياً بعد 3 ثوانٍ
    setTimeout(() => {
        const msg = document.getElementById('loadingMessage');
        if (msg) {
            msg.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                msg.remove();
            }, 300);
        }
    }, 3000);
}

/**
 * عرض تأثير تحميل للمحتوى
 */
function showContentLoading(show) {
    const loadingOverlay = document.getElementById('contentLoadingOverlay');
    
    if (show) {
        if (!loadingOverlay) {
            const overlayHTML = `
                <div id="contentLoadingOverlay" 
                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                            background: rgba(var(--background-color-rgb), 0.9); 
                            display: flex; align-items: center; justify-content: center; 
                            z-index: 999; border-radius: 15px;">
                    <div class="loading-spinner" 
                         style="width: 40px; height: 40px; border: 3px solid var(--border-color); 
                                border-top: 3px solid var(--primary-color); border-radius: 50%; 
                                animation: spin 1s linear infinite;"></div>
                </div>
            `;
            
            const activeView = document.querySelector('.view.active');
            if (activeView) {
                activeView.style.position = 'relative';
                activeView.insertAdjacentHTML('beforeend', overlayHTML);
            }
        } else {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        if (loadingOverlay) {
            loadingOverlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }
    }
}

/**
 * إضافة تأثير تحميل للصور
 */
function setupImageLoadingEffects() {
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img:not([data-no-loading])');
        
        images.forEach(img => {
            // تخطي الصور التي تم تحميلها بالفعل
            if (img.complete) return;
            
            // إضافة تأثير تحميل
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            
            img.addEventListener('error', function() {
                this.style.opacity = '1';
            });
        });
    });
}

// ========== إدارة الـ iframes المحسّنة ==========

/**
 * إعداد أبعاد الـ iframe
 */
function setupIframeDimensions(iframe) {
    const isMobile = appState.isMobile;
    
    if (isMobile) {
        // للهواتف: ارتفاع كامل الشاشة مع مراعاة الهيدر
        const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = availableHeight + 'px';
        iframe.style.maxHeight = 'none';
    } else {
        // للحواسيب: ارتفاع متكيف
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = '600px';
        iframe.style.maxHeight = 'none';
    }
    
    // إزالة الحدود والزوايا المدورة
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
            showContentLoading(false);
            adjustIframeHeight(this);
        });
        
        iframe.addEventListener('error', function() {
            console.error('❌ فشل تحميل الـ iframe:', this.src);
            showContentLoading(false);
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
                // للهواتف: استخدام الارتفاع الكامل مع الهيدر
                const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
                const viewportHeight = window.innerHeight;
                const availableHeight = viewportHeight - headerHeight;
                iframe.style.height = availableHeight + 'px';
            } else {
                // للحواسيب: استخدام الارتفاع الفعلي للصفحة
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
            updateBackButtonVisibility();
            
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

/**
 * تحميل الصفحات الخارجية
 */
async function loadExternalPage(url, title = 'Page') {
    // إذا لم يكن المستخدم مصادقاً، لا تسمح بتحميل الصفحات
    if (!appState.isAuthenticated) {
        console.log('🚫 المستخدم غير مصادق، لا يمكن تحميل الصفحات');
        return false;
    }
    
    console.log(`🌐 جاري تحميل الصفحة الخارجية: ${url}`);
    appState.isLoading = true;
    showContentLoading(true);
    
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
                console.error('❌ فشل تحميل محتوى الـ iframe:', url);
                setupIframeDimensions(this);
                appState.isLoading = false;
                showContentLoading(false);
                showErrorView();
            };
            
            switchView('externalPage');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الصفحة:', error);
        showContentLoading(false);
        showErrorView();
        appState.isLoading = false;
        return false;
    }
}

/**
 * إعداد الـ iframe للتحميل
 */
function setupIframeForLoading(iframe) {
    iframe.style.opacity = '0.7';
    iframe.style.transition = 'opacity 0.3s ease';
    setupIframeDimensions(iframe);
    
    setTimeout(() => {
        iframe.style.opacity = '1';
    }, 500);
}

/**
 * فتح الدردشة AI
 */
function openAIChat() {
    console.log('🤖 فتح الدردشة AI...');
    
    if (elements.aiIframe) {
        setupIframeForLoading(elements.aiIframe);
        
        elements.aiIframe.src = 'https://yacine2007.github.io/ultraspace-ai/';
        elements.aiIframe.onload = function() {
            setupIframeDimensions(this);
            setTimeout(() => {
                adjustIframeHeight(this);
            }, 500);
        };
        
        elements.aiIframe.onerror = function() {
            console.error('❌ فشل تحميل UltraSpace AI');
            setupIframeDimensions(this);
        };
        
        switchView('aiChat');
    }
}

/**
 * عرض واجهة الخطأ
 */
function showErrorView() {
    switchView('error');
}

// ========== إعدادات اللغة والتهيئة ==========

/**
 * إعداد اختيار اللغة
 */
function setupLanguageSelector() {
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        
        elements.languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            appState.language = selectedLang;
            localStorage.setItem('language', selectedLang);
            
            showLoadingMessage('Language updated!', 'success');
            console.log('🌐 تم تغيير اللغة إلى:', selectedLang);
        });
    }
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    // أزرار التنقل
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const viewId = this.dataset.view;
            if (viewId) {
                switchView(viewId);
            }
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
    
    // زر الصفحة الرئيسية في واجهة الخطأ
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', function() {
            switchView('home');
        });
    }
    
    // عناصر الرسائل
    elements.messageItems.forEach(item => {
        item.addEventListener('click', function() {
            const url = this.dataset.url;
            const title = this.dataset.title || 'Page';
            
            if (url) {
                loadExternalPage(url, title);
            }
        });
    });
    
    // البحث في الواجهة الرئيسية
    if (elements.searchInput) {
        elements.searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 0 2px var(--primary-color)';
        });
        
        elements.searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = '';
        });
        
        elements.searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            console.log('🔍 البحث:', searchTerm);
            // يمكن إضافة وظيفة البحث هنا
        });
    }
    
    // النقر على الصورة الرمزية في الهيدر الرئيسي
    if (elements.homeProfileAvatar) {
        elements.homeProfileAvatar.addEventListener('click', function() {
            switchView('settings');
        });
    }
    
    // إعدادات اللمس للهواتف
    setupTouchEvents();
}

/**
 * إعداد أحداث اللمس
 */
function setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        currentX = e.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        const diffX = startX - currentX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0 && appState.currentView === 'home') {
                // سحب لليسار - فتح الإشعارات
                switchView('notifications');
            } else if (diffX < 0 && appState.currentView === 'notifications') {
                // سحب لليمين - العودة للرئيسية
                switchView('home');
            }
        }
    }, { passive: true });
}

/**
 * تهيئة التطبيق
 */
function initializeApp() {
    console.log('🚀 بدء تهيئة UltraSpace...');
    
    // التحقق من المصادقة أولاً
    if (!checkBYPROAuthentication()) {
        console.log('🔐 المستخدم غير مصادق، إنشاء واجهة المصادقة...');
        createAuthView();
        return;
    }
    
    console.log('✅ المستخدم مصادق، تهيئة التطبيق...');
    
    // إخفاء شاشة التحميل
    if (elements.loadingScreen) {
        elements.loadingScreen.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
            elements.appContainer.style.display = 'block';
        }, 500);
    }
    
    // إعداد الواجهات
    setupEventListeners();
    setupLanguageSelector();
    setupIframeMessageListener();
    setupIframeResizeHandler();
    setupImageLoadingEffects();
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // التحقق من معلمات URL
    const hasUrlParams = handleUrlParameters();
    
    // إذا لم تكن هناك معلمات URL، عرض الواجهة الرئيسية
    if (!hasUrlParams) {
        switchView('home');
    }
    
    console.log('🎉 تم تهيئة UltraSpace بنجاح!');
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء التطبيق...');
    initializeApp();
});

// منع سلوك السحب للتحديث على الهواتف
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// CSS إضافي للتحميل والتأثيرات
const additionalStyles = `
/* تأثيرات التحميل والانتقالات */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
}

/* شريط البحث في الواجهة الرئيسية */
.home-search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: var(--card-color);
    border-radius: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    flex: 1;
    max-width: 500px;
}

.home-search-bar:focus-within {
    box-shadow: 0 4px 15px rgba(58, 134, 255, 0.2);
    transform: translateY(-1px);
}

.home-search-bar input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-color);
    font-size: 0.95rem;
    outline: none;
    padding: 8px 0;
}

.home-search-bar input::placeholder {
    color: var(--text-muted);
}

.home-header-content {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    justify-content: space-between;
}

.home-profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.home-profile-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
}

/* تأثيرات التحميل */
.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.content-loading {
    position: relative;
}

.content-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* زر الرجوع الدائري */
.back-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--card-color);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.back-btn:hover {
    background: var(--primary-color);
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
}

.back-btn svg {
    width: 20px;
    height: 20px;
    fill: var(--text-color);
    transition: fill 0.3s ease;
}

.back-btn:hover svg {
    fill: white;
}

/* معلومات المستخدم في الإعدادات */
.settings-user-info {
    text-align: center;
    padding: 25px 20px;
    border-bottom: 1px solid var(--border-color);
    background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
    margin: -20px -20px 20px -20px;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.settings-user-info img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.3);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.settings-user-info .user-name {
    font-weight: 700;
    font-size: 1.3rem;
    margin-bottom: 8px;
}

.settings-user-info .user-id {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 5px;
    background: rgba(255,255,255,0.2);
    padding: 3px 10px;
    border-radius: 12px;
    display: inline-block;
}

.settings-user-info .user-email {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-top: 8px;
}

/* تحسينات للهواتف */
@media (max-width: 768px) {
    .home-header-content {
        gap: 12px;
    }
    
    .home-search-bar {
        padding: 6px 14px;
    }
    
    .home-profile-avatar {
        width: 36px;
        height: 36px;
    }
    
    .settings-user-info {
        padding: 20px 15px;
    }
    
    .settings-user-info img {
        width: 80px;
        height: 80px;
    }
}

/* تحسينات للحواسيب */
@media (min-width: 1025px) {
    .home-header {
        padding: 15px 25px;
    }
    
    .home-search-bar {
        max-width: 600px;
    }
}
`;

// إضافة الأنماط الإضافية للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
