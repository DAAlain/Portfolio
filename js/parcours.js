// Chargement du parcours depuis le fichier JSON
async function loadTimeline() {
    try {
        const response = await fetch('data/parcours.json');
        const timelineData = await response.json();
        const timelineContainer = document.getElementById('timeline-container');
        
        if (!timelineContainer) return;
        
        // Trier les données par date (du plus récent au plus ancien pour l'affichage)
        const sortedData = [...timelineData].sort((a, b) => {
            // Extraire l'année de la date
            const yearA = parseInt(a.date.match(/\d{4}/)?.[0] || '0');
            const yearB = parseInt(b.date.match(/\d{4}/)?.[0] || '0');
            return yearB - yearA; // Ordre décroissant (du plus récent au plus ancien)
        });
        
        timelineContainer.innerHTML = '';
        
        // Créer le wrapper avec la ligne verticale
        const wrapper = document.createElement('div');
        wrapper.className = 'timeline-wrapper';
        
        const line = document.createElement('div');
        line.className = 'timeline-line';
        wrapper.appendChild(line);
        
        // Créer les items de timeline
        sortedData.forEach((item, index) => {
            const timelineItem = createTimelineItem(item, index);
            wrapper.appendChild(timelineItem);
        });
        
        timelineContainer.appendChild(wrapper);
    } catch (error) {
        console.error('Erreur lors du chargement du parcours:', error);
        const timelineContainer = document.getElementById('timeline-container');
        if (timelineContainer) {
            timelineContainer.innerHTML = 
                '<p style="text-align: center; color: #666;">Erreur lors du chargement du parcours.</p>';
        }
    }
}

// Fonction pour déterminer le statut d'un élément
function getItemStatus(dateString) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Extraire toutes les années de la date
    const years = dateString.match(/\d{4}/g) || [];
    
    if (years.length === 0) return 'planned';
    
    // Si c'est une plage de dates (ex: "2021-2023" ou "2023 - 2026")
    if (years.length === 2) {
        const startYear = parseInt(years[0]);
        const endYear = parseInt(years[1]);
        
        if (endYear < currentYear) {
            return 'completed';
        } else if (startYear <= currentYear && endYear >= currentYear) {
            return 'in-progress';
        } else {
            return 'planned';
        }
    }
    
    // Si c'est une date spécifique (ex: "28 avril 2025")
    if (dateString.includes('mars') || dateString.includes('avril') || 
        dateString.includes('mai') || dateString.includes('juin') ||
        dateString.includes('juillet') || dateString.includes('août') ||
        dateString.includes('septembre') || dateString.includes('octobre') ||
        dateString.includes('novembre') || dateString.includes('décembre') ||
        dateString.includes('janvier') || dateString.includes('février')) {
        
        const year = parseInt(years[0]);
        let month = 1;
        
        // Déterminer le mois
        if (dateString.includes('janvier')) month = 1;
        else if (dateString.includes('février')) month = 2;
        else if (dateString.includes('mars')) month = 3;
        else if (dateString.includes('avril')) month = 4;
        else if (dateString.includes('mai')) month = 5;
        else if (dateString.includes('juin')) month = 6;
        else if (dateString.includes('juillet')) month = 7;
        else if (dateString.includes('août')) month = 8;
        else if (dateString.includes('septembre')) month = 9;
        else if (dateString.includes('octobre')) month = 10;
        else if (dateString.includes('novembre')) month = 11;
        else if (dateString.includes('décembre')) month = 12;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return 'completed';
        } else if (year === currentYear && month >= currentMonth) {
            return 'in-progress';
        } else {
            return 'planned';
        }
    }
    
    // Par défaut, si une seule année
    const year = parseInt(years[0]);
    if (year < currentYear) {
        return 'completed';
    } else if (year === currentYear) {
        return 'in-progress';
    } else {
        return 'planned';
    }
}

// Création d'un élément de timeline
function createTimelineItem(item, index) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    // Créer le contenu de la carte
    const content = document.createElement('div');
    content.className = 'timeline-item-content';
    
    content.innerHTML = `
        <h3 class="timeline-item-title">${item.titre}</h3>
        <p class="timeline-item-description">${item.description}</p>
        <a href="#" class="timeline-item-link" data-item-id="${item.id}">
            En savoir plus <i class="fas fa-arrow-right"></i>
        </a>
    `;
    
    // Ajouter l'event listener pour ouvrir le modal
    const link = content.querySelector('.timeline-item-link');
    link.addEventListener('click', (e) => {
        e.preventDefault();
        openTimelineModal(item);
    });
    
    // Créer le marqueur (cercle sur la ligne)
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    
    // Créer la date pill (de l'autre côté de la ligne)
    const datePill = document.createElement('div');
    datePill.className = 'timeline-date-pill';
    datePill.textContent = item.date;
    
    // Créer le wrapper pour le marqueur
    const markerWrapper = document.createElement('div');
    markerWrapper.className = 'timeline-marker-wrapper';
    markerWrapper.appendChild(marker);
    
    timelineItem.appendChild(datePill);
    timelineItem.appendChild(content);
    timelineItem.appendChild(markerWrapper);
    
    return timelineItem;
}

// Fonction pour ouvrir le modal avec les détails
function openTimelineModal(item) {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('timeline-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'timeline-modal';
        modal.className = 'timeline-modal';
        modal.innerHTML = `
            <div class="timeline-modal-overlay"></div>
            <div class="timeline-modal-content">
                <button class="timeline-modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="timeline-modal-body">
                    <!-- Le contenu sera injecté ici -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners pour fermer le modal
        const closeBtn = modal.querySelector('.timeline-modal-close');
        const overlay = modal.querySelector('.timeline-modal-overlay');
        
        closeBtn.addEventListener('click', closeTimelineModal);
        overlay.addEventListener('click', closeTimelineModal);
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeTimelineModal();
            }
        });
    }
    
    // Remplir le contenu du modal
    const modalBody = modal.querySelector('.timeline-modal-body');
    modalBody.innerHTML = `
        <div class="timeline-modal-date">${item.date}</div>
        <h2 class="timeline-modal-title">${item.titre}</h2>
        <div class="timeline-modal-company">${item.entreprise}</div>
        <p class="timeline-modal-description">${item.description}</p>
    `;
    
    // Afficher le modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer le modal
function closeTimelineModal() {
    const modal = document.getElementById('timeline-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadTimeline();
});

