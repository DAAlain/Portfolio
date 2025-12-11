// Animation des statistiques
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Animation au scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Animer les stats si c'est la section stats
            if (entry.target.classList.contains('stats-section')) {
                animateStats();
            }
        }
    });
}, observerOptions);

// Gestion de la fenêtre de code
let isMaximized = false;

function toggleMaximize() {
    const codeWindow = document.querySelector('.code-window');
    const maximizeIcon = document.querySelector('.control.maximize i');
    
    if (!codeWindow) return;
    
    if (isMaximized) {
        // Restaurer la taille normale avec animation
        // Garder la classe 'maximized' pendant l'animation
        codeWindow.classList.add('minimizing');
        
        // Attendre la fin de l'animation avant de retirer les classes
        setTimeout(() => {
            codeWindow.classList.remove('minimizing');
            codeWindow.classList.remove('maximized');
            if (maximizeIcon) {
                maximizeIcon.className = 'fas fa-square';
            }
            document.body.style.overflow = '';
            isMaximized = false;
            stopTerminalAnimation();
            // Réinitialiser will-change après l'animation
            codeWindow.style.willChange = 'auto';
        }, 500);
    } else {
        // Maximiser avec animation
        codeWindow.classList.add('maximizing');
        codeWindow.classList.add('maximized');
        
        setTimeout(() => {
            codeWindow.classList.remove('maximizing');
            if (maximizeIcon) {
                maximizeIcon.className = 'fas fa-window-restore';
            }
            document.body.style.overflow = 'hidden';
            isMaximized = true;
            startTerminalAnimation();
            // Réinitialiser will-change après l'animation
            setTimeout(() => {
                codeWindow.style.willChange = 'auto';
            }, 500);
        }, 50);
    }
}

// Réponse à l'énigme calculée par la fonction decodePassword()
// a = skills[2][6] + developer[2] + createAmazingProjects()[14] = 'r' + 'a' + 'b' = 'rab'
// b = createAmazingProjects()[14] + skills[2][7] = 'b' + 'i' = 'bi'
// c = skills[2][9] = 't'
// return a + b + c = 'rab' + 'bi' + 't' = 'rabbit'
const riddleAnswer = 'rabbit';

// Fonctions disponibles dans le code
const codeFunctions = {
    'developer': () => "'Alain DA-ROS'",
    'skills': () => "['HTML', 'CSS', 'JavaScript']",
    'createAmazingProjects()': () => "'Portfolio Dashboard'",
    'createAmazingProjects': () => "'Portfolio Dashboard'"
};

const codeArt = `
        (\\_/)
       (  -.-)
      o_(")(")
`;

// Variable pour stocker le handler de l'event listener
let terminalInputHandler = null;

function startTerminalAnimation() {
    const terminalContent = document.getElementById('terminal-content');
    const terminalInput = document.getElementById('terminal-input');
    const codeWindow = document.querySelector('.code-window');
    
    if (!terminalContent || !terminalInput || !codeWindow) return;
    
    // Supprimer l'ancien event listener s'il existe
    if (terminalInputHandler) {
        terminalInput.removeEventListener('keydown', terminalInputHandler);
        terminalInputHandler = null;
    }
    
    // Focus sur l'input
    setTimeout(() => {
        terminalInput.focus();
    }, 100);
    
    // Gérer la soumission de commande
    terminalInputHandler = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value.trim();
            
            if (!command) return;
            
            // Afficher la commande tapée
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `
                <span class="terminal-prompt">$</span>
                <span class="terminal-command">${command}</span>
            `;
            terminalContent.appendChild(commandLine);
            
            // Vérifier si c'est la réponse à l'énigme
            setTimeout(() => {
                if (command.toLowerCase() === riddleAnswer) {
                    // Bonne réponse ! Afficher l'easter egg
                    const successMsg = document.createElement('div');
                    successMsg.className = 'terminal-output success';
                    successMsg.textContent = '🎉 Bravo ! Tu as résolu l\'énigme !';
                    terminalContent.appendChild(successMsg);
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                    
                    setTimeout(() => {
                        showCodeArt();
                    }, 500);
                } else if (codeFunctions[command]) {
                    // Exécuter la fonction si elle existe
                    const result = codeFunctions[command]();
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-output success';
                    outputLine.textContent = result;
                    terminalContent.appendChild(outputLine);
                } else {
                    // Essayer d'évaluer l'expression (pour skills[2][6], developer[2], etc.)
                    try {
                        // Créer un contexte sécurisé pour l'évaluation
                        const context = {
                            developer: 'Alain DA-ROS',
                            skills: ['HTML', 'CSS', 'JavaScript'],
                            createAmazingProjects: () => 'Portfolio Dashboard'
                        };
                        
                        // Fonction pour évaluer l'expression de manière sécurisée
                        const evaluateExpression = (expr) => {
                            // Remplacer les variables par leurs valeurs dans le contexte
                            let safeExpr = expr;
                            safeExpr = safeExpr.replace(/developer/g, 'context.developer');
                            safeExpr = safeExpr.replace(/skills/g, 'context.skills');
                            safeExpr = safeExpr.replace(/createAmazingProjects\(\)/g, 'context.createAmazingProjects()');
                            
                            // Évaluer avec le contexte
                            const func = new Function('context', `return ${safeExpr}`);
                            return func(context);
                        };
                        
                        const result = evaluateExpression(command);
                        const outputLine = document.createElement('div');
                        outputLine.className = 'terminal-output success';
                        outputLine.textContent = `'${result}'`;
                        terminalContent.appendChild(outputLine);
                    } catch (e) {
                        // Commande inconnue
                        const errorLine = document.createElement('div');
                        errorLine.className = 'terminal-output error';
                        errorLine.textContent = `Erreur: ${command} n'est pas défini`;
                        terminalContent.appendChild(errorLine);
                    }
                }
                
                // Scroll et vider l'input
                terminalContent.scrollTop = terminalContent.scrollHeight;
                terminalInput.value = '';
            }, 300);
        }
    };
    
    terminalInput.addEventListener('keydown', terminalInputHandler);
}

