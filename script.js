// script.js (نسخة مصححة نهائية)
// UltraSpace - core script (modified for cross-origin auth + fixed iframe full-height + back button overlay + injected CSS)

(function(){
  // ========== حقن CSS داخلي (لا css منفصل) ==========
  const injectedCSS = `
  :root{
    --us-back-btn-size:48px;
    --us-back-btn-bg: rgba(0,0,0,0.6);
    --us-back-btn-color: #fff;
    --us-back-btn-radius: 12px;
    --us-z-top: 99999;
  }
  /* زر العودة العائم */
  #usFloatingBackBtn{
    position: fixed;
    top: 14px;
    left: 14px;
    width: var(--us-back-btn-size);
    height: var(--us-back-btn-size);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--us-back-btn-bg);
    color: var(--us-back-btn-color);
    border-radius: var(--us-back-btn-radius);
    z-index: var(--us-z-top);
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    border: none;
    cursor: pointer;
  }
  #usFloatingBackBtn.hidden{ display: none !important; }
  /* زر العودة نسخة صغيرة عند الشاشات الضيقة */
  @media (max-width:600px){
    #usFloatingBackBtn{
      width:40px;height:40px; top:10px; left:10px;
    }
  }

  /* عند عرض iframe خارجي: نجعل الـbody غير قابل للتمرير */
  body.us-iframe-open{
    overflow: hidden !important;
    touch-action: none;
  }

  /* نجعل الـiframes المهمة تملأ الشاشة تماما */
  iframe.us-fullscreen-iframe{
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100vh !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    border: 0 !important;
    z-index: calc(var(--us-z-top) - 10) !important;
    background: #fff;
  }
  `;

  const styleTag = document.createElement('style');
  styleTag.id = 'ultraspace-injected-styles';
  styleTag.appendChild(document.createTextNode(injectedCSS));
  document.head.appendChild(styleTag);

  // ========== حالة التطبيق (مع المحافظة على بنية الأصل) ==========
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

  // عناصر DOM (قد تكون null في التحميل المبكر — كود يعمل لاحقاً لأن السكربت يُحمّل بعد الـHTML في index.html)
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

  // الواجهات الأساسية
  const views = {
      home: document.getElementById('homeView'),
      notifications: document.getElementById('notificationsView'),
      messages: document.getElementById('messagesView'),
      settings: document.getElementById('settingsView'),
      aiChat: document.getElementById('aiChatView'),
      externalPage: document.getElementById('externalPageView'),
      error: document.getElementById('errorView')
  };

  const viewTitles = {
      home: 'Home',
      notifications: 'Notifications',
      messages: 'Messages',
      settings: 'Settings',
      aiChat: 'UltraSpace AI',
      externalPage: 'Page',
      error: 'Error'
  };

  // ========== وظائف المصادقة (كما في الأصل) ==========
  function checkBYPROAuthentication() {
      console.log('🔍 التحقق من مصادقة B.Y PRO...');
      const userData = localStorage.getItem('bypro_user');
      if (userData) {
          try {
              const user = JSON.parse(userData);
              if (user.id && user.password) {
                  appState.isAuthenticated = true;
                  if (user.image && user.image !== appState.userAvatarUrl) {
                      appState.userAvatarUrl = user.image;
                      localStorage.setItem('ultraspace_user_avatar_url', user.image);
                  }
                  return true;
              } else {
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
          appState.isAuthenticated = false;
          appState.userAvatarUrl = '';
          return false;
      }
  }

  function createAuthView() {
      console.log('🔐 إنشاء واجهة المصادقة...');
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;
      const authViewHTML = `
          <div class="view active" id="authView" style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 10000; background: var(--background-color);">
              <div class="view-content" style="height: 100vh; padding: 0; margin: 0;">
                  <div class="auth-container">
                      <iframe 
                          src="https://yacine2007.github.io/secure-auth-app/login.html" 
                          class="auth-iframe us-fullscreen-iframe" 
                          id="authIframe"
                          style="width: 100%; height: 100vh; border: none; position: fixed; top: 0; left: 0;"
                      ></iframe>
                  </div>
              </div>
          </div>
      `;
      mainContent.insertAdjacentHTML('beforeend', authViewHTML);
      views.auth = document.getElementById('authView');
      setupAuthIframeListener();
  }

  // ========== استقبال رسائل iframe المصادقة (معدل للسماح بالعارض الخارجي) ==========
  function setupAuthIframeListener() {
      // ملاحظة: تم توسيع قواعد الأصل لتشمل wuaze و GitHub pages
      window.addEventListener('message', function(event) {
          // طباعة للتصحيح
          console.log('📩 Received postMessage (auth listener) from:', event.origin, event.data);

          // السماح إذا كان المصدر أحد الأصول المألوفة أو يحتوي على الاسم المضبوط
          if (
              !event.origin.includes('yacine2007.github.io') &&
              !event.origin.includes('wuaze.com') &&
              event.origin !== window.location.origin
          ) {
              console.warn('⚠️ رسالة من مصدر غير مصرح به (auth):', event.origin);
              return;
          }

          // انتظار رسالة المصادقة
          if (event.data && event.data.type === 'USER_AUTHENTICATED') {
              console.log('🔑 تم استلام رسالة مصادقة المستخدم (auth iframe)');
              handleSuccessfulAuth();
          }
      });

      // فحص دوري احتياطي كما في الأصلي
      const checkAuthInterval = setInterval(() => {
          if (checkBYPROAuthentication()) {
              console.log('🔄 الفحص الدوري: المستخدم مصادق');
              handleSuccessfulAuth();
              clearInterval(checkAuthInterval);
          } else {
              console.log('🔄 الفحص الدوري: المستخدم غير مصادق بعد');
          }
      }, 500);

      setTimeout(() => {
          clearInterval(checkAuthInterval);
          console.log('⏰ انتهت مدة التحقق من المصادقة');
      }, 5 * 60 * 1000);
  }

  function handleSuccessfulAuth() {
      console.log('✅ تمت المصادقة بنجاح، إعداد التطبيق...');
      appState.isAuthenticated = true;
      extractAndSaveUserAvatar();
      // نزيل واجهة المصادقة إذا كانت موجودة
      if (views.auth) {
          try { views.auth.remove(); } catch(e){}
      }
      // إظهار الواجهة الرئيسية فوراً
      if (elements.loadingScreen) elements.loadingScreen.remove();
      if (elements.appContainer) elements.appContainer.style.display = 'block';
      setupEventListeners();
      updateHeaderVisibility();
      updateBottomNavVisibility();
      setupIframeResizing();
      setupIframeResizeHandler();
      applyLanguage();
      displayUserInfo();
      console.log('🎉 تم تهيئة التطبيق بعد المصادقة!');
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
      const profileAvatar = document.getElementById('profileAvatar');
      if (!profileAvatar) return;
      const avatarUrl = appState.userAvatarUrl || user.image;
      if (avatarUrl) {
          profileAvatar.src = avatarUrl + '?t=' + Date.now();
          profileAvatar.alt = user.name || `User ${user.id}`;
          profileAvatar.onerror = function() { this.src = getDefaultAvatarUrl(user); };
      } else {
          profileAvatar.src = getDefaultAvatarUrl(user);
      }
      profileAvatar.alt = user.name || `User ${user.id}`;
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
              settingsAvatar.alt = user.name || `User ${user.id}`;
              settingsAvatar.onerror = function(){ this.src = getDefaultAvatarUrl(user); };
          }
      }
  }

  function getAuthenticatedUser() {
      const userData = localStorage.getItem('bypro_user');
      if (userData) {
          try { return JSON.parse(userData); } catch(e){ return null; }
      }
      return null;
  }

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

  // ========== إدارة روابط وباراميتر URL ==========
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

  function loadYacineWithPost(postId) {
      console.log('📖 جاري تحميل Yacine مع المنشور:', postId);
      loadExternalPage('Yacine/index.html', 'Yacine').then(() => {
          // إرسال رسالة بعد تحميل الإطار
          try {
              if (elements.externalIframe && elements.externalIframe.contentWindow) {
                  elements.externalIframe.contentWindow.postMessage({ type: 'SHOW_POST', postId }, '*');
              }
          } catch(e){}
      });
  }

  function resetPostParameter() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('post')) {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          console.log('🔄 تمت إزالة معلمة post من URL');
      }
  }

  // ========== رسائل iframe عامة (معدل للتحقق) ==========
  function setupIframeMessageListener() {
      window.addEventListener('message', function(event) {
          // تصحيح سريع
          console.log('📨 Received postMessage (general) from:', event.origin, event.data);

          // تحقق مرن: اسمح للـ origins الموثوقة أو المحتوية على yacine2007.github.io أو wuaze.com
          if (
              !event.origin.includes('yacine2007.github.io') &&
              !event.origin.includes('wuaze.com') &&
              event.origin !== window.location.origin &&
              !event.origin.startsWith('http://localhost') &&
              !event.origin.startsWith('http://127.0.0.1')
          ) {
              console.warn('⚠️ رسالة من مصدر غير مصرح به (general):', event.origin);
              return;
          }

          // معالجة أنواع الرسائل
          if (event.data && event.data.type === 'POST_LOADED') {
              console.log('✅ تم تحميل المنشور في iframe:', event.data.postId);
          }

          if (event.data && event.data.type === 'SHARE_LINK_REQUEST') {
              const postId = event.data.postId;
              const shareLink = generatePostShareLink(postId);
              event.source.postMessage({ type: 'SHARE_LINK_RESPONSE', shareLink }, event.origin);
          }

          if (event.data && event.data.type === 'OPEN_EXTERNAL_URL') {
              const url = event.data.url;
              window.open(url, '_blank');
          }

          if (event.data && event.data.type === 'RESIZE_IFRAME') {
              const height = event.data.height;
              resizeIframe(height);
          }

          if (event.data && event.data.type === 'USER_AUTHENTICATED') {
              // في حال رسالة المصادقة وصلت هنا أيضاً
              console.log('🔑 تم استلام رسالة مصادقة عبر general listener');
              handleSuccessfulAuth();
          }
      });
  }

  function generatePostShareLink(postId) {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?post=${postId}`;
  }

  function resizeIframe(height) {
      if (elements.externalIframe) {
          elements.externalIframe.style.height = (height + 20) + 'px';
      }
  }

  // ========== التنقل وواجهات ==========
  function switchView(viewId) {
      if (appState.currentView === viewId) return;
      // إذا لم يكن المستخدم مصادقاً، لا تسمح بالتبديل (باستثناء حالة auth التي تمّت إدارتها)
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
              if (lastView !== viewId) appState.viewHistory.push(viewId);
          }
          updateNavButtons(viewId);
          updateHeaderVisibility();
          updateBottomNavVisibility();
          updateViewTitle(viewId);
          // إذا فتحت واجهة تحتوي iframe، اضبطها لتملأ الشاشة
          if (viewId === 'aiChat' || viewId === 'externalPage') {
              setTimeout(() => {
                  const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe');
                  if (activeIframe) {
                      setupIframeDimensions(activeIframe);
                  }
              }, 100);
          } else {
              // إخفاء زر العودة العائم إذا عدنا للصفحة الرئيسية
              if (appState.currentView === 'home') removeFloatingBackButton();
          }
      }, 150);
  }

  function updateNavButtons(viewId){
      elements.navButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.view === viewId);
      });
  }

  function updateHeaderVisibility() {
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
      if (!isMobile && currentView === 'home') {
          if (elements.homeHeader) elements.homeHeader.style.display = 'flex';
      }
  }

  function updateBottomNavVisibility() {
      if (!appState.isAuthenticated) {
          if (elements.bottomNav) elements.bottomNav.style.display = 'none';
          return;
      }
      const isMobile = appState.isMobile;
      const currentView = appState.currentView;
      if (isMobile && elements.bottomNav) {
          if (['home','notifications','messages','settings'].includes(currentView)) {
              elements.bottomNav.style.display = 'flex';
          } else {
              elements.bottomNav.style.display = 'none';
          }
      } else {
          if (elements.bottomNav) elements.bottomNav.style.display = 'none';
      }
  }

  function updateViewTitle(viewId) {
      if (elements.viewTitle) elements.viewTitle.textContent = viewTitles[viewId] || 'View';
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

  // ========== إدارة iframes: ضبط لتملأ الشاشة + تعديل سلوك التحميل ==========
  function setupIframeDimensions(iframe) {
      if (!iframe) return;
      // نجعل الإطار يملأ الشاشة بالكامل (موبيل و حاسوب)
      iframe.classList.add('us-fullscreen-iframe');
      // إزالة أي قيود قد تكون مسبقة
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.minHeight = '100vh';
      iframe.style.maxHeight = '100vh';
      iframe.style.border = '0';
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = String(parseInt(getComputedStyle(styleTag).getPropertyValue('--us-z-top')) - 10 || 99980);

      // عندما يكون iframe محلي/داخلي (non-external view) سنتركه ضمن layout, لكن لسلامة العرض نحتفظ بنفس النمط.
      // إخفاء باقي الواجهات/الشريط الجانبي عند عرض iframe خارجي كامل
      document.body.classList.add('us-iframe-open');

      // إظهار زر العودة
      createFloatingBackButton();
  }

  function adjustIframeHeight(iframe) {
      // محاولة الوصول للمستند داخل iframe — إن أمكن نستخدم ارتفاعه، وإلا نترك 100vh ثابت
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
              // إذا ارتفاع المحتوى أكبر من الشاشة، نسمح بالتمرير داخل iframe
              iframe.style.height = Math.max(window.innerHeight, height) + 'px';
          } else {
              iframe.style.height = '100vh';
          }
      } catch (error) {
          // الوصول محظور (cross-origin) => نحافظ على 100vh
          iframe.style.height = '100vh';
      }
  }

  function setupIframeResizing() {
      const iframes = document.querySelectorAll('.ai-iframe, .external-iframe, .auth-iframe, iframe');
      iframes.forEach(iframe => {
          // تهيئة الأبعاد دائما
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

  function setupIframeResizeHandler() {
      let resizeTimeout;
      window.addEventListener('resize', function() {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
              appState.isMobile = window.innerWidth <= 1024;
              updateHeaderVisibility();
              updateBottomNavVisibility();
              const activeIframe = document.querySelector('.view.active .ai-iframe, .view.active .external-iframe, .auth-iframe');
              if (activeIframe) {
                  setupIframeDimensions(activeIframe);
                  setTimeout(() => { adjustIframeHeight(activeIframe); }, 100);
              }
          }, 250);
      });
  }

  // ========== زر العودة العائم (يظهر دائمًا عند فتح iframe/صفحة خارجية) ==========
  function createFloatingBackButton(){
      if (document.getElementById('usFloatingBackBtn')) {
          document.getElementById('usFloatingBackBtn').classList.remove('hidden');
          return;
      }
      const btn = document.createElement('button');
      btn.id = 'usFloatingBackBtn';
      btn.title = 'عودة';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      btn.addEventListener('click', () => {
          // عند الضغط: إذا iframe خارجي مفتوح نغلقه (نعود للوِجهة السابقة)
          // نزيل حالة الـiframe المفتوح ونحاول العودة إلى الواجهة السابقة
          removeFloatingBackButton();
          // إخفاء الـiframe الخارجي إن وُجد
          if (elements.externalIframe) {
              try { elements.externalIframe.src = ''; } catch(e){}
          }
          document.body.classList.remove('us-iframe-open');
          goBack();
      });
      document.body.appendChild(btn);
  }

  function removeFloatingBackButton(){
      const btn = document.getElementById('usFloatingBackBtn');
      if (btn) {
          btn.classList.add('hidden');
      }
  }

  // ========== تحميل صفحات خارجية (معدَّل لإنشاء iframe كامل الشاشة + العودة) ==========
  async function loadExternalPage(url, title = 'Page') {
      if (!appState.isAuthenticated) {
          console.log('🚫 المستخدم غير مصادق، لا يمكن تحميل الصفحات');
          return false;
      }
      console.log(`🌐 جاري تحميل الصفحة الخارجية: ${url}`);
      appState.isLoading = true;

      try {
          if (elements.externalIframe) {
              // تعطيل أي سلوك تحميل سابق
              setupIframeForLoading(elements.externalIframe);

              // ضمّن السمات الملائمة (لا تغيير في المصادقة) — نحتفظ بالسماح للـscripts
              elements.externalIframe.classList.add('us-fullscreen-iframe');
              elements.externalIframe.sandbox = elements.externalIframe.getAttribute('sandbox') || 'allow-forms allow-scripts allow-popups';
              elements.externalIframe.allow = 'fullscreen';

              // تعيين المصدر
              elements.externalIframe.src = url;
              viewTitles.externalPage = title;

              // عندما يُحمّل الإطار
              elements.externalIframe.onload = function() {
                  setupIframeDimensions(this);
                  setTimeout(() => {
                      adjustIframeHeight(this);
                      const urlParams = new URLSearchParams(window.location.search);
                      const postId = urlParams.get('post');
                      if (postId && elements.externalIframe.contentWindow) {
                          setTimeout(() => {
                              try { elements.externalIframe.contentWindow.postMessage({ type: 'SHOW_POST', postId }, '*'); } catch(e){}
                          }, 500);
                      }
                  }, 300);
                  appState.isLoading = false;
              };

              elements.externalIframe.onerror = function() {
                  console.error('❌ فشل تحميل محتوى الـ iframe:', url);
                  setupIframeDimensions(this);
                  appState.isLoading = false;
                  showErrorView();
              };

              // افتح الواجهة الخارجية
              switchView('externalPage');

              // ضمان أن الـiframe يملأ الشاشة ويُظهر زر العودة
              setupIframeDimensions(elements.externalIframe);
              document.body.classList.add('us-iframe-open');
          }

          return true;

      } catch (error) {
          console.error('❌ خطأ في تحميل الصفحة:', error);
          showErrorView();
          appState.isLoading = false;
          return false;
      }
  }

  function setupIframeForLoading(iframe) {
      iframe.style.opacity = '0.7';
      setupIframeDimensions(iframe);
      setTimeout(() => { iframe.style.opacity = '1'; }, 300);
  }

  function openAIChat() {
      console.log('🤖 فتح الدردشة AI...');
      if (elements.aiIframe) {
          setupIframeForLoading(elements.aiIframe);
          elements.aiIframe.onload = function() {
              setupIframeDimensions(this);
              setTimeout(() => { adjustIframeHeight(this); }, 300);
          };
          elements.aiIframe.onerror = function() { setupIframeDimensions(this); };
      }
      loadExternalPage('Ai/AI.html', 'UltraSpace AI');
  }

  function openBlueBadgeVerification() {
      console.log('🔵 فتح التحقق من الشارة الزرقاء...');
      loadExternalPage('Blue Badge Verification.html', 'Blue Badge Verification');
  }

  function openProfile() {
      console.log('👤 فتح الملف الشخصي...');
      loadExternalPage('Profile/Profile.html', 'Edit Profile');
  }

  function openHelpCenter() {
      console.log('❓ فتح مركز المساعدة...');
      loadExternalPage('HCA.html', 'Help Center');
  }

  function showErrorView() {
      console.error('🚨 إظهار واجهة الخطأ');
      switchView('error');
      appState.isLoading = false;
  }

  // ========== إعداد المستمعين وتهيئة ==========
  function applyLanguage() {
      document.documentElement.lang = appState.language;
      localStorage.setItem('language', appState.language);
      if (elements.languageSelect) elements.languageSelect.value = appState.language;
      console.log(`🌐 تم تطبيق اللغة: ${appState.language}`);
  }

  function hideAllUIElements() {
      console.log('👻 إخفاء جميع عناصر واجهة المستخدم');
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.style.display = 'none';
      if (elements.bottomNav) elements.bottomNav.style.display = 'none';
      if (elements.homeHeader) elements.homeHeader.style.display = 'none';
      if (elements.viewHeader) elements.viewHeader.style.display = 'none';
      Object.values(views).forEach(view => {
          if (view && view.id !== 'authView') { view.style.display = 'none'; }
      });
  }

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

      // زر الرجوع إذا وُجد (بوضع افتراضي قد لا يكون موجود داخل HTML)
      if (elements.backBtn) elements.backBtn.addEventListener('click', goBack);

      // اختيار اللغة
      if (elements.languageSelect) {
          elements.languageSelect.addEventListener('change', (e) => {
              appState.language = e.target.value;
              applyLanguage();
          });
      }

      // صورة الملف الشخصي
      if (elements.profileAvatar) elements.profileAvatar.addEventListener('click', openProfile);

      // زر تسجيل الخروج
      if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', logout);

      // زر العودة في واجهة الخطأ
      if (elements.errorHomeBtn) elements.errorHomeBtn.addEventListener('click', () => switchView('home'));

      // عناصر الرسائل
      elements.messageItems.forEach(item => {
          item.addEventListener('click', () => {
              const userType = item.getAttribute('data-user');
              if (userType === 'ai') openAIChat();
              else if (userType === 'support') openHelpCenter();
          });
      });

      // شريط البحث
      if (elements.searchInput) {
          elements.searchInput.addEventListener('focus', function(){ this.parentElement.classList.add('focused'); });
          elements.searchInput.addEventListener('blur', function(){ this.parentElement.classList.remove('focused'); });
          elements.searchInput.addEventListener('input', function(){ console.log('🔍 بحث:', this.value); });
      }

      // نقرة عامة (للقصص والصفحات)
      document.addEventListener('click', (e) => {
          if (e.target.closest('.story-item')) {
              const storyItem = e.target.closest('.story-item');
              const storyName = storyItem.querySelector('.story-name').textContent;
              if (storyName === 'Yacine') loadExternalPage('Yacine/index.html', 'Yacine');
          }

          if (e.target.closest('.page-item')) {
              const pageItem = e.target.closest('.page-item');
              const pageName = pageItem.querySelector('.page-name').textContent;
              const pageUrl = pageItem.getAttribute('data-page-url');
              if (pageUrl) loadExternalPage(pageUrl, pageName);
              else if (pageName === 'Yacine') loadExternalPage('Yacine/index.html', 'Yacine');
              else if (pageName === 'B.Y PRO') loadExternalPage('BYUS/B.Y%20PRO.html', 'B.Y PRO');
              else if (pageName === 'UltraSpace') loadExternalPage('BYUS/USP.html', 'UltraSpace');
          }

          if (e.target.closest('.settings-item[data-page]')) {
              const settingsItem = e.target.closest('.settings-item[data-page]');
              const pageUrl = settingsItem.getAttribute('data-page');
              const pageTitle = settingsItem.querySelector('span').textContent;
              if (pageUrl === 'Ai/AI.html') openAIChat();
              else if (pageUrl === 'Blue Badge Verification.html') openBlueBadgeVerification();
              else if (pageUrl === 'Profile/Profile.html') openProfile();
              else if (pageUrl === 'HCA.html') openHelpCenter();
              else loadExternalPage(pageUrl, pageTitle);
          }
      });

      // مستمع رسائل iframe
      setupIframeMessageListener();
  }

  // ========== تهيئة التطبيق الرئيسي ==========
  function initApp() {
      console.log('🚀 بدء تهيئة تطبيق UltraSpace...');
      const isAuthenticated = checkBYPROAuthentication();

      if (!isAuthenticated) {
          // لا نحذف المصادقة — سنعرض واجهة المصادقة كما في الأصل
          if (elements.loadingScreen) elements.loadingScreen.remove();
          if (elements.appContainer) elements.appContainer.style.display = 'block';
          hideAllUIElements();
          createAuthView();
          return;
      }

      // مصادق بالفعل
      console.log('✅ المستخدم مصادق، جاري تحميل UltraSpace بشكل طبيعي');

      const hasUrlParams = handleUrlParameters();

      if (!hasUrlParams) {
          setTimeout(() => {
              if (elements.loadingScreen) {
                  elements.loadingScreen.style.opacity = '0';
                  setTimeout(() => {
                      if (elements.loadingScreen) elements.loadingScreen.remove();
                      if (elements.appContainer) elements.appContainer.style.display = 'block';
                      setupEventListeners();
                      updateHeaderVisibility();
                      updateBottomNavVisibility();
                      setupIframeResizing();
                      setupIframeResizeHandler();
                  }, 500);
              } else {
                  setupEventListeners();
                  updateHeaderVisibility();
                  updateBottomNavVisibility();
                  setupIframeResizing();
                  setupIframeResizeHandler();
              }
          }, 400);
      } else {
          if (elements.loadingScreen) elements.loadingScreen.remove();
          if (elements.appContainer) elements.appContainer.style.display = 'block';
          setupEventListeners();
          updateHeaderVisibility();
          updateBottomNavVisibility();
          setupIframeResizing();
          setupIframeResizeHandler();
      }

      applyLanguage();
      displayUserInfo();
      console.log('🎉 تم تهيئة التطبيق بنجاح!');
  }

  // ========== تصدير الوظائف لاستخدام خارجي (تصحيح) ==========
  window.UltraSpace = {
      appState,
      switchView,
      loadExternalPage,
      openAIChat,
      openProfile,
      logout,
      getAuthenticatedUser
  };

  // ========== بدء عند انتهاء تحميل DOM ==========
  document.addEventListener('DOMContentLoaded', initApp);

  // طباعة تحميل السكربت
  console.log('📄 تم تحميل script.js بنجاح (final patched).');

})();
