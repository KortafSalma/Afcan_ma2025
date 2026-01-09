// ========================================
// GLOBAL VARIABLES
// ========================================

let userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile')) || null;
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "afcon2025admin"
};
let adminLoginAttempts = 0;
const MAX_ADMIN_ATTEMPTS = 3;

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!mobileToggle || !navLinks) return;
    
    // Toggle menu visibility
    mobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
        
        // Update hamburger icon
        const icon = this.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.remove('fa-times');
            mobileToggle.querySelector('i').classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
                mobileToggle.querySelector('i').classList.remove('fa-times');
                mobileToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });
    
    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.remove('fa-times');
            mobileToggle.querySelector('i').classList.add('fa-bars');
        }
    });
}

// ========================================
// USER PROFILE MANAGEMENT
// ========================================

function updateProfileDisplay() {
    const welcomeText = document.getElementById('welcomeText');
    const userCountryText = document.getElementById('userCountry');
    const profileAvatar = document.getElementById('profileAvatar');
    
    const profileMiniAvatar = document.getElementById('profileMiniAvatar');
    const profileMiniName = document.getElementById('profileMiniName');
    const profileMiniCountry = document.getElementById('profileMiniCountry');
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    const adminIndicator = document.getElementById('adminIndicator');
    const loginBtn = document.getElementById('profileMiniBtn'); // Main button is same as mini
    
    if (adminSession && adminSession.loggedIn) {
        // Admin is logged in
        const displayName = adminSession.username;
        const avatarSeed = displayName.toLowerCase().replace(/\s/g, '');
        
        // Update main profile
        if (welcomeText) welcomeText.textContent = `Welcome, ${displayName} (Admin)!`;
        if (userCountryText) userCountryText.textContent = 'Administrator Dashboard';
        if (profileAvatar) profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=D4AF37`;
        
        // Update mini profile
        if (profileMiniAvatar) profileMiniAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=D4AF37`;
        if (profileMiniName) profileMiniName.textContent = `${displayName} (Admin)`;
        if (profileMiniCountry) profileMiniCountry.textContent = "Administrator";
        
        // Update buttons
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Admin Logout';
            loginBtn.className = 'auth-btn bg-gradient-to-r from-[#D4AF37] to-[#b8942a]';
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Admin Logout';
            profileMiniBtn.className = 'auth-btn bg-gradient-to-r from-[#D4AF37] to-[#b8942a]';
        }
        
        // Show admin indicator
        if (adminIndicator) {
            adminIndicator.style.display = 'block';
        }
        
    } else if (userProfile) {
        // Regular user is logged in
        const avatarSeed = userProfile.avatarSeed;
        
        // Update main profile
        if (welcomeText) welcomeText.textContent = `Welcome back, ${userProfile.name}!`;
        if (userCountryText) userCountryText.textContent = `From ${userProfile.country}`;
        if (profileAvatar) profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=00CC66`;
        
        // Update mini profile
        if (profileMiniAvatar) profileMiniAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=00CC66`;
        if (profileMiniName) profileMiniName.textContent = userProfile.name;
        if (profileMiniCountry) profileMiniCountry.textContent = userProfile.country;
        
        // Update buttons
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            loginBtn.className = 'auth-btn';
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            profileMiniBtn.className = 'auth-btn';
        }
        
        // Hide admin indicator
        if (adminIndicator) {
            adminIndicator.style.display = 'none';
        }
        
    } else {
        // No one is logged in
        if (welcomeText) welcomeText.textContent = 'Welcome, Guest!';
        if (userCountryText) userCountryText.textContent = 'Sign in to personalize your experience';
        if (profileAvatar) profileAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66';
        
        if (profileMiniAvatar) profileMiniAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66';
        if (profileMiniName) profileMiniName.textContent = 'Guest';
        if (profileMiniCountry) profileMiniCountry.textContent = 'Sign in';
        
        // Update buttons
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            loginBtn.className = 'auth-btn';
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            profileMiniBtn.className = 'auth-btn';
        }
        
        // Hide admin indicator
        if (adminIndicator) {
            adminIndicator.style.display = 'none';
        }
    }
    
    // Add cursor pointer to profile elements
    if (profileMiniAvatar) profileMiniAvatar.style.cursor = 'pointer';
    if (profileMiniName) profileMiniName.style.cursor = 'pointer';
}