function showCodeArt() {
    const codeWindow = document.querySelector('.code-window');
    const codeContent = document.querySelector('.code-content');
    
    // Vérifier que la fenêtre est bien maximisée
    if (!codeWindow || !codeWindow.classList.contains('maximized')) {
        return;
    }
    
    if (!codeContent) return;
    
    // Supprimer l'ancien easter egg s'il existe
    const existingArt = codeContent.querySelector('.code-art');
    if (existingArt) {
        existingArt.remove();
    }
    
    // Créer un élément pour l'art ASCII
    const artElement = document.createElement('div');
    artElement.className = 'code-art';
    artElement.innerHTML = `
        <div class="code-art-content">${codeArt}</div>
        <div class="code-art-text">🐰 Tu m'as trouvé !</div>
    `;
    
    // Positionner le code-content en position relative pour le centrage absolu
    codeContent.style.position = 'relative';
    
    // Ajouter à la fin du contenu
    codeContent.appendChild(artElement);
    
    // Animation d'apparition
    setTimeout(() => {
        artElement.style.opacity = '1';
    }, 100);
}

function stopTerminalAnimation() {
    // Réinitialiser l'art si présent
    const codeContent = document.querySelector('.code-content');
    if (codeContent) {
        const artElement = codeContent.querySelector('.code-art');
        if (artElement) {
            artElement.remove();
        }
    }
    
    // Supprimer l'event listener
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput && terminalInputHandler) {
        terminalInput.removeEventListener('keydown', terminalInputHandler);
        terminalInputHandler = null;
    }
    
    // Réinitialiser le terminal
    const terminalContent = document.getElementById('terminal-content');
    
    if (terminalContent) {
        terminalContent.innerHTML = `
            <div class="terminal-welcome">
                <div class="terminal-line">
                    <span class="terminal-output info">Bienvenue dans le terminal interactif</span>
                </div>
                <div class="terminal-line">
                    <span class="terminal-output info">Tapez le nom d'une fonction du code pour l'exécuter</span>
                </div>
                <div class="terminal-line">
                    <span class="terminal-output info">Fonctions disponibles: developer, skills, createAmazingProjects()</span>
                </div>
                <div class="terminal-line">
                    <span class="terminal-output info">💡 Résolvez l'énigme dans le code et tapez la réponse ici</span>
                </div>
            </div>
        `;
    }
    
    if (terminalInput) {
        terminalInput.value = '';
    }
}

function minimizeWindow() {
    if (isMaximized) {
        toggleMaximize();
    }
}

function closeWindow() {
    if (isMaximized) {
        toggleMaximize();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Observer la section stats
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.style.opacity = '0';
        statsSection.style.transform = 'translateY(30px)';
        statsSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(statsSection);
    }
    
    // Animation des lignes de code avec délai
    const codeLines = document.querySelectorAll('.code-line');
    codeLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Event listeners pour les boutons de la fenêtre
    const minimizeBtn = document.querySelector('.control.minimize');
    const maximizeBtn = document.querySelector('.control.maximize');
    const closeBtn = document.querySelector('.control.close');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow();
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMaximize();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWindow();
        });
    }
});

