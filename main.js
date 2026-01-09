// main.js - الملف الرئيسي للجافاسكريبت

let userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile')) || null;

// تحديث عرض الملف الشخصي
function updateProfileDisplay() {
    const welcomeText = document.getElementById('welcomeText');
    const userCountryText = document.getElementById('userCountry');
    const profileAvatar = document.getElementById('profileAvatar');
    const loginBtn = document.getElementById('loginBtn');
    
    const profileMiniAvatar = document.getElementById('profileMiniAvatar');
    const profileMiniName = document.getElementById('profileMiniName');
    const profileMiniCountry = document.getElementById('profileMiniCountry');
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    
    if (userProfile) {
        const avatarSeed = userProfile.avatarSeed;
        
        if (welcomeText) welcomeText.textContent = `Welcome back, ${userProfile.name}!`;
        if (userCountryText) userCountryText.textContent = `From ${userProfile.country}`;
        if (profileAvatar) profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=00CC66`;
        if (loginBtn) loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Sign Out</span>';
        
        if (profileMiniAvatar) profileMiniAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=00CC66`;
        if (profileMiniName) profileMiniName.textContent = userProfile.name;
        if (profileMiniCountry) profileMiniCountry.textContent = userProfile.country;
        if (profileMiniBtn) profileMiniBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
    } else {
        if (welcomeText) welcomeText.textContent = 'Welcome, Guest!';
        if (userCountryText) userCountryText.textContent = 'Sign in to personalize your experience';
        if (profileAvatar) profileAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66';
        if (loginBtn) loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Sign In / Register</span>';
        
        if (profileMiniAvatar) profileMiniAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66';
        if (profileMiniName) profileMiniName.textContent = 'Guest';
        if (profileMiniCountry) profileMiniCountry.textContent = 'Sign in';
        if (profileMiniBtn) profileMiniBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

function logoutUser() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('afcon2025_user_profile');
        userProfile = null;
        updateProfileDisplay();
        alert('You have been signed out successfully.');
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('AFCON 2025 Hub Initialized');
    
    updateProfileDisplay();
    
    // القائمة المتنقلة
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
            }
        });
    });
    
    // تفعيل الروابط النشطة
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // إدارة تسجيل الدخول
    const loginBtn = document.getElementById('loginBtn');
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    const loginModal = document.getElementById('loginModal');
    const profileMiniAvatar = document.getElementById('profileMiniAvatar');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (userProfile) {
                logoutUser();
            } else {
                if (loginModal) loginModal.classList.add('active');
            }
        });
    }
    
    if (profileMiniBtn) {
        profileMiniBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (userProfile) {
                logoutUser();
            } else {
                if (loginModal) loginModal.classList.add('active');
            }
        });
    }
    
    if (profileMiniAvatar) {
        profileMiniAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (loginModal) loginModal.classList.add('active');
        });
    }
    
    // إغلاق نافذة تسجيل الدخول
    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            if (loginModal) loginModal.classList.remove('active');
        });
    }
    
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('userName')?.value;
            const userCountry = document.getElementById('userCountrySelect')?.value;
            const favoriteTeam = document.getElementById('userFavoriteTeam')?.value;
            
            if (!userName || !userCountry) {
                alert('Please enter your name and select your country.');
                return;
            }
            
            userProfile = {
                name: userName,
                country: userCountry,
                favoriteTeam: favoriteTeam || '',
                avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
                loginDate: new Date().toISOString()
            };
            
            localStorage.setItem('afcon2025_user_profile', JSON.stringify(userProfile));
            updateProfileDisplay();
            
            if (loginModal) loginModal.classList.remove('active');
            this.reset();
            alert(`Welcome to AFCON 2025 Hub, ${userName}!`);
        });
    }
});