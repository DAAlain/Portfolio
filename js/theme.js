// Gestion du mode sombre
// Appliquer le thème immédiatement pour éviter le flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
})();

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (!themeToggle) return;
    
    // Vérifier la préférence sauvegardée ou utiliser le mode sombre par défaut
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Fonction pour mettre à jour l'icône
    function updateThemeIcon(isDark) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            text.textContent = 'Mode clair';
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            text.textContent = 'Mode sombre';
        }
    }
    
    // Gérer le clic sur le bouton
    themeToggle.addEventListener('click', function() {
        html.classList.toggle('dark-mode');
        const isDark = html.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
    
    // Mettre à jour l'icône au chargement
    updateThemeIcon(savedTheme === 'dark');
}

// Écouter l'événement de chargement de la sidebar
document.addEventListener('sidebarLoaded', initTheme);

// Essayer d'initialiser immédiatement si la sidebar est déjà chargée
if (document.getElementById('theme-toggle')) {
    initTheme();
}

// Fallback pour les pages sans événement sidebarLoaded (ex: pages autonomes)
document.addEventListener('DOMContentLoaded', initTheme);

