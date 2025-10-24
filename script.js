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
    const style = document.createElement('style');
    style.textContent = `
        /* تحسينات للشريط العلوي */
        .view-header {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            min-height: 60px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .back-btn-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--primary-color);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(58, 134, 255, 0.3);
        }
        
        .back-btn-circle:hover {
            background: var(--primary-dark);
            transform: scale(1.05);
        }
        
        .back-btn-circle:active {
            transform: scale(0.95);
        }
        
        .view-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-color);
            flex: 1;
        }
        
        /* تحسينات لشاشة التحميل */
        .loading-pulse {
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        
        .skeleton-loader {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* تحسينات لعرض معلومات المستخدم */
        .user-info-detailed {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .user-avatar-large {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 15px;
            overflow: hidden;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            border: 3px solid var(--primary-light);
            box-shadow: 0 4px 15px rgba(58, 134, 255, 0.2);
        }
        
        .user-avatar-large img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-name {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 5px;
        }
        
        .user-id {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 8px;
            font-family: monospace;
            background: var(--background-light);
            padding: 3px 8px;
            border-radius: 12px;
            display: inline-block;
        }
        
        .user-email {
            font-size: 0.95rem;
            color: var(--primary-color);
            word-break: break-all;
        }
        
        /* تحسينات للشريط العلوي في الصفحة الرئيسية */
        .home-top-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 15px;
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
        }
        
        .search-bar-enhanced {
            flex: 1;
            position: relative;
        }
        
        .user-avatar-mini {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid var(--primary-light);
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .user-avatar-mini:hover {
            transform: scale(1.05);
        }
        
        .user-avatar-mini img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* تأثيرات للتحميل */
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
        
        /* تحسينات للـ iframe */
        .iframe-loading {
            background: var(--background-light);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
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
    
    const authViewHTML = `
        <div class="view active" id="authView" style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 10000; background: var(--background-color);">
            <div class="view-content" style="height: 100vh; padding: 0; margin: 0;">
                <div class="auth-container">
                    <div style="text-align: center; padding: 20px; background: var(--primary-color); color: white;">
                        <h2 style="margin: 0; font-size: 1.5rem;">UltraSpace</h2>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Allowed Domain: ultraspace.wuaze.com</p>
                    </div>
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
        // التحقق من مصدر الرسالة
        const allowedOrigins = [
            'https://yacine2007.github.io',
            window.location.origin,
            'https://ultraspace.wuaze.com'
        ];
        
        if (!allowedOrigins.includes(event.origin)) {
            console.warn('⚠️ رسالة من مصدر غير مصرح به:', event.origin);
            return;
        }
        
        console.log('📨 تم استلام رسالة من iframe المصادقة:', event.data);
        
        // إذا كانت هناك بيانات مستخدم (من خلال localStorage)
        if (event.data && event.data.type === 'USER_AUTHENTICATED') {
            console.log('🔑 تم استلام رسالة مصادقة المستخدم');
            handleSuccessfulAuth();
        }
    });
    
    // فحص دوري مكثف لحالة المصادقة
    const checkAuthInterval = setInterval(() => {
        if (checkBYPROAuthentication()) {
            console.log('🔄 الفحص الدوري: المستخدم مصادق');
            handleSuccessfulAuth();
            clearInterval(checkAuthInterval);
        } else {
            console.log('🔄 الفحص الدوري: المستخدم غير مصادق بعد');
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
    }
}

/**
 * تحديث الشريط العلوي في الصفحة الرئيسية
 */
function updateHomeTopBar() {
    const homeView = document.getElementById('homeView');
    if (!homeView) return;
    
    // التحقق مما إذا كان الشريط العلوي موجوداً بالفعل
    let homeTopBar = homeView.querySelector('.home-top-bar');
    
    if (!homeTopBar) {
        homeTopBar = document.createElement('div');
        homeTopBar.className = 'home-top-bar';
        homeTopBar.innerHTML = `
            <div class="search-bar-enhanced">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search in UltraSpace...">
                </div>
            </div>
            <div class="user-avatar-mini" id="homeUserAvatar">
                <img src="${appState.userAvatarUrl || getDefaultAvatarUrl(getAuthenticatedUser())}" 
                     alt="Profile" 
                     onerror="this.src='${getDefaultAvatarUrl(getAuthenticatedUser())}'">
            </div>
        `;
        
        // إدراج الشريط العلوي في بداية homeView
        const firstChild = homeView.firstElementChild;
        if (firstChild) {
            homeView.insertBefore(homeTopBar, firstChild);
        } else {
            homeView.appendChild(homeTopBar);
        }
        
        // إضافة مستمع حدث لفتح الملف الشخصي
        const homeUserAvatar = document.getElementById('homeUserAvatar');
        if (homeUserAvatar) {
            homeUserAvatar.addEventListener('click', openProfile);
        }
        
        // إضافة مستمع حدث للبحث
        const searchInput = homeTopBar.querySelector('input');
        if (searchInput) {
            searchInput.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            searchInput.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
            
            searchInput.addEventListener('input', function() {
                console.log('🔍 بحث:', this.value);
            });
        }
    } else {
        // تحديث صورة المستخدم إذا كان الشريط موجوداً
        const homeUserAvatar = homeTopBar.querySelector('#homeUserAvatar img');
        if (homeUserAvatar) {
            homeUserAvatar.src = appState.userAvatarUrl || getDefaultAvatarUrl(getAuthenticatedUser());
        }
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
        updateSettingsAvatarEnhanced(user);
        
        // تحديث الشريط العلوي في الصفحة الرئيسية
        updateHomeTopBar();
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
            profileAvatar.src = avatarUrl + '?t=' + Date.now(); // إضافة timestamp لمنع التخزين المؤقت
            profileAvatar.alt = user.name || `User ${user.id}`;
            profileAvatar.onerror = function() {
                // إذا فشل تحميل الصورة، استخدم الصورة الافتراضية
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
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.id) + '&background=3a86ff&color=fff';
}

/**
 * تحديث الصورة في الإعدادات بشكل محسن
 */
function updateSettingsAvatarEnhanced(user) {
    let userInfoSection = document.getElementById('userInfoEnhanced');
    
    if (!userInfoSection) {
        // إنشاء قسم معلومات المستخدم المحسن إذا لم يكن موجوداً
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            const avatarUrl = appState.userAvatarUrl || user.image;
            const userInfoHTML = `
                <div class="user-info-detailed" id="userInfoEnhanced">
                    <div class="user-avatar-large">
                        <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                             alt="${user.name || 'User'}" 
                             onerror="this.src='${getDefaultAvatarUrl(user)}'"
                             class="loading-pulse">
                    </div>
                    <div class="user-name">${user.name || `User ${user.id}`}</div>
                    <div class="user-id">ID: ${user.id || 'N/A'}</div>
                    <div class="user-email">${user.email || 'No email provided'}</div>
                </div>
            `;
            
            // إدراج قسم معلومات المستخدم في بداية الإعدادات
            const firstChild = settingsSection.firstElementChild;
            if (firstChild) {
                settingsSection.insertBefore(createElementFromHTML(userInfoHTML), firstChild);
            } else {
                settingsSection.innerHTML = userInfoHTML + settingsSection.innerHTML;
            }
            
            userInfoSection = document.getElementById('userInfoEnhanced');
        }
    } else {
        // تحديث البيانات إذا كان القسم موجوداً
        const avatarImg = userInfoSection.querySelector('img');
        const userName = userInfoSection.querySelector('.user-name');
        const userId = userInfoSection.querySelector('.user-id');
        const userEmail = userInfoSection.querySelector('.user-email');
        
        if (avatarImg) {
            avatarImg.src = (appState.userAvatarUrl || user.image || getDefaultAvatarUrl(user)) + '?t=' + Date.now();
        }
        if (userName) userName.textContent = user.name || `User ${user.id}`;
        if (userId) userId.textContent = `ID: ${user.id || 'N/A'}`;
        if (userEmail) userEmail.textContent = user.email || 'No email provided';
    }
}

/**
 * وظيفة مساعدة لتحويل HTML إلى عنصر
 */
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
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

// ========== إدارة الواجهات والتنقل ==========

/**
 * إضافة شريط علوي للواجهات
 */
function addViewHeader(viewId, title) {
    const view = views[viewId];
    if (!view) return;
    
    // التحقق مما إذا كان الشريط العلوي موجوداً بالفعل
    let viewHeader = view.querySelector('.view-header');
    
    if (!viewHeader && viewId !== 'home' && viewId !== 'auth') {
        viewHeader = document.createElement('div');
        viewHeader.className = 'view-header';
        viewHeader.innerHTML = `
            <button class="back-btn-circle" onclick="goBack()">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="view-title">${title}</div>
        `;
        
        // إدراج الشريط العلوي في بداية الواجهة
        const firstChild = view.firstElementChild;
        if (firstChild) {
            view.insertBefore(viewHeader, firstChild);
        } else {
            view.appendChild(viewHeader);
        }
    }
}

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
            
            // إضافة/تحديث الشريط العلوي للواجهة
            addViewHeader(viewId, viewTitles[viewId] || 'View');
            
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
        
        // إعداد الـ iframe إذا لزم الأمر
        if (viewId === 'aiChat' || viewId === 'externalPage') {
            setTimeout(() => {
                const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
                if (activeIframe) {
                    setupIframeDimensions(activeIframe);
                    showLoadingIndicator(activeIframe);
                }
            }, 100);
        }
    }, 150);
}

