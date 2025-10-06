
// Global Variables
let currentView = 'home';
let isDesktop = window.innerWidth > 768;
let headerElement = null;

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');
const sidebar = document.getElementById('sidebar');
const bottomNav = document.getElementById('bottomNav');
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const aiIframe = document.getElementById('aiIframe');
const externalIframe = document.getElementById('externalIframe');

// Initialize the app
function initApp() {
    createHeader();
    setupEventListeners();
    showView('home');
    handleResize();
    
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'flex';
        }, 500);
    }, 2000);
}

// Create Header Dynamically
function createHeader() {
    headerElement = document.createElement('header');
    headerElement.className = 'header';
    
    // Home Header (default)
    const homeHeader = document.createElement('div');
    homeHeader.className = 'home-header';
    homeHeader.innerHTML = `
        <div class="header-content">
            <div class="search-bar">
                <input type="text" placeholder="Search UltraSpace..." id="searchInput">
                <i class="fas fa-search"></i>
            </div>
            <div class="header-actions">
                <img src="https://ui-avatars.com/api/?name=User&background=3a86ff&color=fff" 
                     alt="User Avatar" class="user-avatar" id="userAvatar">
            </div>
        </div>
    `;
    
    // View Header (for back navigation)
    const viewHeader = document.createElement('div');
    viewHeader.className = 'view-header';
    viewHeader.style.display = 'none';
    viewHeader.innerHTML = `
        <div class="header-content">
            <button class="back-btn" id="backBtn">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="view-title" id="viewTitle">Page Title</div>
            <div class="header-spacer"></div>
            <div class="header-actions">
                <img src="https://ui-avatars.com/api/?name=User&background=3a86ff&color=fff" 
                     alt="User Avatar" class="user-avatar" id="viewUserAvatar">
            </div>
        </div>
    `;
    
    headerElement.appendChild(homeHeader);
    headerElement.appendChild(viewHeader);
    
    // Insert header at the top of main-area
    const mainArea = document.querySelector('.main-area');
    mainArea.insertBefore(headerElement, mainArea.firstChild);
    
    // Add event listeners for header elements
    setupHeaderEvents();
}

// Setup Header Events
function setupHeaderEvents() {
    const backBtn = document.getElementById('backBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (backBtn) {
        backBtn.addEventListener('click', handleBackNavigation);
    }
    
    if (searchInput) {
        searchInput.addEventListener('focus', handleSearchFocus);
        searchInput.addEventListener('blur', handleSearchBlur);
        searchInput.addEventListener('input', handleSearchInput);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            showView(view);
        });
    });

    // Stories click events
    document.querySelectorAll('.story-item').forEach(story => {
        story.addEventListener('click', handleStoryClick);
    });

    // Pages click events
    document.querySelectorAll('.page-item').forEach(page => {
        page.addEventListener('click', handlePageClick);
    });

    // Settings items click events
    document.querySelectorAll('.settings-item').forEach(item => {
        if (item.getAttribute('data-page')) {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                openExternalPage(page);
            });
        }
    });

    // Logout buttons
    const logoutBtn = document.getElementById('settingsLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Error home button
    const errorHomeBtn = document.getElementById('errorHomeBtn');
    if (errorHomeBtn) {
        errorHomeBtn.addEventListener('click', () => showView('home'));
    }

    // Window resize
    window.addEventListener('resize', handleResize);

    // AI iframe load event
    if (aiIframe) {
        aiIframe.addEventListener('load', () => {
            console.log('AI iframe loaded successfully');
        });
        
        aiIframe.addEventListener('error', () => {
            console.error('Failed to load AI iframe');
            showView('error');
        });
    }

    // External iframe load event
    if (externalIframe) {
        externalIframe.addEventListener('load', () => {
            console.log('External iframe loaded successfully');
        });
        
        externalIframe.addEventListener('error', () => {
            console.error('Failed to load external iframe');
            showView('error');
        });
    }
}

// Handle Story Click
function handleStoryClick(e) {
    const storyItem = e.currentTarget;
    const storyName = storyItem.querySelector('.story-name').textContent;
    
    // Add story viewing effect
    storyItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
        storyItem.style.transform = '';
    }, 200);
    
    // Show temporary message
    showTemporaryMessage(`Viewing ${storyName}'s story`);
}

