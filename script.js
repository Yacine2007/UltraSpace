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

// عناصر DOM - سيتم تهيئتها بعد تحميل الصفحة
let elements = {};
let views = {};

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

// ========== تهيئة عناصر DOM ==========

/**
 * تهيئة جميع عناصر DOM
 */
function initializeDOMElements() {
    console.log('🔍 جاري تهيئة عناصر DOM...');
    
    // عناصر الأساسية
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

    // عناصر الواجهات
    views = {
        home: document.getElementById('homeView'),
        notifications: document.getElementById('notificationsView'),
        messages: document.getElementById('messagesView'),
        settings: document.getElementById('settingsView'),
        aiChat: document.getElementById('aiChatView'),
        externalPage: document.getElementById('externalPageView'),
        error: document.getElementById('errorView')
    };

    // تسجيل العناصر التي تم العثور عليها
    console.log('✅ عناصر DOM التي تم العثور عليها:');
    Object.keys(elements).forEach(key => {
        if (elements[key]) {
            console.log(`   ✓ ${key}`);
        } else {
            console.log(`   ✗ ${key} - غير موجود`);
        }
    });

    console.log('✅ واجهات التي تم العثور عليها:');
    Object.keys(views).forEach(key => {
        if (views[key]) {
            console.log(`   ✓ ${key}`);
        } else {
            console.log(`   ✗ ${key} - غير موجود`);
        }
    });
}

// ========== إضافة أنماط CSS ديناميكياً ==========