/**
 * إظهار مؤشر التحميل للـ iframe
 */
function showLoadingIndicator(iframe) {
    const iframeContainer = iframe.parentElement;
    if (!iframeContainer.querySelector('.iframe-loading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'iframe-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        iframeContainer.appendChild(loadingDiv);
        
        iframe.onload = function() {
            setTimeout(() => {
                if (loadingDiv.parentElement) {
                    loadingDiv.remove();
                }
            }, 500);
        };
    }
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
    const isMobile = appState.isMobile;
    
    if (currentView === 'home') {
        if (elements.homeHeader) elements.homeHeader.style.display = 'flex';
        if (elements.viewHeader) elements.viewHeader.style.display = 'none';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'flex';
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

// ========== إدارة الـ iframes ==========

/**
 * إعداد أبعاد الـ iframe
 */
function setupIframeDimensions(iframe) {
    const isMobile = appState.isMobile;
    
    if (isMobile) {
        // للهواتف: ارتفاع كامل الشاشة مع مراعاة الهيدر
        const headerHeight = document.querySelector('.view-header')?.offsetHeight || 60;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight;
        
        iframe.style.height = availableHeight + 'px';
        iframe.style.minHeight = availableHeight + 'px';
        iframe.style.maxHeight = 'none';
    } else {
        // للحواسيب: ارتفاع متكيف
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.view-header')?.offsetHeight || 70;
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
                // للهواتف: استخدام الارتفاع الكامل مع الهيدر
                const headerHeight = document.querySelector('.view-header')?.offsetHeight || 60;
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
        console.log('🚫 المستخدم غير مصادق، لا يمكن تحميل الصفحات الخارجية');
        return;
    }
    
    console.log(`🌐 جاري تحميل الصفحة الخارجية: ${url}`);
    
    // إضافة شريط علوي للصفحة الخارجية
    addViewHeader('externalPage', title);
    
    // تبديل إلى واجهة الصفحة الخارجية
    switchView('externalPage');
    
    // إعداد الـ iframe
    if (elements.externalIframe) {
        elements.externalIframe.src = url;
        setupIframeDimensions(elements.externalIframe);
        showLoadingIndicator(elements.externalIframe);
    }
}

// ========== إعدادات اللغة ==========

/**
 * تحديث اللغة
 */
function updateLanguage() {
    const selectedLanguage = elements.languageSelect?.value || 'en';
    
    if (appState.language !== selectedLanguage) {
        appState.language = selectedLanguage;
        localStorage.setItem('language', selectedLanguage);
        
        console.log(`🌐 تم تغيير اللغة إلى: ${selectedLanguage}`);
        
        // إعادة تحميل الترجمة
        loadTranslations();
    }
}

/**
 * تحميل الترجمات
 */
function loadTranslations() {
    // يمكن إضافة نظام ترجمة هنا في المستقبل
    console.log(`🌐 تحميل الترجمات للغة: ${appState.language}`);
}

// ========== إعدادات التهيئة ==========

/**
 * تهيئة التطبيق
 */
function initializeApp() {
    console.log('🚀 تهيئة تطبيق UltraSpace...');
    
    // إضافة الأنماط الديناميكية
    addDynamicStyles();
    
    // التحقق من المصادقة
    const isAuthenticated = checkBYPROAuthentication();
    
    if (!isAuthenticated) {
        console.log('🔐 المستخدم غير مصادق، إنشاء واجهة المصادقة...');
        createAuthView();
        switchView('auth');
        return;
    }
    
    console.log('✅ المستخدم مصادق، تحميل التطبيق...');
    
    // إعداد المستمعين
    setupEventListeners();
    setupIframeMessageListener();
    setupIframeResizeHandler();
    
    // إعداد الـ iframes
    setupIframeResizing();
    
    // التحقق من معلمات URL
    const hasUrlParams = handleUrlParameters();
    
    // إذا لم تكن هناك معلمات URL، تحميل الصفحة الرئيسية
    if (!hasUrlParams) {
        switchView('home');
    }
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // إخفاء شاشة التحميل
    hideLoadingScreen();
    
    console.log('🎉 تم تحميل تطبيق UltraSpace بنجاح');
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
    
    // زر العودة للصفحة الرئيسية من شاشة الخطأ
    if (elements.errorHomeBtn) {
        elements.errorHomeBtn.addEventListener('click', function() {
            switchView('home');
        });
    }
    
    // زر تسجيل الخروج
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    
    // اختيار اللغة
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
        elements.languageSelect.addEventListener('change', updateLanguage);
    }
    
    // عناصر الرسائل
    elements.messageItems?.forEach(item => {
        item.addEventListener('click', function() {
            const messageId = this.dataset.messageId;
            if (messageId) {
                console.log(`💬 فتح الرسالة: ${messageId}`);
                // يمكن إضافة منطق فتح الرسالة هنا
            }
        });
    });
    
    // فتح الملف الشخصي
    if (elements.profileAvatar) {
        elements.profileAvatar.addEventListener('click', openProfile);
    }
    
    // إضافة مستمع للبحث
    if (elements.searchInput) {
        elements.searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        elements.searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        elements.searchInput.addEventListener('input', function() {
            console.log('🔍 بحث:', this.value);
        });
    }
}

/**
 * فتح الملف الشخصي
 */
function openProfile() {
    console.log('👤 فتح الملف الشخصي');
    // يمكن إضافة منطق فتح الملف الشخصي هنا
    switchView('settings');
}

/**
 * إخفاء شاشة التحميل
 */
function hideLoadingScreen() {
    if (elements.loadingScreen) {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }
}

// ========== بدء التطبيق ==========

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء التطبيق...');
    initializeApp();
});

// إعادة تهيئة التطبيق عند تحميل الصفحة بالكامل
window.addEventListener('load', function() {
    console.log('🖼️ تم تحميل جميع الموارد');
    
    // تحديث حالة المصادقة مرة أخرى للتأكد
    setTimeout(() => {
        const isAuthenticated = checkBYPROAuthentication();
        if (isAuthenticated && appState.currentView === 'auth') {
            console.log('🔄 إعادة تحميل التطبيق بعد المصادقة...');
            window.location.reload();
        }
    }, 1000);
});

// التعامل مع أخطاء التحميل
window.addEventListener('error', function(e) {
    console.error('❌ خطأ في تحميل المورد:', e);
});

// التعامل مع رفض الوعود
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ وعد مرفوض:', e.reason);
});

console.log('🔧 تم تحميل script التحسينات المتقدمة');
