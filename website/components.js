document.addEventListener('DOMContentLoaded', () => {
    // ── Theme Management ──
    const savedTheme = localStorage.getItem('spinocare_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const isLoggedIn = !!localStorage.getItem('spinocare_auth_token');
    const userObj = JSON.parse(localStorage.getItem('spinocare_user') || '{}');
    const userName = userObj.name ? userObj.name.split(' ')[0] : 'User';

    // Generate links depending on login status
    let navLinksHTML = `
        <li><a href="index.html"><i class="fa-solid fa-house nav-icon"></i> Home</a></li>
        <li><a href="index.html#features"><i class="fa-solid fa-wand-magic-sparkles nav-icon"></i> Features</a></li>
        <li><a href="${isLoggedIn ? 'history.html' : 'login.html'}"><i class="fa-solid fa-clock-rotate-left nav-icon"></i> History</a></li>
        <li><a href="guide.html"><i class="fa-solid fa-book-medical nav-icon"></i> Guide</a></li>
    `;

    let authButtonsHTML = '';
    if (isLoggedIn) {
        navLinksHTML += `<li><a href="profile.html"><i class="fa-solid fa-user nav-icon"></i> Profile</a></li>`;
        authButtonsHTML = '';
    } else {
        authButtonsHTML = `
            <a href="login.html" class="login-link" style="color: var(--text-main); font-weight: 600; font-size: 0.9rem; padding: 0.5rem 0.9rem; border-radius: 20px;">Log In</a>
            <a href="signup.html" class="btn-primary header-signup" style="margin: 0; font-size: 0.85rem; padding: 0.5rem 1.1rem; border-radius: 20px;"><i class="fa-solid fa-user-plus"></i> Sign Up</a>
        `;
    }

    const headerHTML = `
    <header class="floating-capsule-navbar" id="main-header">
        <div class="capsule-nav-container">
            <nav class="capsule-nav-inner">
                <div class="nav-left-brand">
                    <a href="index.html" class="logo">
                        <img src="app-logo.webp" alt="SpinoCare Logo" class="app-logo"> Spino<span>Care</span>
                    </a>
                </div>

                <!-- Mobile Toggle Icon -->
                <div class="mobile-toggle" id="mobile-toggle">
                    <i class="fa-solid fa-bars"></i>
                </div>

                <div class="nav-right" id="nav-right">
                    <ul class="nav-links">
                        ${navLinksHTML}
                    </ul>
                    <div class="nav-actions-group" style="display: flex; align-items: center; gap: 0.75rem;">
                        ${authButtonsHTML}
                    </div>
                </div>
            </nav>
        </div>
    </header>
    `;

    const headerPlaceholder = document.getElementById('common-header');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;

        // Find which page we are on
        let currentPage = window.location.pathname.split('/').pop();
        if (!currentPage) currentPage = 'index.html';

        const mainHeader = document.getElementById('main-header');

        // Glassmorphism scroll effect
        if (currentPage === 'index.html') {
            mainHeader.classList.remove('navbar-solid', 'navbar');
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('scrolled');
                } else {
                    mainHeader.classList.remove('scrolled');
                }
            });
        }

        // Set active nav link
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.style.color = 'var(--primary)';
            }
        });

        // Theme Toggle Click Handler
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('spinocare_theme', newTheme);
                
                const icon = themeBtn.querySelector('i');
                if (newTheme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            });
        }

        // Logout event listener
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('spinocare_auth_token');
                localStorage.removeItem('spinocare_user');
                window.location.href = 'index.html';
            });
        }

        // Mobile Menu Toggle Logic
        const mobileToggle = document.getElementById('mobile-toggle');
        const navRight = document.getElementById('nav-right');
        if (mobileToggle && navRight) {
            mobileToggle.addEventListener('click', () => {
                navRight.classList.toggle('menu-open');
                const icon = mobileToggle.querySelector('i');
                if (navRight.classList.contains('menu-open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        }
    }
});