function addCustomStyles() {
    const styles = `
        /* شريط التحميل للصفحات */
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
        
        /* تأثير التلاشي للصور أثناء التحميل */
        .image-loading {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .image-loaded {
            opacity: 1;
        }
        
        /* تصميم متقدم لبطاقة المستخدم في الإعدادات */
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
        
        /* زر الرجوع الدائري المحسن */
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
        
        /* شريط البحث المحسن */
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
        
        /* إشعار تسجيل الدخول */
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
        
        /* تأثيرات التحميل للصفحات */
        .content-loading {
            position: relative;
            overflow: hidden;
        }
        
        .content-loading::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* تحسينات للعرض على الهواتف */
        .view.active {
            display: block !important;
            opacity: 1 !important;
        }
        
        .view:not(.active) {
            display: none !important;
        }

        /* إصلاحات للعرض */
        .main-content {
            width: 100%;
            height: 100%;
        }

        /* تأكد من ظهور العناصر */
        #appContainer {
            display: block !important;
            opacity: 1 !important;
        }

        /* إصلاحات للـ iframe */
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

        /* إصلاح لواجهة المصادقة */
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

        /* إصلاح لواجهة الصفحات الخارجية */
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
    console.log('✅ تم إضافة الأنماط المخصصة');
}

// ========== نظام المصادقة ==========

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
                localStorage.removeItem('bypro_user');
                localStorage.removeItem('ultraspace_user_avatar_url');
                appState.isAuthenticated = false;
                appState.userAvatarUrl = '';
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في تحليل بيانات المستخدم:', error);
            localStorage.removeItem('bypro_user');
            localStorage.removeItem('ultraspace_user_avatar_url');
            appState.isAuthenticated = false;
            appState.userAvatarUrl = '';
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
 * إنشاء واجهة المصادقة كاملة الشاشة
 */
function createAuthView() {
    console.log('🔐 إنشاء واجهة المصادقة...');
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('❌ لم يتم العثور على main-content');
        // إنشاء main-content إذا لم يكن موجوداً
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            const newMainContent = document.createElement('div');
            newMainContent.className = 'main-content';
            appContainer.appendChild(newMainContent);
            mainContent = newMainContent;
        } else {
            console.error('❌ لم يتم العثور على appContainer أيضاً');
            return;
        }
    }
    
    // إخفاء جميع العناصر الأخرى أولاً
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
    
    // إعداد مستمع للرسائل من iframe المصادقة
    setupAuthIframeListener();
    
    console.log('✅ تم إنشاء واجهة المصادقة بنجاح');
}

/**
 * إخفاء جميع عناصر واجهة المستخدم
 */
function hideAllUIElements() {
    console.log('👻 إخفاء جميع عناصر واجهة المستخدم');
    
    // إخفاء التطبيق الرئيسي
    if (elements.appContainer) {
        elements.appContainer.style.display = 'none';
    }
    
    // إخفاء الشريط الجانبي إذا كان موجوداً
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';
    
    // إخفاء التنقل السفلي
    if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    
    // إخفاء الهيدرات
    if (elements.homeHeader) elements.homeHeader.style.display = 'none';
    if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    
    // إخفاء جميع الواجهات
    Object.values(views).forEach(view => {
        if (view && view.id !== 'authView') {
            view.style.display = 'none';
            view.classList.remove('active');
        }
    });
}

/**
 * إظهار جميع عناصر واجهة المستخدم للمستخدم المصادق
 */
function showAllUIElements() {
    console.log('👁️ إظهار جميع عناصر واجهة المستخدم');
    
    // إظهار التطبيق الرئيسي
    if (elements.appContainer) {
        elements.appContainer.style.display = 'block';
        elements.appContainer.style.opacity = '1';
    }
    
    // إظهار الهيدر المناسب
    updateHeaderVisibility();
    
    // إظهار التنقل السفلي
    updateBottomNavVisibility();
    
    // إظهار الواجهة النشطة
    if (views[appState.currentView]) {
        views[appState.currentView].style.display = 'block';
        views[appState.currentView].classList.add('active');
    }
}

/**
 * إعداد مستمع لرسائل iframe المصادقة
 */
function setupAuthIframeListener() {
    function handleAuthMessage(event) {
        // التحقق من مصدر الرسالة
        const allowedOrigins = [
            'https://yacine2007.github.io',
            window.location.origin,
            'https://ultraspace.wuaze.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
            console.warn('⚠️ رسالة من مصدر غير مصرح به:', event.origin);
            return;
        }
        
        console.log('📨 تم استلام رسالة من iframe المصادقة:', event.data);
        
        // إذا كانت هناك بيانات مستخدم
        if (event.data && event.data.type === 'USER_AUTHENTICATED') {
            console.log('🔑 تم استلام رسالة مصادقة المستخدم');
            handleSuccessfulAuth();
        }
    }
    
    window.addEventListener('message', handleAuthMessage);
    
    // فحص دوري مكثف لحالة المصادقة
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            console.log('🔄 الفحص الدوري: المستخدم مصادق');
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        }
    }, 1000);
    
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
    
    // إظهار إشعار تسجيل الدخول
    showLoginNotification();
    
    // إعادة تحميل الصفحة بعد تأخير قصير
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

/**
 * إظهار إشعار تسجيل الدخول
 */
function showLoginNotification() {
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle" style="font-size: 1.1rem;"></i>
            <span>تم تسجيل الدخول بنجاح إلى ultraspace.wuaze.com</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد الرسوم المتحركة
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
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
    }
}

/**
 * تحديث شريط العنوان مع زر الرجوع الدائري
 */
function updateViewHeader() {
    const viewHeader = document.getElementById('viewHeader');
    if (!viewHeader) {
        console.log('⚠️ viewHeader غير موجود');
        return;
    }
    
    // تحديث زر الرجوع ليكون دائرياً
    const backBtn = viewHeader.querySelector('#backBtn');
    if (backBtn && !backBtn.classList.contains('enhanced')) {
        backBtn.classList.add('back-btn-circle');
        backBtn.classList.add('enhanced');
        
        // إضافة أيقونة إذا لم تكن موجودة
        if (!backBtn.querySelector('i')) {
            backBtn.innerHTML = '<i class="fas fa-chevron-left" style="color: var(--text-color);"></i>';
        }
    }
    
    // تحديث شريط البحث والصورة الرمزية في الواجهة الرئيسية
    updateHomeHeader();
}

/**
 * تحديث الهيدر الرئيسي مع شريط البحث والصورة الرمزية
 */
function updateHomeHeader() {
    const homeHeader = document.getElementById('homeHeader');
    if (!homeHeader) {
        console.log('⚠️ homeHeader غير موجود');
        return;
    }
    
    // البحث عن شريط البحث الحالي
    let searchBar = homeHeader.querySelector('.search-bar');
    
    if (searchBar && !searchBar.classList.contains('enhanced')) {
        // تحسين شريط البحث الحالي
        searchBar.classList.add('enhanced');
        
        const user = getAuthenticatedUser();
        const avatarUrl = appState.userAvatarUrl || (user ? user.image : '');
        
        // إنشاء حاوية محسنة للبحث والصورة الرمزية
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

/**
 * عرض معلومات المستخدم في الإعدادات بشكل محسن
 */
function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (user) {
        console.log('👤 عرض معلومات المستخدم:', user);
        
        // تحديث الصورة الرمزية في الهيدر
        updateProfileAvatar(user);
        
        // تحديث الصورة في الإعدادات بشكل محسن
        updateEnhancedSettingsAvatar(user);
    }
}

/**
 * تحديث الصورة الرمزية في الهيدر
 */
function updateProfileAvatar(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        // استخدام الرابط المحفوظ أو من البيانات الحالية
        const avatarUrl = appState.userAvatarUrl || user.image;
        
        if (avatarUrl) {
            // إضافة تأثير التحميل للصورة
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
            // استخدام الصورة الافتراضية
            profileAvatar.src = getDefaultAvatarUrl(user);
        }
        profileAvatar.alt = user.name || `User ${user.id}`;
    }
}

/**
 * الحصول على رابط الصورة الافتراضية
 */
function getDefaultAvatarUrl(user) {
    const name = user && user.name ? user.name : (user && user.id ? user.id : 'User');
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=3a86ff&color=fff';
}

/**
 * تحديث الصورة في الإعدادات بشكل محسن مع معلومات المستخدم
 */
function updateEnhancedSettingsAvatar(user) {
    if (!user) {
        console.log('⚠️ لا توجد بيانات مستخدم لعرضها');
        return;
    }
    
    let settingsSection = document.querySelector('.settings-section');
    
    if (!settingsSection) {
        console.log('⚠️ قسم الإعدادات غير موجود');
        return;
    }
    
    // البحث عن بطاقة المستخدم الحالية أو إنشاء جديدة
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
    } else {
        // تحديث البيانات الموجودة
        const avatar = userProfileCard.querySelector('#settingsAvatar');
        const name = userProfileCard.querySelector('.user-name');
        const userId = userProfileCard.querySelector('.user-id');
        const email = userProfileCard.querySelector('.user-email');
        
        if (avatar) {
            avatar.classList.add('image-loading');
            avatar.src = (appState.userAvatarUrl || user.image) + '?t=' + Date.now();
            avatar.onload = function() {
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
            avatar.onerror = function() {
                this.src = getDefaultAvatarUrl(user);
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
        }
        if (name) name.textContent = user.name || `User ${user.id}`;
        if (userId) userId.textContent = `ID: ${user.id || 'N/A'}`;
        if (email) email.textContent = user.email || 'No email provided';
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
        localStorage.removeItem('bypro_user');
        localStorage.removeItem('ultraspace_user_avatar_url');
        appState.isAuthenticated = false;
        appState.userAvatarUrl = '';
        
        // إعادة تحميل الصفحة للعودة إلى واجهة المصادقة
        window.location.reload();
    }
}

// ========== إدارة الـ iframes ==========

/**
 * إعداد أبعاد الـ iframe
 */
function setupIframeDimensions(iframe) {
    if (!iframe) return;
    
    const isMobile = appState.isMobile;
    
    if (isMobile) {
        // للهواتف: ارتفاع كامل الشاشة مع مراعاة الهيدر
        const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = availableHeight + 'px';
    } else {
        // للحواسيب: ارتفاع متكيف
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

/**
 * إعداد مستمع لرسائل الـ iframe
 */
function setupIframeMessageListener() {
    window.addEventListener('message', function(event) {
        // تحقق من مصدر الرسالة لأسباب أمنية
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
    
    try {
        if (elements.externalIframe) {
            // إعداد الـ iframe للتحميل
            elements.externalIframe.style.opacity = '0';
            elements.externalIframe.style.transition = 'opacity 0.3s ease';
            
            // تعيين المصدر
            elements.externalIframe.src = url;
            viewTitles.externalPage = title;
            
            // معالجة التحميل الناجح
            elements.externalIframe.onload = function() {
                console.log('✅ تم تحميل الصفحة الخارجية بنجاح');
                this.style.opacity = '1';
                setupIframeDimensions(this);
                
                // إرسال رسالة إذا كان هناك منشور مطلوب
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('post');
                
                if (postId && url.includes('Yacine') && this.contentWindow) {
                    setTimeout(() => {
                        this.contentWindow.postMessage({
                            type: 'SHOW_POST',
                            postId: postId
                        }, '*');
                        console.log('📨 تم إرسال رسالة عرض المنشور:', postId);
                    }, 1000);
                }
            };
            
            // معالجة الأخطاء
            elements.externalIframe.onerror = function() {
                console.error('❌ فشل تحميل الصفحة الخارجية:', url);
                this.style.opacity = '1';
                switchView('error');
            };
        }
        
        // التبديل إلى واجهة الصفحة الخارجية
        switchView('externalPage');
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الصفحة الخارجية:', error);
        switchView('error');
        return false;
    }
}

/**
 * فتح الدردشة AI
 */
function openAIChat() {
    console.log('🤖 فتح الدردشة AI...');
    loadExternalPage('Ai/AI.html', 'UltraSpace AI');
}

/**
 * فتح صفحة Yacine
 */
function openYacine() {
    console.log('📖 فتح صفحة Yacine...');
    loadExternalPage('Yacine/index.html', 'Yacine');
}

/**
 * فتح الملف الشخصي
 */
function openProfile() {
    console.log('👤 فتح الملف الشخصي...');
    loadExternalPage('Profile/Profile.html', 'Edit Profile');
}

// ========== إدارة الواجهات والتنقل ==========

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
            console.error(`❌ الواجهة ${viewId} غير موجودة`);
            // الرجوع إلى الواجهة الرئيسية إذا كانت الواجهة المطلوبة غير موجودة
            if (views.home) {
                views.home.style.display = 'block';
                views.home.classList.add('active');
                appState.currentView = 'home';
            }
        }
        
        // تحديث أزرار التنقل
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

/**
 * تحديث رأس الصفحة
 */
function updateHeaderVisibility() {
    // إذا لم يكن المستخدم مصادقاً، لا تعرض الهيدر
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
            elements.bottomNav.style.display = 'flex';
            elements.bottomNav.style.opacity = '1';
        } else {
            elements.bottomNav.style.display = 'none';
        }
    } else {
        if (elements.bottomNav) elements.bottomNav.style.display = 'none';
    }
}

/**
 * تحديث عنوان الواجهة
 */
function updateViewTitle(viewId) {
    if (elements.viewTitle) {
        elements.viewTitle.textContent = viewTitles[viewId] || 'View';
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

// ========== إعدادات التهيئة ==========

/**
 * تهيئة التطبيق
 */
function initializeApp() {
    console.log('🚀 بدء تهيئة UltraSpace...');
    
    // تهيئة عناصر DOM أولاً
    initializeDOMElements();
    
    // إضافة الأنماط المخصصة
    addCustomStyles();
    
    // إعداد مستمع رسائل الـ iframe
    setupIframeMessageListener();
    
    // التحقق من المصادقة
    const isAuthenticated = checkBYPROAuthentication();
    
    if (isAuthenticated) {
        console.log('✅ المستخدم مصادق، بدء التطبيق...');
        startApp();
    } else {
        console.log('❌ المستخدم غير مصادق، عرض واجهة المصادقة...');
        showAuthView();
    }
}

/**
 * بدء التطبيق بعد المصادقة
 */
function startApp() {
    console.log('🎉 بدء تشغيل UltraSpace للمستخدم المصادق...');
    
    // إخفاء شاشة التحميل
    hideLoadingScreen();
    
    // إظهار جميع عناصر واجهة المستخدم
    showAllUIElements();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // تحديث الواجهة
    updateHeaderVisibility();
    updateBottomNavVisibility();
    updateViewHeader();
    
    // التبديل إلى الواجهة الرئيسية
    switchView('home');
    
    console.log('✨ تم تهيئة التطبيق بنجاح!');
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    console.log('🎯 إعداد مستمعي الأحداث...');
    
    // أزرار التنقل
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
        elements.errorHomeBtn.addEventListener('click', function() {
            switchView('home');
        });
    }
    
    // تغيير اللغة
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        elements.languageSelect.addEventListener('change', function() {
            appState.language = this.value;
            localStorage.setItem('language', this.value);
            console.log('🌐 تم تغيير اللغة إلى:', this.value);
        });
    }
    
    // إعداد النقر على القصص والصفحات
    setupClickListeners();
    
    console.log('✅ تم إعداد جميع مستمعي الأحداث');
}

/**
 * إعداد مستمعي النقر للقصص والصفحات
 */
function setupClickListeners() {
    // النقر على القصص
    document.addEventListener('click', function(e) {
        if (e.target.closest('.story-item')) {
            const storyItem = e.target.closest('.story-item');
            const storyName = storyItem.querySelector('.story-name')?.textContent;
            
            if (storyName === 'Yacine') {
                openYacine();
            }
        }
        
        // النقر على الصفحات المقترحة
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
        
        // النقر على عناصر الإعدادات
        if (e.target.closest('.settings-item[data-page]')) {
            const settingsItem = e.target.closest('.settings-item[data-page]');
            const pageUrl = settingsItem.getAttribute('data-page');
            const pageTitle = settingsItem.querySelector('span')?.textContent;
            
            if (pageUrl === 'Ai/AI.html') {
                openAIChat();
            } else if (pageUrl === 'Profile/Profile.html') {
                openProfile();
            } else {
                loadExternalPage(pageUrl, pageTitle);
            }
        }
    });
}

/**
 * إخفاء شاشة التحميل
 */
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

// ========== بدء التطبيق ==========

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء التهيئة...');
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// التعامل مع حالة الخطأ في التحميل
window.addEventListener('error', function(e) {
    console.error('❌ خطأ في الصفحة:', e.error);
});

// التعامل مع رفض الوعود
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ وعد مرفوض:', e.reason);
});

console.log('🤖 تم تحميل UltraSpace Enhancer بنجاح!');
