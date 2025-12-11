// Variables globales
let allProjectsData = null;
let projectDetailsData = null;
let currentFilters = {
    technologies: [],
    years: [],
    travail_en_groupe: []
};
let filteredProjects = null;

// Charger tous les projets
async function loadAllProjects() {
    try {
        const response = await fetch('data/projets.json');
        allProjectsData = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement de tous les projets:', error);
    }
}

// Charger les détails des projets
async function loadProjectDetails() {
    try {
        const response = await fetch('data/projets-details.json');
        projectDetailsData = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des détails des projets:', error);
    }
}

// Initialiser la page
async function initPage() {
    await Promise.all([loadAllProjects(), loadProjectDetails()]);
    
    // Initialiser les projets filtrés
    if (projectDetailsData) {
        filteredProjects = projectDetailsData;
    } else {
        filteredProjects = allProjectsData;
    }
    
    // Remplir la grille des projets
    populateProjectsGrid();
}

// Remplir la liste des projets dans la sidebar
function populateSidebarProjects() {
    const projectsList = document.getElementById('sidebar-projects-list');
    if (!projectsList) return;
    
    projectsList.innerHTML = '';
    
    if (!allProjectsData) return;
    
    allProjectsData.forEach(project => {
        const link = document.createElement('a');
        link.href = `projet-detail.html?id=${project.id}`;
        link.className = 'sidebar-nav-item';
        link.innerHTML = `
            <i class="fas fa-folder"></i>
            <span>${project.titre}</span>
        `;
        projectsList.appendChild(link);
    });
}

