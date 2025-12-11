// Variables globales
let projectDetailsData = null;
let currentProject = null;

// Fonction pour obtenir l'ID du projet depuis l'URL
function getProjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
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
    await loadProjectDetails();
    
    const projectId = getProjectIdFromURL();
    
    if (projectId && projectDetailsData) {
        // Afficher le détail du projet
        const project = projectDetailsData.find(p => p.id === projectId);
        if (project) {
            currentProject = project;
            renderProjectDetail(project);
            setupScrollNavigation();
        } else {
            showError('Projet non trouvé');
        }
    } else {
        showError('Aucun projet sélectionné');
    }
}

// Rendre le détail du projet
function renderProjectDetail(project) {
    const content = document.getElementById('project-detail-content');
    if (!content) return;
    
    // Créer le header
    const header = createProjectHeader(project);
    
    // Créer les sections
    const sections = createProjectSections(project);
    
    content.innerHTML = header + sections;
    
    // Setup scroll navigation après le rendu
    setTimeout(() => {
        setupScrollNavigation();
    }, 100);
}

// Créer le header du projet
function createProjectHeader(project) {
    const demoBtn = project.lien_demo ? 
        `<a href="${project.lien_demo}" target="_blank" class="btn btn-demo">
            <i class="fas fa-external-link-alt"></i>
            <span>Voir la démo</span>
        </a>` : '';
    
    const sourceBtn = project.lien_github ? 
        `<a href="${project.lien_github}" target="_blank" class="btn btn-source">
            <i class="fab fa-github"></i>
            <span>Code source</span>
        </a>` : 
        `<span class="btn btn-source" style="opacity: 0.5; cursor: not-allowed;">
            <i class="fab fa-github"></i>
            <span>Code source non disponible</span>
        </span>`;
    
    return `
        <div class="project-detail-header" id="section-overview-header">
            <div class="project-header-top-section">
                <div class="project-header-left">
                    <h1 class="project-detail-title">${project.titre}</h1>
                    <p class="project-detail-subtitle">${project.contexte || ''}</p>
                </div>
                <div class="project-header-actions">
                    ${demoBtn}
                    ${sourceBtn}
                </div>
            </div>
        </div>
    `;
}

// Créer les sections du projet
function createProjectSections(project) {
    // KPI Cards
    const kpiCards = createKPICards(project);
    
    // Description
    const description = `
        <section id="section-description" class="project-detail-scroll-section">
            <div class="project-detail-section">
                <h2><i class="fas fa-info-circle"></i> Description</h2>
                <p>${project.description_longue || project.description_courte || ''}</p>
            </div>
        </section>
    `;
    
    // Objectifs et Défis
    const objectives = project.objectifs ? `
        <div class="project-detail-section" id="objectives-content">
            <h2><i class="fas fa-bullseye"></i> Objectifs</h2>
            <ul class="project-detail-list">
                ${project.objectifs.map(obj => `<li>${obj}</li>`).join('')}
            </ul>
        </div>
    ` : '';
    
    const challenges = project.defis ? `
        <div class="project-detail-section" id="challenges-content">
            <h2><i class="fas fa-tasks"></i> Défis</h2>
            <ul class="project-detail-list">
                ${project.defis.map(defi => `<li>${defi}</li>`).join('')}
            </ul>
        </div>
    ` : '';
    
    const objectivesChallenges = `
        <section id="section-objectives" class="project-detail-scroll-section">
            <div class="project-detail-sections-row">
                ${objectives}
                ${challenges}
            </div>
        </section>
        <section id="section-challenges" class="project-detail-scroll-section" style="display: none;">
        </section>
    `;
    
    // Galerie
    const gallery = project.captures && project.captures.length > 0 ? `
        <section id="section-gallery" class="project-detail-scroll-section">
            <div class="project-detail-section">
                <h2><i class="fas fa-images"></i> Galerie</h2>
                <div class="project-detail-captures">
                    ${project.captures.map(capture => `
                        <div class="project-detail-capture">
                            <img src="${capture}" alt="${project.titre}" />
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    ` : '';
    
    return `
        <div class="project-detail-sections">
            <section id="section-overview" class="project-detail-scroll-section">
                ${kpiCards}
            </section>
            ${description}
            ${objectivesChallenges}
            ${gallery}
        </div>
    `;
}

// Créer les KPI cards
function createKPICards(project) {
    const techTags = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    const status = project.travail_en_groupe ? 'Travail en groupe' : 'Travail individuel';
    
    return `
        <div class="project-detail-kpi-grid">
            <div class="project-detail-kpi-card">
                <div class="project-detail-kpi-header">
                    <div class="project-detail-kpi-label">Technologies utilisées</div>
                    <div class="project-detail-kpi-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                        <i class="fas fa-code"></i>
                    </div>
                </div>
                <div class="project-detail-kpi-tech-value">
                    ${techTags}
                </div>
                <div class="project-detail-kpi-change positive">
                    <span>Technologies maîtrisées</span>
                </div>
            </div>
            <div class="project-detail-kpi-card">
                <div class="project-detail-kpi-header">
                    <div class="project-detail-kpi-label">Status</div>
                    <div class="project-detail-kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="project-detail-kpi-value">Terminé</div>
                <div class="project-detail-kpi-change positive">
                    <span>Projet finalisé</span>
                </div>
            </div>
            <div class="project-detail-kpi-card">
                <div class="project-detail-kpi-header">
                    <div class="project-detail-kpi-label">Date</div>
                    <div class="project-detail-kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-calendar"></i>
                    </div>
                </div>
                <div class="project-detail-kpi-value">${project.date || 'N/A'}</div>
                <div class="project-detail-kpi-change positive">
                    <span>${status}</span>
                </div>
            </div>
        </div>
    `;
}

// Setup scroll navigation
function setupScrollNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-scroll]');
    const sections = document.querySelectorAll('.project-detail-scroll-section');
    
    // Observer pour détecter quelle section est visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateActiveNavItem(sectionId);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -50% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Gérer le scroll vers le haut pour "Vue d'ensemble"
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            updateActiveNavItem('section-overview');
        }
    });
    
    // Event listeners pour le scroll
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-scroll');
            scrollToSection(targetId);
        });
    });
}

// Scroll vers une section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    } else if (sectionId === 'section-overview') {
        // Scroll vers le header
        const header = document.getElementById('section-overview-header');
        if (header) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}

// Mettre à jour l'item de navigation actif
function updateActiveNavItem(sectionId) {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-scroll]');
    navItems.forEach(item => {
        if (item.getAttribute('data-scroll') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Afficher une erreur
function showError(message) {
    const content = document.getElementById('project-detail-content');
    if (content) {
        content.innerHTML = `
            <div class="error-message">
                <h2>Erreur</h2>
                <p>${message}</p>
                <a href="projets.html" class="btn btn-primary">Retour aux projets</a>
            </div>
        `;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

