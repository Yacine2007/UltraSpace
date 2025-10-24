[file name]: script.js
[file content begin]
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
    searchBar: document.querySelector('.search-bar'),
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
                    <div class="auth-header" style="text-align: center; padding: 20px; background: var(--primary-color); color: white;">
                        <h2 style="margin: 0; font-size: 1.5rem;">UltraSpace Authentication</h2>
                        <p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">Allowed Domain: ultraspace.wuaze.com</p>
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
 * عرض معلومات المستخدم
 */
function displayUserInfo() {
    const user = getAuthenticatedUser();
    if (user) {
        console.log('👤 عرض معلومات المستخدم:', user);
        
        // تحديث الصورة الرمزية في الهيدر
        updateProfileAvatar(user);
        
        // تحديث الصورة في الإعدادات
        updateSettingsAvatar(user);
        
        // تحديث الصورة في الصفحة الرئيسية
        updateHomeProfileAvatar(user);
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
 * تحديث الصورة في الصفحة الرئيسية
 */
function updateHomeProfileAvatar(user) {
    if (elements.homeProfileAvatar) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        
        if (avatarUrl) {
            elements.homeProfileAvatar.src = avatarUrl + '?t=' + Date.now();
            elements.homeProfileAvatar.alt = user.name || `User ${user.id}`;
            elements.homeProfileAvatar.onerror = function() {
                this.src = getDefaultAvatarUrl(user);
            };
        } else {
            elements.homeProfileAvatar.src = getDefaultAvatarUrl(user);
        }
        elements.homeProfileAvatar.alt = user.name || `User ${user.id}`;
    }
}

/**
 * الحصول على رابط الصورة الافتراضية
 */
function getDefaultAvatarUrl(user) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.id) + '&background=3a86ff&color=fff';
}

/**
 * تحديث الصورة في الإعدادات
 */
function updateSettingsAvatar(user) {
    let settingsAvatar = document.getElementById('settingsAvatar');
    
    if (!settingsAvatar) {
        // إنشاء عنصر الصورة في الإعدادات إذا لم يكن موجوداً
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            const avatarUrl = appState.userAvatarUrl || user.image;
            const avatarHTML = `
                <div class="settings-item" style="text-align: center; padding: 20px; border-bottom: 1px solid var(--border-color);">
                    <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 10px; overflow: hidden; background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); position: relative;">
                        <div class="avatar-loading" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loadingShimmer 1.5s infinite;"></div>
                        <img src="${avatarUrl || getDefaultAvatarUrl(user)}" 
                             alt="${user.name || 'User'}" 
                             style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 2;"
                             onload="this.style.opacity='1'"
                             onerror="this.src='${getDefaultAvatarUrl(user)}'"
                             id="settingsAvatar"
                             style="opacity: 0; transition: opacity 0.3s ease;">
                    </div>
                    <div class="user-info" style="margin-top: 15px;">
                        <div style="font-weight: 700; color: var(--text-color); font-size: 1.1rem; margin-bottom: 5px;">${user.name || `User ${user.id}`}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 3px;">ID: ${user.id || 'N/A'}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${user.email || ''}</div>
                    </div>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', avatarHTML);
            settingsAvatar = document.getElementById('settingsAvatar');
        }
    }
    
    // تحديث الصورة الموجودة
    if (settingsAvatar) {
        const avatarUrl = appState.userAvatarUrl || user.image;
        if (avatarUrl) {
            settingsAvatar.src = avatarUrl + '?t=' + Date.now();
            settingsAvatar.alt = user.name || `User ${user.id}`;
            settingsAvatar.onerror = function() {
                this.src = getDefaultAvatarUrl(user);
            };
        }
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
        
        if (event.data && event.data.type === 'CONTENT_LOADING') {
            showContentLoading(event.data.isLoading);
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
        
        // إظهار شريط البحث والصورة في الصفحة الرئيسية فقط
        if (elements.searchBar) elements.searchBar.style.display = 'flex';
        if (elements.homeProfileAvatar) elements.homeProfileAvatar.style.display = 'block';
    } else {
        if (elements.homeHeader) elements.homeHeader.style.display = 'none';
        if (elements.viewHeader) elements.viewHeader.style.display = 'flex';
        
        // إخفاء شريط البحث والصورة في الصفحات الأخرى
        if (elements.searchBar) elements.searchBar.style.display = 'none';
        if (elements.homeProfileAvatar) elements.homeProfileAvatar.style.display = 'none';
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
    
    // إظهار تأثير التحميل
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
                    
                    // إخفاء تأثير التحميل بعد تحميل المحتوى
                    setTimeout(() => {
                        showContentLoading(false);
                    }, 1000);
                    
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
 * إظهار/إخفاء تأثير تحميل المحتوى
 */
function showContentLoading(show) {
    const loadingOverlay = document.getElementById('contentLoadingOverlay');
    
    if (show) {
        if (!loadingOverlay) {
            const overlayHTML = `
                <div id="contentLoadingOverlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255,255,255,0.9);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                ">
                    <div class="loading-spinner" style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid var(--primary-color);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    "></div>
                    <div style="color: var(--text-color); font-size: 1rem; font-weight: 500;">جاري تحميل المحتوى...</div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', overlayHTML);
        } else {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }
}

