// Variables globales
let allSkillsData = [];
let currentView = 'base'; // 'base' ou 'tempsLibre'

// Chargement des compétences depuis le fichier JSON
async function loadSkills() {
    try {
        const response = await fetch('data/competences.json');
        allSkillsData = await response.json();
        const skillsContainer = document.getElementById('skills-container');
        
        if (!skillsContainer) return;
        
        // Filtrer et afficher les compétences de base
        displaySkills('base');
        
        // Ajouter les écouteurs d'événements
        setupEventListeners();
    } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) {
            skillsContainer.innerHTML = 
                '<p style="text-align: center; color: #666;">Erreur lors du chargement des compétences.</p>';
        }
    }
}

// Afficher les compétences selon le type
function displaySkills(type) {
    const skillsContainer = document.getElementById('skills-container');
    const skillsFooter = document.getElementById('skills-footer');
    const btnTempsLibre = document.getElementById('btn-temps-libre');
    
    if (!skillsContainer) return;
    
    currentView = type;
    
    // Filtrer les compétences selon le type
    const filteredSkills = allSkillsData.filter(skill => {
        const skillType = skill.type || 'base';
        return skillType === type;
    });
    
    skillsContainer.innerHTML = '';
    
    // Ajouter les cartes de compétences
    filteredSkills.forEach(skill => {
        const skillCard = createSkillCard(skill);
        skillsContainer.appendChild(skillCard);
    });
    
    // Afficher/masquer le bouton de retour et le bouton "Dans mon temps libre"
    if (type === 'tempsLibre') {
        skillsFooter.style.display = 'flex';
        if (btnTempsLibre) btnTempsLibre.style.display = 'none';
    } else {
        skillsFooter.style.display = 'none';
        if (btnTempsLibre) btnTempsLibre.style.display = 'inline-flex';
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const btnTempsLibre = document.getElementById('btn-temps-libre');
    const btnRetour = document.getElementById('btn-retour');
    
    if (btnTempsLibre) {
        btnTempsLibre.addEventListener('click', () => {
            displaySkills('tempsLibre');
        });
    }
    
    if (btnRetour) {
        btnRetour.addEventListener('click', () => {
            displaySkills('base');
        });
    }
}

// Création d'une carte de compétence
function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'skill-card';
    
    // Générer une couleur si non fournie
    const color = skill.couleur || getColorForSkill(skill.nom);
    
    // Obtenir le libellé du niveau (avec abréviation pour les longs textes)
    const niveauLabels = {
        'confirmé': 'Confirmé',
        'intermédiaire': 'Interm.',
        'débutant': 'Débutant'
    };
    const niveauLabel = niveauLabels[skill.niveau] || skill.niveau.charAt(0).toUpperCase() + skill.niveau.slice(1);
    
    card.innerHTML = `
        <span class="skill-badge ${skill.niveau}">${niveauLabel}</span>
        <div class="skill-icon-wrapper">
            <div class="skill-icon" style="background: linear-gradient(135deg, ${color}22, ${color}44);">
                <i class="${skill.icone}" style="color: ${color};"></i>
            </div>
            <div class="skill-avatar">
                <i class="fas fa-user"></i>
            </div>
        </div>
        <div class="skill-card-content">
            <h3 class="skill-card-title">${skill.nom}</h3>
        </div>
    `;
    
    return card;
}

// Fonction pour obtenir une couleur basée sur le nom de la compétence
function getColorForSkill(skillName) {
    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#3b82f6', '#ef4444', '#06b6d4'
    ];
    let hash = 0;
    for (let i = 0; i < skillName.length; i++) {
        hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
});

