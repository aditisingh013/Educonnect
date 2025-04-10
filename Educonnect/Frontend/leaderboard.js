document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Function to open sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    }

    // Function to close sidebar
    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event listeners
    menuToggle.addEventListener('click', openSidebar);
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);

    // Close sidebar when clicking on a link
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebarMenu);
    });

    // Close sidebar on window resize if open
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) { // Only close on larger screens
            closeSidebarMenu();
        }
    });

    // Sidebar Toggle Functionality
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
});


