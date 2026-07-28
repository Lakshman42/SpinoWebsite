document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = !!localStorage.getItem('spinocare_auth_token');

    // Generate links depending on login status
    let navLinksHTML = `
        <li><a href="index.html#features">Features</a></li>
        <li><a href="${isLoggedIn ? 'history.html' : 'login.html'}">History</a></li>
        <li><a href="guide.html">Guide</a></li>
        <li><a href="${isLoggedIn ? 'profile.html' : 'login.html'}">Profile</a></li>
    `;

    let authButtonsHTML = '';
    if (isLoggedIn) {
        navLinksHTML += `<li><a href="#" id="nav-logout-btn" style="color: var(--primary); font-weight: 600;">Log Out</a></li>`;
    } else {
        navLinksHTML += `<li><a href="login.html" class="login-link" style="color: var(--primary); font-weight: 600;">Log In</a></li>`;
        authButtonsHTML = `<a href="signup.html" class="btn-primary header-signup" style="margin: 0;">Sign Up</a>`;
    }

    const headerHTML = `
    <header class="navbar navbar-solid" id="main-header">
        <div class="container">
            <nav style="display: flex; align-items: center; justify-content: space-between;">
                <a href="index.html" class="logo">
                    <img src="app-logo.webp" alt="SpinoCare Logo" class="app-logo"> Spino<span>Care</span>
                </a>
                
                <!-- Mobile Toggle Icon -->
                <div class="mobile-toggle" id="mobile-toggle">
                    <i class="fa-solid fa-bars"></i>
                </div>

                <div class="nav-right" id="nav-right" style="display: flex; align-items: center; gap: 2rem;">
                    <ul class="nav-links" style="margin: 0;">
                        ${navLinksHTML}
                    </ul>
                    ${authButtonsHTML}
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

        // Remove solid class for index page to match original design
        if (currentPage === 'index.html') {
            mainHeader.classList.remove('navbar-solid', 'navbar');
            
            // Add scroll listener for index glassmorphism
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('scrolled');
                } else {
                    mainHeader.classList.remove('scrolled');
                }
            });
        }

        // Set active state
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.style.color = 'var(--primary)';
            }
        });

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
});