/**
 * إعداد الـ iframe للتحميل
 */
function setupIframeForLoading(iframe) {
    iframe.style.opacity = '0.7';
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
    appState.isLoading = false;
}

// ========== إعدادات التطبيق المحسّنة ==========

/**
 * تطبيق اللغة
 */
function applyLanguage() {
    document.documentElement.lang = appState.language;
    localStorage.setItem('language', appState.language);
    
    if (elements.languageSelect) {
        elements.languageSelect.value = appState.language;
    }
    
    console.log(`🌐 تم تطبيق اللغة: ${appState.language}`);
}

/**
 * إخفاء جميع عناصر واجهة المستخدم
 */
function hideAllUIElements() {
    console.log('👻 إخفاء جميع عناصر واجهة المستخدم');
    
    // إخفاء الشريط الجانبي
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
        }
    });
}

/**
 * إعداد مستمعي الأحداث المحسّن
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
    
    // اختيار اللغة
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            appState.language = e.target.value;
            applyLanguage();
        });
    }
    
    // صورة الملف الشخصي
    if (elements.profileAvatar) {
        elements.profileAvatar.addEventListener('click', openProfile);
    }
    
    // زر تسجيل الخروج
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    // زر الصفحة الرئيسية في واجهة الخطأ
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
    
    // شريط البحث
    if (elements.searchInput) {
        elements.searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        elements.searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        elements.searchInput.addEventListener('input', function() {
            const hasValue = this.value.trim().length > 0;
            this.parentElement.classList.toggle('has-value', hasValue);
        });
    }
    
    // صورة الملف الشخصي في الصفحة الرئيسية
    if (elements.homeProfileAvatar) {
        elements.homeProfileAvatar.addEventListener('click', openProfile);
    }
    
    // إعداد مستمعي الأحداث للـ iframe
    setupIframeMessageListener();
    setupIframeResizeHandler();
}

// ========== تهيئة التطبيق ==========

/**
 * تهيئة التطبيق
 */
function initializeApp() {
    console.log('🚀 تهيئة UltraSpace...');
    
    // إخفاء شاشة التحميل الأولية
    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
                elements.appContainer.style.display = 'block';
            }, 500);
        }
    }, 1000);
    
    // التحقق من المصادقة
    const isAuthenticated = checkBYPROAuthentication();
    
    if (!isAuthenticated) {
        console.log('🔐 المستخدم غير مصادق، إنشاء واجهة المصادقة...');
        hideAllUIElements();
        createAuthView();
        return;
    }
    
    console.log('✅ المستخدم مصادق، تحميل التطبيق...');
    
    // إذا كان المستخدم مصادقاً، تهيئة التطبيق
    appState.isAuthenticated = true;
    
    // تطبيق اللغة
    applyLanguage();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // التحقق من معلمات URL
    const hasUrlParams = handleUrlParameters();
    
    // إذا لم تكن هناك معلمات URL، تحميل الصفحة الرئيسية
    if (!hasUrlParams) {
        switchView('home');
    }
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // إعداد أبعاد الـ iframes
    setupIframeResizing();
    
    console.log('🎉 تم تهيئة UltraSpace بنجاح!');
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeApp);

// إضافة أنماط CSS إضافية
const additionalStyles = `
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes loadingShimmer {
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
}

.view.active {
    animation: fadeIn 0.3s ease;
}

.search-bar.focused {
    box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.2);
}

.search-bar.has-value {
    background: rgba(58, 134, 255, 0.05);
}

.bottom-nav {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.bottom-nav.visible {
    transform: translateY(0);
    opacity: 1;
}

.bottom-nav.hidden {
    transform: translateY(100%);
    opacity: 0;
}

.avatar-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loadingShimmer 1.5s infinite;
}

.user-info {
    margin-top: 15px;
}

.user-info div:first-child {
    font-weight: 700;
    color: var(--text-color);
    font-size: 1.1rem;
    margin-bottom: 5px;
}

.user-info div:not(:first-child) {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 3px;
}

.auth-container {
    width: 100%;
    height: 100vh;
    background: var(--background-color);
}

.auth-header {
    text-align: center;
    padding: 20px;
    background: var(--primary-color);
    color: white;
}

.auth-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.auth-header p {
    margin: 5px 0 0;
    font-size: 0.9rem;
    opacity: 0.9;
}

.auth-iframe {
    width: 100%;
    height: calc(100vh - 80px);
    border: none;
}

@media (max-width: 768px) {
    .auth-header {
        padding: 15px;
    }
    
    .auth-header h2 {
        font-size: 1.3rem;
    }
    
    .auth-iframe {
        height: calc(100vh - 70px);
    }
}
`;

// إضافة الأنماط الإضافية إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
[file content end]
