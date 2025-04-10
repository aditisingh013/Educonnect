document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const sidebar = document.querySelector('.sidebar');

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', openSidebar);
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);

    // Check login status by talking to the backend
    fetch('/api/protected', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                console.log("User data from token:", data.user);

                // Hide login/signup
                if (loginBtn) loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';

                // Show logout
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                logoutLink.addEventListener('click', () => {
                    fetch('/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    }).then(() => {
                        window.location.href = '/home.html'; // Reload cleanly to original home
                    });
                });

                sidebar.appendChild(logoutLink);
            } else {
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => {
                        window.location.href = 'Loginpage.html';
                    });
                }
                if (signupBtn) {
                    signupBtn.addEventListener('click', () => {
                        window.location.href = 'Loginpage.html#signup';
                    });
                }
            }
        })
        .catch(err => console.error("Auth check failed:", err));

    // Close sidebar on nav click
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebarMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebarMenu();
        }
    });

    document.querySelectorAll('.faq-question').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        });
    });
});
