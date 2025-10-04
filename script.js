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
const bottomNav = document.getElementById('bottomNav');
const viewTitle = document.getElementById('viewTitle');

// عناوين الواجهات
const viewTitles = {
    home: 'Home',
    notifications: 'Notifications',
    messages: 'Messages', // تم التصحيح هنا
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

// تبديل الواجهة
function switchView(viewId) {
    // إخفاء جميع الواجهات
    Object.values(views).forEach(view => {
        if (view) view.classList.remove('active');
    });
    
    // إظهار الواجهة المحددة
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
}

// تحديث رأس الصفحة - النسخة المصححة
function updateHeaderVisibility() {
    const isMobile = window.innerWidth <= 1024;
    const currentView = appState.currentView;
    
    if (isMobile) {
        // homeHeader: يظهر فقط في home
        if (homeHeader) {
            homeHeader.style.display = currentView === 'home' ? 'flex' : 'none';
        }
        
        // viewHeader: يظهر في جميع الواجهات ما عدا home
        if (viewHeader) {
            if (currentView === 'home') {
                // إخفاء تام في home فقط
                viewHeader.style.display = 'none';
            } else {
                // إظهار في جميع الواجهات الأخرى (بما فيها messages)
                viewHeader.style.display = 'flex';
            }
        }
    } else {
        // في الحواسيب: إظهار homeHeader دائماً
        if (homeHeader) {
            homeHeader.style.display = 'flex';
        }
        if (viewHeader) {
            viewHeader.style.display = 'none';
        }
    }
}

// تحديث الشريط السفلي
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

// تحديث عنوان الواجهة
function updateViewTitle(viewId) {
    if (viewTitle && viewTitles[viewId]) {
        viewTitle.textContent = viewTitles[viewId];
    }
}

// العودة للخلف
function goBack() {
    if (appState.viewHistory.length > 1) {
        // إزالة الواجهة الحالية من السجل
        appState.viewHistory.pop();
        
        // العودة للواجهة السابقة
        const previousView = appState.viewHistory[appState.viewHistory.length - 1];
        
        // تحديث حالة التطبيق أولاً
        appState.currentView = previousView;
        
        // ثم تبديل الواجهة
        switchView(previousView);
    } else {
        // إذا لم يكن هناك سجل، العودة للرئيسية
        appState.currentView = 'home';
        switchView('home');
    }
}

// تحميل الصفحات الخارجية
async function loadExternalPage(url, title = 'Page') {
    // إظهار حالة التحميل
    appState.isLoading = true;
    
    try {
        // محاولة جلب الصفحة
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
            throw new Error('Page not found');
        }
        
        // إذا كانت الصفحة موجودة، قم بتحميلها في الـ iframe
        if (externalIframe) {
            externalIframe.src = url;
            viewTitles.externalPage = title;
            switchView('externalPage');
        }
        
        // إخفاء حالة التحميل
        appState.isLoading = false;
        
        return true;
        
    } catch (error) {
        // إذا فشل التحميل، عرض واجهة الخطأ
        console.error('Error loading page:', error);
        showErrorView();
        return false;
    }
}

// فتح شات AI
function openAIChat() {
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
        btn.addEventListener('click', () => {
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
    window.addEventListener('resize', () => {
        updateHeaderVisibility();
        updateBottomNavVisibility();
    });
    
    // حل نهائي: مراقبة وإصلاح أي مشاكل في الـ headers
    const headerFixInterval = setInterval(() => {
        const currentView = appState.currentView;
        
        // إصلاح homeHeader
        if (homeHeader) {
            if (currentView === 'home') {
                if (homeHeader.style.display !== 'flex') {
                    homeHeader.style.display = 'flex';
                }
            } else {
                if (homeHeader.style.display !== 'none') {
                    homeHeader.style.display = 'none';
                }
            }
        }
        
        // إصلاح viewHeader - يظهر في جميع الواجهات ما عدا home
        if (viewHeader) {
            if (currentView === 'home') {
                if (viewHeader.style.display !== 'none') {
                    viewHeader.style.display = 'none';
                }
            } else {
                if (viewHeader.style.display !== 'flex') {
                    viewHeader.style.display = 'flex';
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
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);