function logoutUser() {
    if (confirm('Are you sure you want to sign out?')) {
        const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
        
        if (adminSession && adminSession.loggedIn) {
            localStorage.removeItem('afcon2025_admin_session');
            alert('Admin logged out successfully.');
        } else {
            localStorage.removeItem('afcon2025_user_profile');
            userProfile = null;
            alert('You have been signed out successfully.');
        }
        
        updateProfileDisplay();
        window.location.reload();
    }
}

// ========================================
// LOGIN MODAL MANAGEMENT
// ========================================

function initLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');
    
    // Profile buttons click handlers
    const profileButtons = [
        document.getElementById('profileMiniBtn'),
        document.getElementById('profileMiniAvatar'),
        document.getElementById('profileMiniName')
    ];
    
    profileButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (userProfile || checkAdminSession()) {
                    logoutUser();
                } else {
                    if (loginModal) {
                        loginModal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        }
    });
    
    // Close modal button
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            if (loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.classList.contains('active')) {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('userName').value;
            const userCountry = document.getElementById('userCountrySelect').value;
            const userPassword = document.getElementById('userPassword').value;
            const favoriteTeam = document.getElementById('userFavoriteTeam').value;
            
            if (!userName || !userCountry) {
                alert('Please enter your name and select your country.');
                return;
            }
            
            // Check if this is admin login attempt
            if (userName.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() && 
                userPassword === ADMIN_CREDENTIALS.password) {
                
                handleAdminLogin(userName, userPassword);
                this.reset();
                return;
            }
            
            // Regular user registration/login
            const existingProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
            const isNewUser = !existingProfile || 
                            (existingProfile.name !== userName || 
                             existingProfile.country !== userCountry);
            
            userProfile = {
                name: userName,
                country: userCountry,
                password: userPassword,
                favoriteTeam: favoriteTeam,
                avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
                loginDate: new Date().toISOString()
            };
            
            localStorage.setItem('afcon2025_user_profile', JSON.stringify(userProfile));
            updateProfileDisplay();
            
            // Close modal
            if (loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Reset form
            this.reset();
            
            // Show message
            if (isNewUser) {
                alert(`Welcome to AFCON 2025 Hub, ${userName}! Your account has been created.`);
                saveUserHistory('signup', userName, userCountry);
            } else {
                alert(`Welcome back, ${userName}! You're now signed in.`);
                saveUserHistory('login', userName, userCountry);
            }
            
            // Track user in statistics
            trackUserInStatistics(userName, userCountry, favoriteTeam);
        });
    }
}

// ========================================
// ADMIN MANAGEMENT
// ========================================

function checkAdminSession() {
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    return adminSession && adminSession.loggedIn;
}

function handleAdminLogin(username, password) {
    if (adminLoginAttempts >= MAX_ADMIN_ATTEMPTS) {
        alert('Too many failed attempts. Admin access is temporarily locked.');
        return false;
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        adminLoginAttempts = 0;
        
        const adminSession = {
            loggedIn: true,
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: 'afcon_admin_' + Date.now()
        };
        
        localStorage.setItem('afcon2025_admin_session', JSON.stringify(adminSession));
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        alert('Admin login successful! Redirecting to admin dashboard...');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
        
        return true;
    } else {
        adminLoginAttempts++;
        const remaining = MAX_ADMIN_ATTEMPTS - adminLoginAttempts;
        alert(`Invalid admin credentials! ${remaining} attempt(s) remaining.`);
        
        if (adminLoginAttempts >= MAX_ADMIN_ATTEMPTS) {
            alert('Admin access locked for 5 minutes due to too many failed attempts.');
            setTimeout(() => {
                adminLoginAttempts = 0;
                alert('Admin login is now unlocked. You can try again.');
            }, 5 * 60 * 1000);
        }
        
        return false;
    }
}

// ========================================
// USER STATISTICS & HISTORY
// ========================================

function trackUserInStatistics(userName, userCountry, favoriteTeam) {
    const allUsers = JSON.parse(localStorage.getItem('afcon2025_all_users')) || [];
    
    const existingUserIndex = allUsers.findIndex(user => 
        user.name.toLowerCase() === userName.toLowerCase() && 
        user.country === userCountry
    );
    
    if (existingUserIndex === -1) {
        const newUser = {
            name: userName,
            country: userCountry,
            favoriteTeam: favoriteTeam,
            avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            isAdmin: false
        };
        allUsers.push(newUser);
    } else {
        allUsers[existingUserIndex].lastLogin = new Date().toISOString();
        allUsers[existingUserIndex].loginCount = (allUsers[existingUserIndex].loginCount || 0) + 1;
    }
    
    localStorage.setItem('afcon2025_all_users', JSON.stringify(allUsers));
}