// Handle Page Click
function handlePageClick(e) {
    const pageItem = e.currentTarget;
    const pageUrl = pageItem.getAttribute('data-page');
    const pageName = pageItem.querySelector('.page-name').textContent;
    
    if (pageUrl) {
        // Add click effect
        pageItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pageItem.style.transform = '';
        }, 200);
        
        // Open external page
        openExternalPage(pageUrl, pageName);
    }
}

// Open External Page
function openExternalPage(url, title = 'External Page') {
    if (!url) {
        showView('error');
        return;
    }
    
    try {
        // Set iframe source
        externalIframe.src = url;
        
        // Update view title
        document.getElementById('viewTitle').textContent = title;
        
        // Show external page view
        showView('externalPage');
        
        // Show loading state
        showTemporaryMessage(`Loading ${title}...`);
        
    } catch (error) {
        console.error('Error opening external page:', error);
        showView('error');
    }
}

// Show View Function
function showView(viewName) {
    // Hide all views
    views.forEach(view => {
        view.classList.remove('active');
    });
    
    // Update navigation buttons
    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-view') === viewName) {
            button.classList.add('active');
        }
    });
    
    // Show target view
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        
        // Update header based on view
        updateHeaderForView(viewName);
        
        // Handle special views
        if (viewName === 'aiChat') {
            loadAIChat();
        }
        
        // Scroll to top
        targetView.scrollTop = 0;
    } else {
        console.error(`View ${viewName} not found`);
        showView('error');
    }
}

// Update Header for Different Views
function updateHeaderForView(viewName) {
    if (!headerElement) return;
    
    const homeHeader = headerElement.querySelector('.home-header');
    const viewHeader = headerElement.querySelector('.view-header');
    
    switch(viewName) {
        case 'home':
            homeHeader.style.display = 'flex';
            viewHeader.style.display = 'none';
            break;
            
        case 'externalPage':
        case 'aiChat':
            homeHeader.style.display = 'none';
            viewHeader.style.display = 'flex';
            break;
            
        default:
            homeHeader.style.display = 'flex';
            viewHeader.style.display = 'none';
    }
}

// Handle Back Navigation
function handleBackNavigation() {
    if (currentView === 'externalPage' || currentView === 'aiChat') {
        showView('home');
    }
}

// Handle Search Focus
function handleSearchFocus(e) {
    e.target.parentElement.style.transform = 'scale(1.02)';
}

// Handle Search Blur
function handleSearchBlur(e) {
    e.target.parentElement.style.transform = 'scale(1)';
}

// Handle Search Input
function handleSearchInput(e) {
    // Implement search functionality here
    const searchTerm = e.target.value;
    if (searchTerm.length > 2) {
        // Trigger search
        console.log('Searching for:', searchTerm);
    }
}

// Load AI Chat
function loadAIChat() {
    if (aiIframe) {
        aiIframe.src = 'Ai/AI.html';
        document.getElementById('viewTitle').textContent = 'UltraSpace AI';
    }
}

// Handle Resize
function handleResize() {
    const wasDesktop = isDesktop;
    isDesktop = window.innerWidth > 768;
    
    if (wasDesktop !== isDesktop) {
        if (isDesktop) {
            bottomNav.classList.remove('visible');
        } else {
            bottomNav.classList.add('visible');
        }
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        showTemporaryMessage('Logging out...');
        setTimeout(() => {
            // Reset to home view
            showView('home');
            // Clear any user data
            localStorage.removeItem('userToken');
            // Show logout confirmation
            showTemporaryMessage('Logged out successfully');
        }, 1500);
    }
}

// Show Temporary Message
function showTemporaryMessage(message, duration = 3000) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = 'temp-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 500;
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: fadeInOut 3s ease-in-out;
    `;
    
    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageElement);
    
    // Remove message after duration
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
        if (style.parentNode) {
            style.remove();
        }
    }, duration);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentView === 'aiChat') {
        // Refresh AI chat when returning to tab
        setTimeout(() => {
            if (aiIframe && aiIframe.contentWindow) {
                try {
                    aiIframe.contentWindow.location.reload();
                } catch (e) {
                    console.log('Could not refresh AI chat');
                }
            }
        }, 100);
    }
});

// Error handling for iframes
window.addEventListener('message', (event) => {
    // Handle messages from iframes if needed
    console.log('Message from iframe:', event);
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Don't show error view for minor errors
});