// Remplir la grille des projets
function populateProjectsGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const projectsToDisplay = filteredProjects || allProjectsData;
    if (!projectsToDisplay) return;
    
    projectsToDisplay.forEach(project => {
        const card = document.createElement('a');
        card.href = `projet-detail.html?id=${project.id}`;
        card.className = 'project-card';
        
        const techTags = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.titre}" />
            </div>
            <div class="project-info">
                <h3>${project.titre}</h3>
                <p>${project.description || ''}</p>
                <div class="project-tech">
                    ${techTags}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Ouvrir le modal de filtrage
function openFilterModal() {
    const modal = document.getElementById('filter-modal');
    const modalBody = document.getElementById('filter-modal-body');
    
    if (!allProjectsData || !projectDetailsData) {
        console.error('Les données des projets ne sont pas chargées');
        return;
    }
    
    // Extraire les données uniques pour les filtres
    const allTechnologies = new Set();
    const allYears = new Set();
    
    projectDetailsData.forEach(project => {
        project.technologies.forEach(tech => allTechnologies.add(tech));
        if (project.date) allYears.add(project.date);
    });
    
    // Générer le HTML des filtres
    const technologiesHTML = Array.from(allTechnologies).sort().map(tech => {
        const isChecked = currentFilters.technologies.includes(tech);
        return `
            <label class="filter-checkbox">
                <input type="checkbox" value="${tech}" data-filter="technologies" ${isChecked ? 'checked' : ''}>
                <span>${tech}</span>
            </label>
        `;
    }).join('');
    
    const yearsHTML = Array.from(allYears).sort().reverse().map(year => {
        const isChecked = currentFilters.years.includes(year);
        return `
            <label class="filter-checkbox">
                <input type="checkbox" value="${year}" data-filter="years" ${isChecked ? 'checked' : ''}>
                <span>${year}</span>
            </label>
        `;
    }).join('');
    
    const travailEnGroupeHTML = `
        <label class="filter-checkbox">
            <input type="checkbox" value="true" data-filter="travail_en_groupe" ${currentFilters.travail_en_groupe.includes('true') ? 'checked' : ''}>
            <span>Travail en groupe</span>
        </label>
        <label class="filter-checkbox">
            <input type="checkbox" value="false" data-filter="travail_en_groupe" ${currentFilters.travail_en_groupe.includes('false') ? 'checked' : ''}>
            <span>Travail individuel</span>
        </label>
    `;
    
    const technologiesDiv = document.getElementById('filter-technologies');
    const yearsDiv = document.getElementById('filter-years');
    const contextDiv = document.getElementById('filter-context');
    
    if (technologiesDiv) {
        technologiesDiv.innerHTML = technologiesHTML;
    }
    
    if (yearsDiv) {
        yearsDiv.innerHTML = yearsHTML;
    }
    
    if (contextDiv) {
        contextDiv.innerHTML = travailEnGroupeHTML;
    }
    
    modal.style.display = 'flex';
}

// Fermer le modal de filtrage
function closeFilterModal() {
    const modal = document.getElementById('filter-modal');
    modal.style.display = 'none';
}

// Appliquer les filtres
function applyFilters() {
    const checkboxes = document.querySelectorAll('#filter-modal-body input[type="checkbox"]');
    
    // Réinitialiser les filtres
    currentFilters = {
        technologies: [],
        years: [],
        travail_en_groupe: []
    };
    
    // Collecter les filtres sélectionnés
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const filterType = checkbox.getAttribute('data-filter');
            currentFilters[filterType].push(checkbox.value);
        }
    });
    
    // Filtrer les projets
    if (!projectDetailsData) {
        console.error('Les détails des projets ne sont pas chargés');
        return;
    }
    
    filteredProjects = projectDetailsData.filter(project => {
        // Filtrer par technologies
        if (currentFilters.technologies.length > 0) {
            const hasTech = currentFilters.technologies.some(tech => 
                project.technologies.includes(tech)
            );
            if (!hasTech) return false;
        }
        
        // Filtrer par année
        if (currentFilters.years.length > 0) {
            if (!project.date || !currentFilters.years.includes(project.date)) return false;
        }
        
        // Filtrer par travail en groupe
        if (currentFilters.travail_en_groupe.length > 0) {
            const projectIsGroup = project.travail_en_groupe === true || project.travail_en_groupe === 'true';
            const wantsGroup = currentFilters.travail_en_groupe.includes('true');
            const wantsIndividual = currentFilters.travail_en_groupe.includes('false');
            
            if (wantsGroup && wantsIndividual) {
                // Si les deux sont sélectionnés, on affiche tout
            } else if (wantsGroup && !projectIsGroup) {
                return false;
            } else if (wantsIndividual && projectIsGroup) {
                return false;
            }
        }
        
        return true;
    });
    
    // Mettre à jour l'affichage
    populateProjectsGrid();
    
    // Mettre à jour le badge de filtres actifs
    const activeFiltersCount = currentFilters.technologies.length + 
                              currentFilters.years.length + 
                              currentFilters.travail_en_groupe.length;
    const filterBadge = document.getElementById('active-filters-count');
    if (filterBadge) {
        if (activeFiltersCount > 0) {
            filterBadge.textContent = activeFiltersCount;
            filterBadge.style.display = 'inline-block';
        } else {
            filterBadge.style.display = 'none';
        }
    }
    
    // Fermer le modal
    closeFilterModal();
}

// Réinitialiser les filtres
function resetFilters() {
    currentFilters = {
        technologies: [],
        years: [],
        travail_en_groupe: []
    };
    
    // Réinitialiser avec les détails complets
    if (projectDetailsData) {
        filteredProjects = projectDetailsData;
    } else {
        filteredProjects = allProjectsData;
    }
    
    // Décocher toutes les checkboxes
    document.querySelectorAll('#filter-modal-body input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Mettre à jour l'affichage
    populateProjectsGrid();
    
    // Masquer le badge
    const filterBadge = document.getElementById('active-filters-count');
    if (filterBadge) {
        filterBadge.style.display = 'none';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    
    // Event listeners
    const filterBtn = document.getElementById('filter-btn');
    const filterModalClose = document.getElementById('filter-modal-close');
    const filterApply = document.getElementById('filter-apply');
    const filterReset = document.getElementById('filter-reset');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', openFilterModal);
    }
    
    if (filterModalClose) {
        filterModalClose.addEventListener('click', closeFilterModal);
    }
    
    if (filterApply) {
        filterApply.addEventListener('click', applyFilters);
    }
    
    if (filterReset) {
        filterReset.addEventListener('click', resetFilters);
    }
    
    // Fermer le modal en cliquant en dehors
    const filterModal = document.getElementById('filter-modal');
    if (filterModal) {
        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                closeFilterModal();
            }
        });
    }
});