function saveUserHistory(action, userName, userCountry) {
    if (!userName || !userCountry) return;
    
    const avatarSeed = userName.toLowerCase().replace(/\s/g, '');
    const userHistoryKey = `afcon2025_user_history_${avatarSeed}`;
    const userHistory = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
    
    const historyEntry = {
        type: action === 'signup' ? 'registration' : 'login',
        title: action === 'signup' ? 'Account Created' : 'Login Session',
        description: action === 'signup' 
            ? `Welcome to AFCON 2025 Hub, ${userName}!` 
            : 'Signed in to your account',
        date: new Date().toISOString(),
        icon: action === 'signup' ? 'fa-user-plus' : 'fa-sign-in-alt',
        points: 0,
        action: action
    };
    
    if (action === 'signup') {
        const existingRegistration = userHistory.find(item => 
            item.action === 'signup' && 
            item.title === 'Account Created'
        );
        
        if (!existingRegistration) {
            userHistory.push(historyEntry);
        }
    } else {
        const today = new Date().toDateString();
        const todayLogin = userHistory.find(item => 
            item.action === 'login' && 
            new Date(item.date).toDateString() === today
        );
        
        if (!todayLogin) {
            userHistory.push(historyEntry);
        }
    }
    
    const sortedHistory = userHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedHistory = sortedHistory.slice(0, 20);
    
    localStorage.setItem(userHistoryKey, JSON.stringify(limitedHistory));
}

// ========================================
// PROFILE HISTORY POPUP
// ========================================

