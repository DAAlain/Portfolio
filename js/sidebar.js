fetch('sidebar.html').then(r => r.text()).then(html => {
    document.querySelector('.dashboard-container').insertAdjacentHTML('afterbegin', html);
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelector(`[href="${currentPage}"]`)?.classList.add('active');
    
    // Émettre un événement pour signaler que la sidebar est chargée
    document.dispatchEvent(new CustomEvent('sidebarLoaded'));

    // Ajouter bouton hamburger + overlay pour mobile
    const container = document.querySelector('.dashboard-container');
    if (container && !document.querySelector('.mobile-nav-toggle')) {
        container.insertAdjacentHTML('afterbegin', `
            <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Ouvrir le menu">
                <i class="fas fa-bars"></i>
            </button>
            <div class="sidebar-overlay"></div>
        `);

        const toggleBtn = document.getElementById('mobile-nav-toggle');
        const overlay = document.querySelector('.sidebar-overlay');
        const root = document.documentElement;

        function updateIcon(isOpen) {
            const icon = toggleBtn?.querySelector('i');
            if (!icon) return;
            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                toggleBtn.setAttribute('aria-label', 'Fermer le menu');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                toggleBtn.setAttribute('aria-label', 'Ouvrir le menu');
            }
        }

        function toggleSidebar() {
            const isOpen = root.classList.toggle('sidebar-open');
            updateIcon(isOpen);
        }

        toggleBtn?.addEventListener('click', toggleSidebar);
        overlay?.addEventListener('click', () => {
            root.classList.remove('sidebar-open');
            updateIcon(false);
        });

        // S'assurer que l'icône correspond à l'état initial
        updateIcon(root.classList.contains('sidebar-open'));
    }
});