function openProfileHistory() {
    const profileHistoryOverlay = document.getElementById('profileHistoryOverlay');
    const profileHistoryContent = document.getElementById('profileHistoryContent');
    
    if (!profileHistoryOverlay || !profileHistoryContent) return;
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const allUsers = JSON.parse(localStorage.getItem('afcon2025_all_users')) || [];
    
    let currentUserData = null;
    if (userProfile) {
        currentUserData = allUsers.find(user => 
            user.name === userProfile.name && user.country === userProfile.country
        );
    }
    
    const avatarSeed = userProfile ? userProfile.avatarSeed : 'guest';
    const userHistoryKey = `afcon2025_user_history_${avatarSeed}`;
    let historyItems = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
    
    if (historyItems.length === 0 && currentUserData) {
        historyItems.push({
            type: 'registration',
            title: 'Account Created',
            description: `Welcome to AFCON 2025 Hub, ${currentUserData.name}!`,
            date: new Date(currentUserData.registrationDate),
            icon: 'fa-user-plus',
            points: 0,
            action: 'signup'
        });
        
        if (currentUserData.loginCount > 1) {
            for (let i = 1; i <= Math.min(currentUserData.loginCount, 5); i++) {
                const loginDate = new Date(currentUserData.registrationDate);
                loginDate.setDate(loginDate.getDate() + i);
                
                historyItems.push({
                    type: 'login',
                    title: 'Login Session',
                    description: 'Signed in to your account',
                    date: loginDate,
                    icon: 'fa-sign-in-alt',
                    points: 0,
                    action: 'login'
                });
            }
        }
    }
    
    const today = new Date().toDateString();
    const hasTodayLogin = historyItems.some(item => 
        new Date(item.date).toDateString() === today && item.action === 'login'
    );
    
    if (!hasTodayLogin && userProfile) {
        historyItems.push({
            type: 'login',
            title: 'Current Session',
            description: 'Currently signed in',
            date: new Date(),
            icon: 'fa-user-check',
            points: 0,
            action: 'login'
        });
    }
    
    historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const registrations = historyItems.filter(item => item.action === 'signup').length;
    const logins = historyItems.filter(item => item.action === 'login').length;
    const totalSessions = registrations + logins;
    
    let contentHTML = '';
    
    contentHTML += `
        <div class="user-profile-summary">
            <img src="${userProfile ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}&backgroundColor=00CC66` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66'}" 
                 alt="Profile" 
                 class="profile-history-avatar">
            <div class="profile-info">
                <h3>${userProfile ? userProfile.name : 'Guest User'}</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 10px;">
                    ${userProfile ? `From ${userProfile.country}` : 'Sign in to track your history'}
                    ${userProfile && userProfile.favoriteTeam ? ` | Supports ${userProfile.favoriteTeam}` : ''}
                </p>
                <div class="profile-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Joined: ${userProfile ? new Date(userProfile.loginDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Sessions: ${totalSessions}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentHTML += `
        <div class="history-stats">
            <div class="stat-card-history">
                <div class="stat-value-history">${registrations}</div>
                <div class="stat-label-history">Registrations</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${logins}</div>
                <div class="stat-label-history">Login Sessions</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${totalSessions}</div>
                <div class="stat-label-history">Total Sessions</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${userProfile ? 'Active' : 'Guest'}</div>
                <div class="stat-label-history">Account Status</div>
            </div>
        </div>
        
        <div class="history-section-title">
            <i class="fas fa-history"></i> Connection History
        </div>
    `;
    
    const connectionHistory = historyItems.filter(item => 
        item.action === 'signup' || item.action === 'login'
    );
    
    if (connectionHistory.length > 0) {
        contentHTML += `<div class="history-list">`;
        
        connectionHistory.forEach((item, index) => {
            const isRegistration = item.action === 'signup';
            
            contentHTML += `
                <div class="history-item" style="border-left: 4px solid ${isRegistration ? '#00CC66' : '#D4AF37'}">
                    <div class="history-item-icon" style="background: ${isRegistration ? 'rgba(0, 204, 102, 0.2)' : 'rgba(212, 175, 55, 0.2)'}; color: ${isRegistration ? '#00CC66' : '#D4AF37'}">
                        <i class="fas ${item.icon}"></i>
                    </div>
                    <div class="history-item-content">
                        <div class="history-item-title">${item.title}</div>
                        <div class="history-item-desc">${item.description}</div>
                        <div class="history-item-meta">
                            <div class="history-item-date">
                                <i class="far fa-clock"></i>
                                ${new Date(item.date).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div class="history-item-points" style="color: ${isRegistration ? '#00CC66' : '#D4AF37'}">
                                <i class="fas ${isRegistration ? 'fa-user-plus' : 'fa-sign-in-alt'}"></i>
                                ${isRegistration ? 'Registration' : 'Login'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        contentHTML += `</div>`;
    } else {
        contentHTML += `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <h4>No Connection History</h4>
                <p>Your registration and login history will appear here</p>
                ${!userProfile ? `
                    <a href="javascript:void(0)" onclick="document.getElementById('loginModal').classList.add('active'); closeProfileHistory();" 
                       class="bg-gradient-to-r from-[#00CC66] to-[#00994d] hover:from-[#00b359] hover:to-[#008040] text-white px-6 py-3 rounded-lg font-bold mt-4 inline-block">
                        <i class="fas fa-user-plus"></i> Register Now
                    </a>
                ` : ''}
            </div>
        `;
    }
    
    profileHistoryContent.innerHTML = contentHTML;
    profileHistoryOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProfileHistory() {
    const profileHistoryOverlay = document.getElementById('profileHistoryOverlay');
    if (profileHistoryOverlay) {
        profileHistoryOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function initProfileHistory() {
    const profileAvatar = document.getElementById('profileMiniAvatar');
    const profileName = document.getElementById('profileMiniName');
    const closeBtn = document.getElementById('closeHistoryPopup');
    const overlay = document.getElementById('profileHistoryOverlay');
    
    if (profileAvatar) {
        profileAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    if (profileName) {
        profileName.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileHistory);
    }
    
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProfileHistory();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProfileHistory();
        }
    });
}

// ========================================
// IMAGE ERROR HANDLING
// ========================================

function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (this.classList.contains('stadium-img') || this.classList.contains('team-avatar')) {
                this.src = 'https://images.unsplash.com/photo-1551135042-1af3a2c85c57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }
        });
    });
}

// ========================================
// INTERACTIVE EFFECTS
// ========================================

function addInteractiveEffects() {
    // Add hover effects to cards
    document.querySelectorAll('.stadium-card, .city-card, .portfolio-card, .info-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 204, 102, 0.1)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add animation to section headers
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(header);
    });
    
    // Add effect to Girls in Tech badge
    const girlsBadge = document.querySelector('.girls-in-tech');
    if (girlsBadge) {
        girlsBadge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        girlsBadge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AFCON 2025 Hub...');
    
    // Initialize all modules
    initMobileMenu();
    updateProfileDisplay();
    initLoginModal();
    initProfileHistory();
    initImageErrorHandling();
    addInteractiveEffects();
    
    // Admin indicator functionality
    const adminIndicator = document.getElementById('adminIndicator');
    if (adminIndicator && checkAdminSession()) {
        const logoutBtn = adminIndicator.querySelector('button:last-child');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }
    }
    
    console.log('AFCON 2025 Hub initialized successfully!');
});