// ALL AFCON 2025 TEAMS
const allTeams = [
    { code: 'MLI', name: 'Mali', flag: 'https://www.worldometers.info/img/flags/ml-flag.gif' },
    { code: 'TUN', name: 'Tunisia', flag: 'https://www.worldometers.info/img/flags/ts-flag.gif' },
    { code: 'SEN', name: 'Senegal', flag: 'https://www.worldometers.info/img/flags/sg-flag.gif' },
    { code: 'SDN', name: 'Sudan', flag: 'https://www.worldometers.info/img/flags/su-flag.gif' },
    { code: 'EGY', name: 'Egypt', flag: 'https://www.worldometers.info/img/flags/eg-flag.gif' },
    { code: 'BEN', name: 'Benin', flag: 'https://www.worldometers.info/img/flags/bn-flag.gif' },
    { code: 'CIV', name: 'Ivory Coast', flag: 'https://www.worldometers.info/img/flags/iv-flag.gif' },
    { code: 'BFA', name: 'Burkina Faso', flag: 'https://www.worldometers.info/img/flags/uv-flag.gif' },
    { code: 'ALG', name: 'Algeria', flag: 'https://www.worldometers.info/img/flags/ag-flag.gif' },
    { code: 'COD', name: 'DR Congo', flag: 'https://www.worldometers.info/img/flags/congo-flag.gif' },
    { code: 'NGA', name: 'Nigeria', flag: 'https://www.worldometers.info/img/flags/ni-flag.gif' },
    { code: 'MOZ', name: 'Mozambique', flag: 'https://www.worldometers.info/img/flags/mz-flag.gif' },
    { code: 'RSA', name: 'South Africa', flag: 'https://www.worldometers.info/img/flags/small/tn_sf-flag.gif' },
    { code: 'CMR', name: 'Cameroon', flag: 'https://www.worldometers.info/img/flags/small/tn_cm-flag.gif' },
    { code: 'MAR', name: 'Morocco', flag: 'https://www.worldometers.info/img/flags/mo-flag.gif' },
    { code: 'TAN', name: 'Tanzania', flag: 'https://www.worldometers.info/img/flags/small/tn_tz-flag.gif' }
];

// Store predictions
let predictions = {
    m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null,
    qf1: null, qf2: null, qf3: null, qf4: null,
    sf1: null, sf2: null,
    'final-team1': null, 'final-team2': null, 'final-winner': null,
    'third-team1': null, 'third-team2': null
};

// Match mappings
const matchMappings = {
    'qf1': ['m1', 'm2'],
    'qf2': ['m3', 'm4'],
    'qf3': ['m5', 'm6'],
    'qf4': ['m7', 'm8'],
    'sf1': ['qf1', 'qf2'],
    'sf2': ['qf3', 'qf4']
};

// User profile management
let userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile')) || null;

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "afcon2025admin"
};

let adminLoginAttempts = 0;
const MAX_ADMIN_ATTEMPTS = 3;

// Variable pour suivre la sélection en cours
let currentSelection = null;
let isReadOnlyMode = false;

// ========================================
// CORE PREDICTION FUNCTIONS
// ========================================

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing predictor');
    
    // Initialize core prediction functionality
    initializeRoundOf16();
    updateProgress();
    loadSavedPredictions();
    
    // Initialize user management
    initializeUserManagement();
    updateProfileDisplay();
    initProfileHistory();
    
    // Add event listeners for control buttons
    document.getElementById('saveBtn').addEventListener('click', savePredictions);
    document.getElementById('resetBtn').addEventListener('click', resetAllPredictions);
    document.getElementById('shareBtn').addEventListener('click', sharePredictions);
    document.getElementById('cancelBtn').addEventListener('click', cancelSelection);
    
    // Navigation functionality
    initializeNavigation();
    
    // Saved predictions panel events
    document.getElementById('savedPredictionsToggle').addEventListener('click', toggleSavedPredictionsPanel);
    document.getElementById('closeSavedPanel').addEventListener('click', toggleSavedPredictionsPanel);
    document.getElementById('clearAllPredictions').addEventListener('click', clearAllSavedPredictions);
    
    console.log('Predictor initialized successfully');
});

// Fonction pour annuler la sélection
function cancelSelection() {
    if (currentSelection) {
        const { match, teamCode, element } = currentSelection;
        
        // Annuler la sélection
        predictions[match] = null;
        element.classList.remove('selected');
        element.querySelector('.prediction-check')?.classList.add('hidden');
        
        // Réinitialiser les rounds suivants
        resetSubsequentRounds(match);
        
        // Mettre à jour les statuts
        updateTeamStatuses();
        updateProgress();
        
        // Cacher le bouton Annuler
        document.getElementById('cancelBtn').style.display = 'none';
        currentSelection = null;
        
        console.log(`Selection cancelled for ${teamCode} in ${match}`);
    }
}

// Réinitialiser les rounds suivants
function resetSubsequentRounds(matchId) {
    console.log(`Resetting rounds after ${matchId}`);
    
    if (matchId.startsWith('m')) {
        // Si c'est un match R16, réinitialiser TOUT ce qui suit
        const matchNum = matchId.replace('m', '');
        let qfMatch = null;
        
        // Trouver le QF correspondant
        if (matchNum === '1' || matchNum === '2') qfMatch = 'qf1';
        else if (matchNum === '3' || matchNum === '4') qfMatch = 'qf2';
        else if (matchNum === '5' || matchNum === '6') qfMatch = 'qf3';
        else if (matchNum === '7' || matchNum === '8') qfMatch = 'qf4';
        
        if (qfMatch) {
            predictions[qfMatch] = null;
            
            // Réinitialiser aussi les SF et Final qui dépendent
            if (qfMatch === 'qf1' || qfMatch === 'qf2') {
                predictions['sf1'] = null;
            }
            if (qfMatch === 'qf3' || qfMatch === 'qf4') {
                predictions['sf2'] = null;
            }
            predictions['final-winner'] = null;
        }
    } else if (matchId.startsWith('qf')) {
        // Si c'est un QF, réinitialiser SF et Final
        const qfNum = matchId.replace('qf', '');
        
        if (qfNum === '1' || qfNum === '2') {
            predictions['sf1'] = null;
        } else if (qfNum === '3' || qfNum === '4') {
            predictions['sf2'] = null;
        }
        predictions['final-winner'] = null;
    } else if (matchId.startsWith('sf')) {
        // Si c'est un SF, réinitialiser Final seulement
        predictions['final-winner'] = null;
    }
    
    // Forcer la mise à jour de l'interface
    updateQuarterFinals();
    updateSemiFinals();
    updateFinals();
    updateTeamStatuses();
}

// Initialize navigation
function initializeNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    // Mobile menu toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Update active link on click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (navLinks && window.innerWidth <= 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target) || 
                                mobileToggle.contains(event.target);
        
        if (!isClickInsideNav && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

// Toggle saved predictions panel
function toggleSavedPredictionsPanel() {
    const panel = document.getElementById('savedPredictionsPanel');
    panel.classList.toggle('active');
}

// Load saved predictions
function loadSavedPredictions() {
    console.log('Loading saved predictions');
    const savedList = document.getElementById('savedPredictionsList');
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    console.log('Current user ID:', userId);
    
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    console.log('User predictions found:', userPredictions.length);
    
    if (userPredictions.length === 0) {
        savedList.innerHTML = '<p class="text-center text-white/60 py-4">No saved predictions yet</p>';
        return;
    }
    
    savedList.innerHTML = '';
    
    userPredictions.forEach((prediction, index) => {
        const championTeam = allTeams.find(t => t.code === prediction.predictions['final-winner']);
        const date = new Date(prediction.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const predictionItem = document.createElement('div');
        predictionItem.className = 'prediction-item';
        predictionItem.innerHTML = `
            <div class="prediction-item-header">
                <span class="text-sm font-bold">Prediction #${index + 1}</span>
                <span class="text-xs text-white/60">${formattedDate}</span>
            </div>
            <div class="prediction-champion">
                <img src="${championTeam.flag}" alt="${championTeam.name} Flag" class="flag-icon" style="width: 20px; height: 15px;">
                <span class="font-bold text-[#D4AF37]">${championTeam.name}</span>
                <span class="ml-auto text-xs">🏆 Champion</span>
            </div>
            <div class="flex gap-2 mt-2">
                <button class="text-xs bg-[#00CC66] hover:bg-[#00b359] text-white px-3 py-1 rounded flex-1" onclick="loadUserPrediction(${index})">
                    <i class="fas fa-eye mr-1"></i> View
                </button>
                <button class="text-xs bg-[#c1272d] hover:bg-[#a02025] text-white px-3 py-1 rounded" onclick="deleteUserPrediction(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        savedList.appendChild(predictionItem);
    });
}

// Modifier loadUserPrediction pour visualisation seulement
function loadUserPrediction(index) {
    console.log('Loading user prediction at index:', index);
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    if (index >= 0 && index < userPredictions.length) {
        const savedPrediction = userPredictions[index];
        
        // Passer en mode lecture seule
        enableReadOnlyMode(savedPrediction.predictions);
        
        toggleSavedPredictionsPanel();
        
        alert('Prediction loaded in view-only mode. Click "Reset" to make new predictions.');
    } else {
        console.error('Invalid prediction index:', index);
    }
}

// Activer le mode lecture seule
function enableReadOnlyMode(savedPredictions) {
    isReadOnlyMode = true;
    
    // Désactiver tous les clics
    document.querySelectorAll('.team-box').forEach(box => {
        box.classList.add('locked');
        box.style.cursor = 'default';
        box.style.pointerEvents = 'none';
    });
    
    // Afficher les prédictions sauvegardées
    displaySavedPrediction(savedPredictions);
    
    // Désactiver les boutons de contrôle (sauf Reset)
    document.getElementById('saveBtn').disabled = true;
    document.getElementById('saveBtn').style.opacity = '0.5';
    document.getElementById('saveBtn').style.cursor = 'not-allowed';
    
    document.getElementById('shareBtn').disabled = true;
    document.getElementById('shareBtn').style.opacity = '0.5';
    document.getElementById('shareBtn').style.cursor = 'not-allowed';
    
    document.getElementById('cancelBtn').style.display = 'none';
    
    // Activer seulement le bouton Reset
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('resetBtn').style.opacity = '1';
    document.getElementById('resetBtn').style.cursor = 'pointer';
    
    // Mettre à jour la progression
    const completed = Object.values(savedPredictions).filter(p => p !== null).length;
    updateProgressDisplay(completed);
}

// Afficher une prédiction sauvegardée
function displaySavedPrediction(savedPredictions) {
    // Réinitialiser l'affichage
    resetAllPredictionsUI();
    
    // Appliquer les prédictions
    applySavedPredictionsToUI(savedPredictions);
    
    // Mettre à jour les statuts
    updateTeamStatuses();
}

// Appliquer les prédictions sauvegardées à l'UI
function applySavedPredictionsToUI(savedPredictions) {
    // 1. Round of 16
    for (let i = 1; i <= 8; i++) {
        const match = `m${i}`;
        const winner = savedPredictions[match];
        
        if (winner) {
            const winnerBox = document.querySelector(`[data-match="${match}"][data-team="${winner}"]`);
            if (winnerBox) {
                winnerBox.classList.add('selected', 'qualified');
                winnerBox.querySelector('.prediction-check')?.classList.remove('hidden');
            }
        }
    }
    
    // 2. Quarter Finals
    for (let i = 1; i <= 4; i++) {
        const qfMatch = `qf${i}`;
        const winner = savedPredictions[qfMatch];
        
        if (winner) {
            const [match1, match2] = matchMappings[qfMatch];
            const team1Code = savedPredictions[match1];
            const team2Code = savedPredictions[match2];
            
            if (team1Code && team2Code) {
                updateMatchDisplay(qfMatch, team1Code, team2Code);
                
                const winnerBox = document.querySelector(`[id^="${qfMatch}-team"][data-team="${winner}"]`);
                if (winnerBox) {
                    winnerBox.classList.add('selected', 'qualified');
                }
            }
        }
    }
    
    // 3. Semi Finals
    for (let i = 1; i <= 2; i++) {
        const sfMatch = `sf${i}`;
        const winner = savedPredictions[sfMatch];
        
        if (winner) {
            const [qf1, qf2] = matchMappings[sfMatch];
            const team1Code = savedPredictions[qf1];
            const team2Code = savedPredictions[qf2];
            
            if (team1Code && team2Code) {
                updateMatchDisplay(sfMatch, team1Code, team2Code);
                
                const winnerBox = document.querySelector(`[id^="${sfMatch}-team"][data-team="${winner}"]`);
                if (winnerBox) {
                    winnerBox.classList.add('selected', 'qualified');
                }
            }
        }
    }
    
    // 4. Final et Champion
    const champion = savedPredictions['final-winner'];
    if (champion) {
        const sf1Winner = savedPredictions['sf1'];
        const sf2Winner = savedPredictions['sf2'];
        
        if (sf1Winner && sf2Winner) {
            updateMatchDisplay('final-team1', sf1Winner, null);
            updateMatchDisplay('final-team2', sf2Winner, null);
            
            const championBox = document.getElementById('final-winner-box');
            if (championBox) {
                const team = allTeams.find(t => t.code === champion);
                championBox.innerHTML = `
                    <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
                    <span class="font-bold text-xl">${team.code}</span>
                    <span class="ml-auto text-sm text-[#D4AF37]">✓</span>
                `;
                championBox.classList.add('selected', 'qualified');
                championBox.dataset.team = champion;
                
                // Afficher le texte champion
                const championText = document.getElementById('championText');
                const championName = document.getElementById('championName');
                if (championText && championName) {
                    championName.textContent = team.name;
                    championText.classList.remove('hidden');
                }
            }
        }
    }
}

// Mettre à jour l'affichage de la progression
function updateProgressDisplay(completed) {
    const totalPredictions = 15;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        const percentage = (completed / totalPredictions) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${completed}/${totalPredictions}`;
    }
}

// Delete a saved prediction
function deleteUserPrediction(index) {
    console.log('Deleting user prediction at index:', index);
    
    if (!confirm('Are you sure you want to delete this prediction?')) {
        return;
    }
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    if (index >= 0 && index < userPredictions.length) {
        userPredictions.splice(index, 1);
        allPredictions[userId] = userPredictions;
        
        localStorage.setItem('afcon2025_all_predictions', JSON.stringify(allPredictions));
        loadSavedPredictions();
        alert('Prediction deleted successfully!');
    }
}

// Clear all saved predictions for current user
function clearAllSavedPredictions() {
    console.log('Clearing all saved predictions');
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    if (userPredictions.length === 0) {
        alert('No saved predictions to clear.');
        return;
    }
    
    if (confirm('Are you sure you want to clear ALL your saved predictions? This action cannot be undone.')) {
        allPredictions[userId] = [];
        localStorage.setItem('afcon2025_all_predictions', JSON.stringify(allPredictions));
        loadSavedPredictions();
        alert('All your saved predictions have been cleared.');
    }
}

// Initialize Round of 16 selections
function initializeRoundOf16() {
    console.log('Initializing Round of 16 selections');
    
    document.querySelectorAll('.team-box[data-match]').forEach(element => {
        element.addEventListener('click', function() {
            if (this.classList.contains('locked') || isReadOnlyMode) return;
            
            const match = this.getAttribute('data-match');
            const team = this.getAttribute('data-team');
            
            // Stocker la sélection en cours
            currentSelection = { match, teamCode: team, element: this };
            
            // Afficher le bouton Annuler
            document.getElementById('cancelBtn').style.display = 'flex';
            
            selectRoundOf16Winner(match, team, this);
        });
    });
    
    const finalWinnerBox = document.getElementById('final-winner-box');
    if (finalWinnerBox) {
        finalWinnerBox.addEventListener('click', function() {
            if (!this.classList.contains('locked') && !isReadOnlyMode) {
                currentSelection = { match: 'final-winner', teamCode: this.dataset.team, element: this };
                document.getElementById('cancelBtn').style.display = 'flex';
                selectChampion(this);
            }
        });
    }
    initializeThirdPlaceSelection();
}

// Fonction pour mettre à jour le statut des équipes
function updateTeamStatuses() {
    // Réinitialiser tous les statuts
    document.querySelectorAll('.team-box').forEach(box => {
        box.classList.remove('qualified', 'eliminated', 'selected-champion');
    });
    
    // Supprimer les anciens messages
    document.querySelectorAll('.qualified-status').forEach(el => {
        el.remove();
    });
    
    // 1. Round of 16
    for (let i = 1; i <= 8; i++) {
        const match = `m${i}`;
        const winner = predictions[match];
        
        if (winner) {
            // Marquer le gagnant (vert)
            const winnerBox = document.querySelector(`[data-match="${match}"][data-team="${winner}"]`);
            if (winnerBox) {
                winnerBox.classList.add('qualified');
                
                // Ajouter message "→ Qualified to QF"
                if (!isReadOnlyMode) {
                    const statusEl = document.createElement('div');
                    statusEl.className = 'qualified-status text-xs text-center text-[#00CC66] font-bold mb-1 mt-1';
                    statusEl.textContent = "→ Qualified to QF";
                    winnerBox.parentNode.insertBefore(statusEl, winnerBox);
                }
            }
            
            // Marquer le perdant (rouge)
            document.querySelectorAll(`[data-match="${match}"]`).forEach(box => {
                const teamCode = box.getAttribute('data-team');
                if (teamCode && teamCode !== winner) {
                    box.classList.add('eliminated');
                }
            });
        }
    }
    
    // 2. Quarter Finals
    for (let i = 1; i <= 4; i++) {
        const qfMatch = `qf${i}`;
        const winner = predictions[qfMatch];
        
        if (winner) {
            // Marquer le gagnant du QF (vert)
            const winnerBox = document.querySelector(`[data-team="${winner}"]`);
            if (winnerBox && winnerBox.id.startsWith('qf')) {
                winnerBox.classList.add('qualified');
                
                // Ajouter message "→ Qualified to SF"
                if (!isReadOnlyMode) {
                    const statusEl = document.createElement('div');
                    statusEl.className = 'qualified-status text-xs text-center text-[#00CC66] font-bold mb-1 mt-1';
                    statusEl.textContent = "→ Qualified to SF";
                    winnerBox.parentNode.insertBefore(statusEl, winnerBox);
                }
            }
            
            // Marquer le perdant du QF (rouge)
            document.querySelectorAll(`[id^="${qfMatch}-team"]`).forEach(box => {
                const teamCode = box.getAttribute('data-team');
                if (teamCode && teamCode !== winner) {
                    box.classList.add('eliminated');
                }
            });
        }
    }
    
    // 3. Semi Finals
    for (let i = 1; i <= 2; i++) {
        const sfMatch = `sf${i}`;
        const winner = predictions[sfMatch];
        
        if (winner) {
            // Marquer le gagnant du SF (vert)
            const winnerBox = document.querySelector(`[data-team="${winner}"]`);
            if (winnerBox && winnerBox.id.startsWith('sf')) {
                winnerBox.classList.add('qualified');
                
                // Ajouter message "→ Qualified to Final"
                if (!isReadOnlyMode) {
                    const statusEl = document.createElement('div');
                    statusEl.className = 'qualified-status text-xs text-center text-[#00CC66] font-bold mb-1 mt-1';
                    statusEl.textContent = "→ Qualified to Final";
                    winnerBox.parentNode.insertBefore(statusEl, winnerBox);
                }
            }
            
            // Marquer le perdant du SF (rouge)
            document.querySelectorAll(`[id^="${sfMatch}-team"]`).forEach(box => {
                const teamCode = box.getAttribute('data-team');
                if (teamCode && teamCode !== winner) {
                    box.classList.add('eliminated');
                }
            });
        }
    }
    
    // 4. Final et Champion
    const champion = predictions['final-winner'];
    const finalist1 = predictions['final-team1'];
    const finalist2 = predictions['final-team2'];
    
    // D'abord, marquer les deux finalistes comme qualifiés (verts)
    if (finalist1 && finalist2) {
        const finalist1Box = document.getElementById('final-team1');
        const finalist2Box = document.getElementById('final-team2');
        
        if (finalist1Box) {
            finalist1Box.classList.add('qualified');
        }
        if (finalist2Box) {
            finalist2Box.classList.add('qualified');
        }
        
        // Ensuite, si un champion est sélectionné
        if (champion) {
            // Marquer le champion (vert spécial)
            const championBox = document.getElementById('final-winner-box');
            if (championBox) {
                championBox.classList.add('qualified');
                
                // Ajouter message "🏆 CHAMPION"
                if (!isReadOnlyMode) {
                    const statusEl = document.createElement('div');
                    statusEl.className = 'qualified-status text-xs text-center text-[#D4AF37] font-bold mb-1 mt-1';
                    statusEl.textContent = "🏆 CHAMPION";
                    championBox.parentNode.insertBefore(statusEl, championBox);
                }
            }
            
            // Marquer le champion comme sélectionné
            const championElement = document.querySelector(`[data-team="${champion}"]`);
            if (championElement && (championElement.id === 'final-team1' || championElement.id === 'final-team2')) {
                championElement.classList.add('selected-champion');
            }
            
            // Marquer l'autre finaliste comme perdant (rouge)
            const loser = champion === finalist1 ? finalist2 : finalist1;
            const loserBox = document.querySelector(`[data-team="${loser}"]`);
            if (loserBox && (loserBox.id === 'final-team1' || loserBox.id === 'final-team2')) {
                loserBox.classList.remove('qualified');
                loserBox.classList.add('eliminated');
            }
        }
    }
    
    // 5. Troisième place
    const thirdTeam1 = document.getElementById('third-team1');
    const thirdTeam2 = document.getElementById('third-team2');
    
    if (thirdTeam1 && !thirdTeam1.classList.contains('empty-team')) {
        // C'est un perdant de SF, donc rouge
        thirdTeam1.classList.add('eliminated');
    }
    
    if (thirdTeam2 && !thirdTeam2.classList.contains('empty-team')) {
        // C'est un perdant de SF, donc rouge
        thirdTeam2.classList.add('eliminated');
    }
}

// Select winner in Round of 16
function selectRoundOf16Winner(match, teamCode, element) {
    console.log(`Selecting ${teamCode} as winner for ${match}`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions[match] = teamCode;
    
    // Update UI for this match
    document.querySelectorAll(`[data-match="${match}"]`).forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.prediction-check')?.classList.add('hidden');
    });
    
    element.classList.add('selected');
    element.querySelector('.prediction-check')?.classList.remove('hidden');
    
    // Update quarter finals
    updateQuarterFinals();
    
    // Mettre à jour les statuts
    updateTeamStatuses();
    
    updateProgress();
    
    // Cacher le bouton Annuler après sélection
    document.getElementById('cancelBtn').style.display = 'none';
    currentSelection = null;
}

// Update quarter finals based on R16 selections
function updateQuarterFinals() {
    console.log('Updating quarter finals');
    
    Object.keys(matchMappings).forEach(qfMatch => {
        if (qfMatch.startsWith('qf')) {
            const [match1, match2] = matchMappings[qfMatch];
            const team1Code = predictions[match1];
            const team2Code = predictions[match2];
            
            // NE PAS remplir le QF si un des R16 n'est pas encore décidé
            if (team1Code && team2Code) {
                // Les DEUX matches R16 sont terminés, on peut afficher le QF
                updateMatchDisplay(qfMatch, team1Code, team2Code);
                enableQuarterFinalSelection(qfMatch);
            } else {
                // Un des R16 n'est pas terminé, on affiche "Winner Mx"
                const qfTeam1 = document.getElementById(`${qfMatch}-team1`);
                const qfTeam2 = document.getElementById(`${qfMatch}-team2`);
                
                if (qfTeam1) {
                    qfTeam1.innerHTML = `
                        <div class="flag-placeholder"></div>
                        <span class="font-bold">Winner ${match1.toUpperCase()}</span>
                    `;
                    qfTeam1.classList.add('locked', 'empty-team');
                    qfTeam1.classList.remove('selected');
                }
                
                if (qfTeam2) {
                    qfTeam2.innerHTML = `
                        <div class="flag-placeholder"></div>
                        <span class="font-bold">Winner ${match2.toUpperCase()}</span>
                    `;
                    qfTeam2.classList.add('locked', 'empty-team');
                    qfTeam2.classList.remove('selected');
                }
                
                // Réinitialiser la prédiction QF si un R16 change
                predictions[qfMatch] = null;
            }
        }
    });
}

// Update match display with actual teams
function updateMatchDisplay(matchId, team1Code, team2Code) {
    const team1Box = document.getElementById(`${matchId}-team1`);
    const team2Box = document.getElementById(`${matchId}-team2`);
    
    if (team1Box && team1Code) {
        const team = allTeams.find(t => t.code === team1Code);
        updateTeamBox(team1Box, team);
    }
    
    if (team2Box && team2Code) {
        const team = allTeams.find(t => t.code === team2Code);
        updateTeamBox(team2Box, team);
    }
}

// Update a team box with team data
function updateTeamBox(box, team) {
    box.classList.remove('empty-team');
    box.innerHTML = `
        <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
        <span class="font-bold">${team.code}</span>
    `;
    
    box.dataset.team = team.code;
    
    // S'assurer que l'ID est correct pour les finales
    if (box.id === 'final-team1' || box.id === 'final-team2') {
        box.dataset.match = 'final';
        box.classList.add('finalist-ready');
        // Remove locked class for final teams to make them clickable
        box.classList.remove('locked');
        box.style.cursor = 'pointer';
        box.style.pointerEvents = 'auto';
    }
}

// Enable quarter final selection (make boxes clickable)
function enableQuarterFinalSelection(qfMatch) {
    const team1Box = document.getElementById(`${qfMatch}-team1`);
    const team2Box = document.getElementById(`${qfMatch}-team2`);
    
    if (team1Box && team2Box) {
        team1Box.classList.remove('locked');
        team2Box.classList.remove('locked');
        
        // Remove existing event listeners
        const newTeam1Box = team1Box.cloneNode(true);
        const newTeam2Box = team2Box.cloneNode(true);
        
        team1Box.parentNode.replaceChild(newTeam1Box, team1Box);
        team2Box.parentNode.replaceChild(newTeam2Box, team2Box);
        
        // Add click event listeners to new elements
        newTeam1Box.addEventListener('click', function() {
            if (isReadOnlyMode) return;
            currentSelection = { match: qfMatch, teamCode: this.dataset.team, element: this };
            document.getElementById('cancelBtn').style.display = 'flex';
            selectQuarterFinalWinner(qfMatch, this.dataset.team, this);
        });
        
        newTeam2Box.addEventListener('click', function() {
            if (isReadOnlyMode) return;
            currentSelection = { match: qfMatch, teamCode: this.dataset.team, element: this };
            document.getElementById('cancelBtn').style.display = 'flex';
            selectQuarterFinalWinner(qfMatch, this.dataset.team, this);
        });
    }
}

// Select winner in quarter finals
function selectQuarterFinalWinner(match, teamCode, element) {
    console.log(`Selecting ${teamCode} as winner for ${match}`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions[match] = teamCode;
    
    document.querySelectorAll(`[id^="${match}-team"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    updateSemiFinals();
    
    updateTeamStatuses();
    
    updateProgress();
    
    document.getElementById('cancelBtn').style.display = 'none';
    currentSelection = null;
}

// Update semi finals based on QF selections
function updateSemiFinals() {
    console.log('Updating semi finals');
    
    // SF1: Vérifier si QF1 et QF2 sont complétés
    const qf1Winner = predictions['qf1'];
    const qf2Winner = predictions['qf2'];
    
    if (qf1Winner && qf2Winner) {
        // Les DEUX QF sont terminés
        const team1 = allTeams.find(t => t.code === qf1Winner);
        const team2 = allTeams.find(t => t.code === qf2Winner);
        
        if (team1) {
            updateTeamBox(document.getElementById('sf1-team1'), team1);
        }
        
        if (team2) {
            updateTeamBox(document.getElementById('sf1-team2'), team2);
        }
        
        // Activer la sélection seulement si pas déjà sélectionné
        if (!predictions['sf1']) {
            enableSemiFinalSelection('sf1');
        }
    } else {
        // Un des QF n'est pas terminé
        const sf1Team1 = document.getElementById('sf1-team1');
        const sf1Team2 = document.getElementById('sf1-team2');
        
        if (sf1Team1) {
            sf1Team1.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-lg">Winner QF1</span>
            `;
            sf1Team1.classList.add('locked', 'empty-team');
            sf1Team1.classList.remove('selected', 'qualified', 'eliminated');
        }
        
        if (sf1Team2) {
            sf1Team2.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-lg">Winner QF2</span>
            `;
            sf1Team2.classList.add('locked', 'empty-team');
            sf1Team2.classList.remove('selected', 'qualified', 'eliminated');
        }
        
        // Réinitialiser la prédiction SF1 si un QF change
        predictions['sf1'] = null;
    }
    
    // SF2: Vérifier si QF3 et QF4 sont complétés
    const qf3Winner = predictions['qf3'];
    const qf4Winner = predictions['qf4'];
    
    if (qf3Winner && qf4Winner) {
        // Les DEUX QF sont terminés
        const team1 = allTeams.find(t => t.code === qf3Winner);
        const team2 = allTeams.find(t => t.code === qf4Winner);
        
        if (team1) {
            updateTeamBox(document.getElementById('sf2-team1'), team1);
        }
        
        if (team2) {
            updateTeamBox(document.getElementById('sf2-team2'), team2);
        }
        
        // Activer la sélection seulement si pas déjà sélectionné
        if (!predictions['sf2']) {
            enableSemiFinalSelection('sf2');
        }
    } else {
        // Un des QF n'est pas terminé
        const sf2Team1 = document.getElementById('sf2-team1');
        const sf2Team2 = document.getElementById('sf2-team2');
        
        if (sf2Team1) {
            sf2Team1.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-lg">Winner QF3</span>
            `;
            sf2Team1.classList.add('locked', 'empty-team');
            sf2Team1.classList.remove('selected', 'qualified', 'eliminated');
        }
        
        if (sf2Team2) {
            sf2Team2.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-lg">Winner QF4</span>
            `;
            sf2Team2.classList.add('locked', 'empty-team');
            sf2Team2.classList.remove('selected', 'qualified', 'eliminated');
        }
        
        // Réinitialiser la prédiction SF2 si un QF change
        predictions['sf2'] = null;
    }
    
    // Mettre à jour la Finale
    updateFinals();
}

// Fonction pour mettre à jour la 3ème place
function updateThirdPlace() {
    console.log('Updating third place');
    
    const sf1Winner = predictions['sf1'];
    const sf2Winner = predictions['sf2'];
    
    // Si les deux SF sont terminées
    if (sf1Winner && sf2Winner) {
        // Trouver le perdant de SF1
        const sf1Teams = matchMappings['sf1'];
        const sf1Team1 = predictions[sf1Teams[0]];
        const sf1Team2 = predictions[sf1Teams[1]];
        
        let thirdTeam1 = null;
        if (sf1Team1 && sf1Team2) {
            thirdTeam1 = (sf1Winner === sf1Team1) ? sf1Team2 : sf1Team1;
        }
        
        // Trouver le perdant de SF2
        const sf2Teams = matchMappings['sf2'];
        const sf2Team1 = predictions[sf2Teams[0]];
        const sf2Team2 = predictions[sf2Teams[1]];
        
        let thirdTeam2 = null;
        if (sf2Team1 && sf2Team2) {
            thirdTeam2 = (sf2Winner === sf2Team1) ? sf2Team2 : sf2Team1;
        }
        
        // Mettre à jour l'affichage de la 3ème place
        const thirdTeam1Box = document.getElementById('third-team1');
        const thirdTeam2Box = document.getElementById('third-team2');
        
        if (thirdTeam1 && thirdTeam1Box) {
            const team = allTeams.find(t => t.code === thirdTeam1);
            if (team) {
                thirdTeam1Box.innerHTML = `
                    <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
                    <span class="font-bold">${team.code}</span>
                `;
                thirdTeam1Box.classList.remove('locked', 'empty-team');
                thirdTeam1Box.dataset.team = team.code;
                thirdTeam1Box.classList.add('eliminated');
                
                predictions['third-team1'] = team.code;
            }
        }
        
        if (thirdTeam2 && thirdTeam2Box) {
            const team = allTeams.find(t => t.code === thirdTeam2);
            if (team) {
                thirdTeam2Box.innerHTML = `
                    <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
                    <span class="font-bold">${team.code}</span>
                `;
                thirdTeam2Box.classList.remove('locked', 'empty-team');
                thirdTeam2Box.dataset.team = team.code;
                thirdTeam2Box.classList.add('eliminated');
                
                predictions['third-team2'] = team.code;
            }
        }
    }
}

// Enable semi final selection
function enableSemiFinalSelection(sfMatch) {
    const team1Box = document.getElementById(`${sfMatch}-team1`);
    const team2Box = document.getElementById(`${sfMatch}-team2`);
    
    if (team1Box && team2Box) {
        team1Box.classList.remove('locked');
        team2Box.classList.remove('locked');
        
        const newTeam1Box = team1Box.cloneNode(true);
        const newTeam2Box = team2Box.cloneNode(true);
        
        team1Box.parentNode.replaceChild(newTeam1Box, team1Box);
        team2Box.parentNode.replaceChild(newTeam2Box, team2Box);
        
        newTeam1Box.addEventListener('click', function() {
            if (isReadOnlyMode) return;
            currentSelection = { match: sfMatch, teamCode: this.dataset.team, element: this };
            document.getElementById('cancelBtn').style.display = 'flex';
            selectSemiFinalWinner(sfMatch, this.dataset.team, this);
        });
        
        newTeam2Box.addEventListener('click', function() {
            if (isReadOnlyMode) return;
            currentSelection = { match: sfMatch, teamCode: this.dataset.team, element: this };
            document.getElementById('cancelBtn').style.display = 'flex';
            selectSemiFinalWinner(sfMatch, this.dataset.team, this);
        });
    }
}

// Select winner in semi finals
function selectSemiFinalWinner(match, teamCode, element) {
    console.log(`Selecting ${teamCode} as winner for ${match}`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions[match] = teamCode;
    
    document.querySelectorAll(`[id^="${match}-team"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    updateFinals();
    
    updateTeamStatuses();
    
    updateProgress();
    
    document.getElementById('cancelBtn').style.display = 'none';
    currentSelection = null;
}

// Version corrigée de makeFinalistsClickable
// Version corrigée de makeFinalistsClickable
function makeFinalistsClickable() {
    console.log('Making finalists clickable...');
    
    const finalTeam1 = document.getElementById('final-team1');
    const finalTeam2 = document.getElementById('final-team2');
    
    if (!finalTeam1 || !finalTeam2) {
        console.error('Final team boxes not found!');
        return;
    }
    
    // S'assurer que les boîtes ne sont pas locked
    finalTeam1.classList.remove('locked', 'empty-team');
    finalTeam2.classList.remove('locked', 'empty-team');
    
    // FORCER le curseur et pointer-events
    finalTeam1.style.cursor = 'pointer';
    finalTeam2.style.cursor = 'pointer';
    finalTeam1.style.pointerEvents = 'auto';
    finalTeam2.style.pointerEvents = 'auto';
    
    // Ajouter des classes pour le style
    finalTeam1.classList.add('champion-selectable', 'finalist-ready');
    finalTeam2.classList.add('champion-selectable', 'finalist-ready');
    
    // Ajouter un effet visuel au survol
    finalTeam1.addEventListener('mouseenter', function() {
        if (!isReadOnlyMode) {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
            this.style.borderColor = '#D4AF37';
            this.style.borderWidth = '3px';
            this.style.zIndex = '100';
        }
    });
    
    finalTeam1.addEventListener('mouseleave', function() {
        if (!isReadOnlyMode) {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '';
            this.style.borderWidth = '';
            this.style.zIndex = '';
        }
    });
    
    finalTeam2.addEventListener('mouseenter', function() {
        if (!isReadOnlyMode) {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
            this.style.borderColor = '#D4AF37';
            this.style.borderWidth = '3px';
            this.style.zIndex = '100';
        }
    });
    
    finalTeam2.addEventListener('mouseleave', function() {
        if (!isReadOnlyMode) {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '';
            this.style.borderWidth = '';
            this.style.zIndex = '';
        }
    });
    
    // Supprimer les anciens écouteurs (s'il y en a)
    finalTeam1.replaceWith(finalTeam1.cloneNode(true));
    finalTeam2.replaceWith(finalTeam2.cloneNode(true));
    
    // Récupérer les nouveaux éléments
    const newFinalTeam1 = document.getElementById('final-team1');
    const newFinalTeam2 = document.getElementById('final-team2');
    
    // Réappliquer les styles
    newFinalTeam1.style.cursor = 'pointer';
    newFinalTeam2.style.cursor = 'pointer';
    newFinalTeam1.style.pointerEvents = 'auto';
    newFinalTeam2.style.pointerEvents = 'auto';
    newFinalTeam1.classList.add('champion-selectable', 'finalist-ready');
    newFinalTeam2.classList.add('champion-selectable', 'finalist-ready');
    
    // AJOUTER LES ÉCOUTEURS DE CLIC
    newFinalTeam1.addEventListener('click', handleFinalistClick);
    newFinalTeam2.addEventListener('click', handleFinalistClick);
    
    console.log('Finalists are now clickable - Cursor should be pointer');
    
    // Ajouter un message d'aide
    showChampionHelpMessage();
}

// Fonction pour afficher un message d'aide
function showChampionHelpMessage() {
    const existingMessage = document.getElementById('champion-help-message');
    if (existingMessage) existingMessage.remove();
    
    setTimeout(() => {
        const helpMessage = document.createElement('div');
        helpMessage.id = 'champion-help-message';
        helpMessage.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: rgba(0,0,0,0.95); border: 3px solid #D4AF37;
                        border-radius: 10px; padding: 20px; z-index: 9999;
                        color: white; max-width: 400px; text-align: center;
                        box-shadow: 0 0 40px rgba(212, 175, 55, 0.5);">
                <h3 style="color: #D4AF37; font-size: 24px; margin-bottom: 15px;">🏆 SÉLECTIONNE TON CHAMPION</h3>
                <p style="margin-bottom: 10px;">Clique sur l'équipe que tu veux comme champion !</p>
                <p style="margin-bottom: 15px;">Le curseur devrait être <span style="color: #D4AF37; font-weight: bold">👉</span> quand tu passes sur une équipe.</p>
                <button onclick="document.getElementById('champion-help-message').remove()"
                        style="background: #00CC66; color: white; border: none;
                               padding: 10px 20px; border-radius: 5px; cursor: pointer;
                               font-weight: bold; margin-top: 10px;">
                    J'ai compris !
                </button>
            </div>
        `;
        document.body.appendChild(helpMessage);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            const msg = document.getElementById('champion-help-message');
            if (msg) msg.remove();
        }, 5000);
    }, 500);
}

// Nouvelle fonction pour gérer les clics sur les finalistes
function handleFinalistClick(event) {
    console.log('Finalist clicked!');
    
    if (isReadOnlyMode) {
        console.log('Read-only mode, ignoring click');
        return;
    }
    
    const element = event.currentTarget;
    const teamCode = element.dataset.team;
    
    if (!teamCode) {
        console.error('No team code found on clicked element');
        return;
    }
    
    console.log(`Selecting ${teamCode} as champion`);
    
    // Vérifier que c'est bien un finaliste
    const finalist1 = predictions['final-team1'];
    const finalist2 = predictions['final-team2'];
    
    if (teamCode !== finalist1 && teamCode !== finalist2) {
        console.error('Not a valid finalist:', teamCode);
        return;
    }
    
    // Stocker la sélection en cours
    currentSelection = { 
        match: 'final-winner', 
        teamCode: teamCode, 
        element: element 
    };
    
    // Afficher le bouton Annuler
    document.getElementById('cancelBtn').style.display = 'flex';
    
    // Sélectionner le champion
    selectChampion(element);
}

// Update finals based on SF selections
function updateFinals() {
    console.log('Updating finals');
    
    const sf1Winner = predictions['sf1'];
    const sf2Winner = predictions['sf2'];
    
    // Store who the finalists actually are
    if (sf1Winner) {
        predictions['final-team1'] = sf1Winner;
        const team = allTeams.find(t => t.code === sf1Winner);
        
        // METTRE À JOUR ET DÉBLOQUER final-team1
        const finalTeam1Box = document.getElementById('final-team1');
        if (finalTeam1Box && team) {
            updateTeamBox(finalTeam1Box, team);
            finalTeam1Box.classList.remove('locked', 'empty-team'); // ← IMPORTANT !
            finalTeam1Box.classList.add('finalist-ready');
        }
    }
    
    if (sf2Winner) {
        predictions['final-team2'] = sf2Winner;
        const team = allTeams.find(t => t.code === sf2Winner);
        
        // METTRE À JOUR ET DÉBLOQUER final-team2
        const finalTeam2Box = document.getElementById('final-team2');
        if (finalTeam2Box && team) {
            updateTeamBox(finalTeam2Box, team);
            finalTeam2Box.classList.remove('locked', 'empty-team'); // ← IMPORTANT !
            finalTeam2Box.classList.add('finalist-ready');
        }
    }
    
    // Enable final selection only if BOTH SF are done
    if (sf1Winner && sf2Winner) {
        // Mettre à jour la 3ème place
        updateThirdPlace();
        
        // Activer la sélection finale
        makeFinalistsClickable();
        
        // If champion already selected, make sure it's valid
        const currentChampion = predictions['final-winner'];
        if (currentChampion && currentChampion !== sf1Winner && currentChampion !== sf2Winner) {
            // Champion n'est plus valide (a changé)
            predictions['final-winner'] = null;
            
            // Reset champion box
            const finalWinnerBox = document.getElementById('final-winner-box');
            if (finalWinnerBox) {
                finalWinnerBox.innerHTML = `
                    <div class="flag-placeholder"></div>
                    <span id="final-winner" class="font-bold text-xl">Clique sur une équipe</span>
                    <span class="ml-auto text-lg text-[#D4AF37]">👑</span>
                `;
                finalWinnerBox.classList.remove('selected', 'champion');
                finalWinnerBox.classList.add('empty-team');
                finalWinnerBox.style.cursor = 'pointer';
                finalWinnerBox.style.border = '3px dashed #D4AF37';
                finalWinnerBox.style.animation = 'borderPulse 2s infinite';
                
                // Hide champion text
                const championText = document.getElementById('championText');
                if (championText) {
                    championText.classList.add('hidden');
                }
            }
        }
    } else {
        // Une des SF n'est pas terminée - REMETTRE locked et empty-team
        const finalTeam1Box = document.getElementById('final-team1');
        const finalTeam2Box = document.getElementById('final-team2');
        
        if (finalTeam1Box && !sf1Winner) {
            finalTeam1Box.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-xl">Winner SF1</span>
            `;
            finalTeam1Box.classList.add('locked', 'empty-team');
            finalTeam1Box.classList.remove('selected', 'qualified', 'eliminated', 'finalist-ready');
            finalTeam1Box.removeAttribute('data-team');
        }
        
        if (finalTeam2Box && !sf2Winner) {
            finalTeam2Box.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold text-xl">Winner SF2</span>
            `;
            finalTeam2Box.classList.add('locked', 'empty-team');
            finalTeam2Box.classList.remove('selected', 'qualified', 'eliminated', 'finalist-ready');
            finalTeam2Box.removeAttribute('data-team');
        }
        
        // Désactiver la sélection
        disableFinalSelection();
        
        // Réinitialiser la 3ème place
        const thirdTeam1 = document.getElementById('third-team1');
        const thirdTeam2 = document.getElementById('third-team2');
        
        if (thirdTeam1) {
            thirdTeam1.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold">Loser SF1</span>
            `;
            thirdTeam1.classList.add('locked', 'empty-team');
            thirdTeam1.classList.remove('eliminated', 'third-place-ready');
        }
        
        if (thirdTeam2) {
            thirdTeam2.innerHTML = `
                <div class="flag-placeholder"></div>
                <span class="font-bold">Loser SF2</span>
            `;
            thirdTeam2.classList.add('locked', 'empty-team');
            thirdTeam2.classList.remove('eliminated', 'third-place-ready');
        }
    }
}

// Désactiver la sélection finale
function disableFinalSelection() {
    const finalTeam1 = document.getElementById('final-team1');
    const finalTeam2 = document.getElementById('final-team2');
    const finalWinnerBox = document.getElementById('final-winner-box');
    
    if (finalTeam1) {
        finalTeam1.classList.add('locked');
        finalTeam1.style.cursor = 'default';
        finalTeam1.style.pointerEvents = 'none';
    }
    
    if (finalTeam2) {
        finalTeam2.classList.add('locked');
        finalTeam2.style.cursor = 'default';
        finalTeam2.style.pointerEvents = 'none';
    }
    
    if (finalWinnerBox) {
        finalWinnerBox.classList.add('locked', 'empty-team');
        finalWinnerBox.innerHTML = `
            <div class="flag-placeholder"></div>
            <span id="final-winner" class="font-bold text-xl">Select Champion</span>
        `;
        finalWinnerBox.classList.remove('selected');
        finalWinnerBox.removeAttribute('data-team');
        finalWinnerBox.style.cursor = 'default';
        finalWinnerBox.style.pointerEvents = 'none';
    }
    
    // Cacher le texte champion
    const championText = document.getElementById('championText');
    if (championText) {
        championText.classList.add('hidden');
    }
}

// Select champion - VERSION CORRIGÉE ET SIMPLIFIÉE
function selectChampion(element) {
    if (!element || !element.dataset || isReadOnlyMode) {
        console.error('Invalid element or read-only mode');
        return;
    }
    
    const teamCode = element.dataset.team;
    console.log(`Selecting ${teamCode} as champion`);
    
    const team = allTeams.find(t => t.code === teamCode);
    if (!team) {
        console.error('Team not found:', teamCode);
        return;
    }
    
    // Vérifier que c'est un finaliste valide
    const finalist1 = predictions['final-team1'];
    const finalist2 = predictions['final-team2'];
    
    if (teamCode !== finalist1 && teamCode !== finalist2) {
        alert('Vous ne pouvez sélectionner que les équipes finalistes !');
        return;
    }
    
    predictions['final-winner'] = teamCode;
    
    // Mettre à jour la boîte champion
    const finalWinnerBox = document.getElementById('final-winner-box');
    if (finalWinnerBox) {
        finalWinnerBox.innerHTML = `
            <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
            <span class="font-bold text-xl">${team.code}</span>
            <span class="ml-auto text-2xl">🏆</span>
        `;
        finalWinnerBox.classList.add('selected', 'champion');
        finalWinnerBox.dataset.team = teamCode;
        finalWinnerBox.classList.remove('locked', 'empty-team');
        finalWinnerBox.style.cursor = 'default';
        finalWinnerBox.style.animation = 'championGlow 2s infinite alternate';
    }
    
    // Mettre en évidence l'équipe sélectionnée
    element.classList.add('selected-champion', 'champion');
    
    // Marquer l'autre finaliste comme perdant
    const otherFinalistCode = teamCode === finalist1 ? finalist2 : finalist1;
    const otherFinalistBox = document.querySelector(`[data-team="${otherFinalistCode}"]`);
    if (otherFinalistBox && (otherFinalistBox.id === 'final-team1' || otherFinalistBox.id === 'final-team2')) {
        otherFinalistBox.classList.remove('qualified');
        otherFinalistBox.classList.add('eliminated');
    }
    
    // Afficher le texte champion
    const championText = document.getElementById('championText');
    const championName = document.getElementById('championName');
    if (championText && championName) {
        championName.textContent = team.name;
        championText.classList.remove('hidden');
    }
    
    updateTeamStatuses();
    updateProgress();
    
    // Cacher le bouton Annuler
    document.getElementById('cancelBtn').style.display = 'none';
    currentSelection = null;
    
    // Animation de confirmation
    if (element.style) {
        element.style.animation = 'championGlow 2s infinite alternate';
    }
    
    // Message de confirmation
    const confirmation = document.createElement('div');
    confirmation.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.9); color: #D4AF37; padding: 20px; 
                    border-radius: 10px; border: 3px solid #D4AF37; z-index: 9999;
                    text-align: center; animation: fadeIn 0.5s;">
            <h3 style="font-size: 24px; margin-bottom: 10px;">🎉 CHAMPION SÉLECTIONNÉ !</h3>
            <p style="font-size: 18px;">${team.name} est ton champion pour l'AFCON 2025 !</p>
            <button onclick="this.parentElement.remove()" 
                    style="margin-top: 15px; background: #00CC66; color: white; 
                           border: none; padding: 10px 20px; border-radius: 5px; 
                           cursor: pointer;">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(confirmation);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        if (confirmation.parentNode) {
            confirmation.parentNode.removeChild(confirmation);
        }
    }, 3000);
}

// Update progress bar
function updateProgress() {
    const totalPredictions = 15;
    let completed = Object.values(predictions).filter(p => p !== null).length;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        const percentage = (completed / totalPredictions) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${completed}/${totalPredictions}`;
    }
    
    if (completed === totalPredictions) {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.classList.add('save-animation');
            setTimeout(() => {
                saveBtn.classList.remove('save-animation');
            }, 500);
        }
    }
}

// Ajouter cette fonction pour sélectionner le gagnant de la 3ème place
function selectThirdPlaceWinner() {
    const thirdTeam1 = document.getElementById('third-team1');
    const thirdTeam2 = document.getElementById('third-team2');
    
    if (thirdTeam1 && thirdTeam2 && !thirdTeam1.classList.contains('empty-team') && !thirdTeam2.classList.contains('empty-team')) {
        // Demander à l'utilisateur de sélectionner
        const team1Code = thirdTeam1.dataset.team;
        const team2Code = thirdTeam2.dataset.team;
        
        const team1 = allTeams.find(t => t.code === team1Code);
        const team2 = allTeams.find(t => t.code === team2Code);
        
        const choice = confirm(`Sélectionner le gagnant pour la 3ème place:\n\n${team1.name} (OK)\nOU\n${team2.name} (Annuler)`);
        
        const winnerCode = choice ? team1Code : team2Code;
        const winnerTeam = allTeams.find(t => t.code === winnerCode);
        
        // Mettre à jour l'affichage
        if (choice) {
            thirdTeam1.classList.add('third-place-winner');
            thirdTeam2.classList.add('eliminated');
        } else {
            thirdTeam2.classList.add('third-place-winner');
            thirdTeam1.classList.add('eliminated');
        }
        
        // Stocker la prédiction
        predictions['third-place-winner'] = winnerCode;
        
        updateProgress();
        
        alert(`✅ ${winnerTeam.name} sélectionné pour la 3ème place !`);
    }
}

// Ajouter des écouteurs d'événements pour la 3ème place
function initializeThirdPlaceSelection() {
    const thirdTeam1 = document.getElementById('third-team1');
    const thirdTeam2 = document.getElementById('third-team2');
    
    if (thirdTeam1 && thirdTeam2) {
        // Créer de nouveaux éléments pour éviter les conflits
        const newThirdTeam1 = thirdTeam1.cloneNode(true);
        const newThirdTeam2 = thirdTeam2.cloneNode(true);
        
        thirdTeam1.parentNode.replaceChild(newThirdTeam1, thirdTeam1);
        thirdTeam2.parentNode.replaceChild(newThirdTeam2, thirdTeam2);
        
        // Ajouter les écouteurs
        newThirdTeam1.addEventListener('click', function() {
            if (!this.classList.contains('empty-team') && !isReadOnlyMode) {
                selectThirdPlaceWinner();
            }
        });
        
        newThirdTeam2.addEventListener('click', function() {
            if (!this.classList.contains('empty-team') && !isReadOnlyMode) {
                selectThirdPlaceWinner();
            }
        });
    }
}

// Save predictions
function savePredictions() {
    if (isReadOnlyMode) {
        alert('You are in view-only mode. Click "Reset" to make new predictions.');
        return;
    }
    
    console.log('Saving predictions');
    
    const completed = Object.values(predictions).filter(p => p !== null).length;
    if (completed < 15) {
        alert(`Please complete all predictions before saving (${completed}/15 completed).`);
        return;
    }
    
    const data = {
        predictions: predictions,
        timestamp: new Date().toISOString(),
        champion: predictions['final-winner'] ? 
            allTeams.find(t => t.code === predictions['final-winner']).name : 'Not selected'
    };
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    } else {
        if (confirm('Please sign in to save your predictions! Would you like to sign in now?')) {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
            }
        }
        return;
    }
    
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    userPredictions.unshift(data);
    
    if (userPredictions.length > 10) {
        userPredictions.length = 10;
    }
    
    allPredictions[userId] = userPredictions;
    localStorage.setItem('afcon2025_all_predictions', JSON.stringify(allPredictions));
    
    loadSavedPredictions();
    
    alert('Predictions saved successfully!');
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.add('save-animation');
        setTimeout(() => saveBtn.classList.remove('save-animation'), 500);
    }
}

// Reset all predictions UI
function resetAllPredictionsUI() {
    console.log('Resetting predictions UI');
    
    // Quitter le mode lecture seule
    isReadOnlyMode = false;
    
    Object.keys(predictions).forEach(key => {
        predictions[key] = null;
    });
    
    document.querySelectorAll('.team-box').forEach(box => {
        box.classList.remove('selected', 'qualified', 'eliminated', 'locked', 'selected-champion', 'champion-selectable', 'finalist-ready');
        box.style.cursor = 'pointer';
        box.style.pointerEvents = 'auto';
        box.style.transform = '';
        box.style.boxShadow = '';
        box.style.borderColor = '';
        box.style.borderWidth = '';
        box.querySelector('.prediction-check')?.classList.add('hidden');
        
        // Supprimer les couronnes de hover
        const crowns = box.querySelectorAll('.hover-crown');
        crowns.forEach(crown => crown.remove());
    });
    
    // Reset R16 boxes
    document.querySelectorAll('.team-box[data-match^="m"]').forEach(box => {
        const match = box.dataset.match;
        const team = box.dataset.team;
        const teamData = allTeams.find(t => t.code === team);
        if (teamData) {
            box.innerHTML = `
                <img src="${teamData.flag}" alt="${teamData.name} Flag" class="flag-icon">
                <span class="font-bold">${teamData.code}</span>
                <span class="ml-auto text-xs text-[#00CC66] hidden prediction-check">✓</span>
            `;
        }
    });
    
    // Reset quarter finals
    document.querySelectorAll('.team-box[id^="qf"]').forEach(box => {
        box.classList.add('locked', 'empty-team');
        const matchId = box.id.split('-')[0];
        const teamNumber = box.id.includes('team1') ? '1' : '2';
        const matchNumber = matchId.replace('qf', '');
        const r16Match = `m${matchNumber}${teamNumber}`;
        box.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Winner ${r16Match.toUpperCase()}</span>
        `;
        box.removeAttribute('data-team');
        box.style.cursor = 'default';
        box.style.pointerEvents = 'none';
    });
    
    // Reset semi finals
    document.querySelectorAll('.team-box[id^="sf"]').forEach(box => {
        box.classList.add('locked', 'empty-team');
        box.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold ${box.id.includes('sf1') || box.id.includes('sf2') ? 'text-lg' : ''}">${box.id.includes('team1') ? 'Winner QF1' : 'Winner QF2'}</span>
        `;
        box.removeAttribute('data-team');
        box.style.cursor = 'default';
        box.style.pointerEvents = 'none';
    });
    
    // Reset finals
    const finalTeam1 = document.getElementById('final-team1');
    if (finalTeam1) {
        finalTeam1.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold text-xl">Winner SF1</span>
        `;
        finalTeam1.classList.add('locked', 'empty-team');
        finalTeam1.removeAttribute('data-team');
        finalTeam1.style.cursor = 'default';
        finalTeam1.style.pointerEvents = 'none';
        
        // Supprimer les écouteurs d'événements
        const newFinalTeam1 = finalTeam1.cloneNode(true);
        finalTeam1.parentNode.replaceChild(newFinalTeam1, finalTeam1);
    }
    
    const finalTeam2 = document.getElementById('final-team2');
    if (finalTeam2) {
        finalTeam2.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold text-xl">Winner SF2</span>
        `;
        finalTeam2.classList.add('locked', 'empty-team');
        finalTeam2.removeAttribute('data-team');
        finalTeam2.style.cursor = 'default';
        finalTeam2.style.pointerEvents = 'none';
        
        // Supprimer les écouteurs d'événements
        const newFinalTeam2 = finalTeam2.cloneNode(true);
        finalTeam2.parentNode.replaceChild(newFinalTeam2, finalTeam2);
    }
    
    // Reset champion
    const finalWinnerBox = document.getElementById('final-winner-box');
    if (finalWinnerBox) {
        finalWinnerBox.innerHTML = `
            <div class="flag-placeholder"></div>
            <span id="final-winner" class="font-bold text-xl">Select Champion</span>
        `;
        finalWinnerBox.classList.add('locked', 'empty-team');
        finalWinnerBox.classList.remove('selected', 'champion');
        finalWinnerBox.removeAttribute('data-team');
        finalWinnerBox.style.cursor = 'default';
        finalWinnerBox.style.pointerEvents = 'none';
        finalWinnerBox.style.animation = '';
    }
    
    // Reset third place
    const thirdTeam1 = document.getElementById('third-team1');
    if (thirdTeam1) {
        thirdTeam1.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Loser SF1</span>
        `;
        thirdTeam1.classList.add('locked', 'empty-team');
        thirdTeam1.style.cursor = 'default';
        thirdTeam1.style.pointerEvents = 'none';
    }
    
    const thirdTeam2 = document.getElementById('third-team2');
    if (thirdTeam2) {
        thirdTeam2.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Loser SF2</span>
        `;
        thirdTeam2.classList.add('locked', 'empty-team');
        thirdTeam2.style.cursor = 'default';
        thirdTeam2.style.pointerEvents = 'none';
    }
    
    // Hide champion text
    const championText = document.getElementById('championText');
    if (championText) {
        championText.classList.add('hidden');
    }
    
    // Supprimer tous les messages
    document.querySelectorAll('.qualified-status').forEach(el => {
        el.remove();
    });
    
    // Réactiver les boutons
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('saveBtn').style.opacity = '1';
    document.getElementById('saveBtn').style.cursor = 'pointer';
    
    document.getElementById('shareBtn').disabled = false;
    document.getElementById('shareBtn').style.opacity = '1';
    document.getElementById('shareBtn').style.cursor = 'pointer';
    
    // Cacher le bouton Annuler
    document.getElementById('cancelBtn').style.display = 'none';
    currentSelection = null;
    
    // Réinitialiser les listeners
    initializeRoundOf16();
}

// Reset all predictions
function resetAllPredictions() {
    if (confirm('Are you sure you want to reset all predictions?')) {
        resetAllPredictionsUI();
        updateProgress();
        alert('All predictions have been reset. You can now make new predictions.');
    }
}

// Share predictions
function sharePredictions() {
    if (isReadOnlyMode) {
        alert('You are in view-only mode. Click "Reset" to make new predictions.');
        return;
    }
    
    const champion = predictions['final-winner'] ? 
        allTeams.find(t => t.code === predictions['final-winner']).name : 'Not selected yet';
    
    let shareText = `My AFCON 2025 Predictions:\n\n`;
    shareText += `🏆 Champion: ${champion}\n\n`;
    
    // Ajouter Round of 16
    shareText += `Round of 16:\n`;
    for (let i = 1; i <= 8; i++) {
        const winner = predictions[`m${i}`];
        if (winner) {
            const winnerTeam = allTeams.find(t => t.code === winner);
            shareText += `  Match ${i}: ${winnerTeam.name} wins\n`;
        }
    }
    
    // Ajouter Quarter Finals
    shareText += `\nQuarter Finals:\n`;
    for (let i = 1; i <= 4; i++) {
        const winner = predictions[`qf${i}`];
        if (winner) {
            const winnerTeam = allTeams.find(t => t.code === winner);
            shareText += `  QF${i}: ${winnerTeam.name} advances\n`;
        }
    }
    
    // Ajouter Semi Finals
    shareText += `\nSemi Finals:\n`;
    for (let i = 1; i <= 2; i++) {
        const winner = predictions[`sf${i}`];
        if (winner) {
            const winnerTeam = allTeams.find(t => t.code === winner);
            shareText += `  SF${i}: ${winnerTeam.name} to Final\n`;
        }
    }
    
    shareText += `\nMake your predictions: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My AFCON 2025 Predictions',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Predictions copied to clipboard! You can now share them.');
        }).catch(() => {
            prompt('Copy your predictions:', shareText);
        });
    }
}

// ========================================
// USER PROFILE MANAGEMENT
// ========================================

// Update profile display function
function updateProfileDisplay() {
    console.log('Updating profile display');
    
    const profileMiniAvatar = document.getElementById('profileMiniAvatar');
    const profileMiniName = document.getElementById('profileMiniName');
    const profileMiniCountry = document.getElementById('profileMiniCountry');
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    const adminIndicator = document.getElementById('adminIndicator');
    
    if (adminSession && adminSession.loggedIn) {
        const displayName = adminSession.username;
        const avatarSeed = displayName.toLowerCase().replace(/\s/g, '');
        
        if (profileMiniAvatar) {
            profileMiniAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=D4AF37`;
            profileMiniAvatar.style.cursor = 'pointer';
        }
        if (profileMiniName) {
            profileMiniName.textContent = `${displayName} (Admin)`;
            profileMiniName.style.cursor = 'pointer';
        }
        if (profileMiniCountry) {
            profileMiniCountry.textContent = "Administrator";
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Admin Logout';
            profileMiniBtn.className = 'auth-btn bg-gradient-to-r from-[#D4AF37] to-[#b8942a]';
        }
        
        if (adminIndicator) {
            adminIndicator.style.display = 'block';
        }
        
    } else if (userProfile) {
        const avatarSeed = userProfile.avatarSeed;
        
        if (profileMiniAvatar) {
            profileMiniAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=00CC66`;
            profileMiniAvatar.style.cursor = 'pointer';
        }
        if (profileMiniName) {
            profileMiniName.textContent = userProfile.name;
            profileMiniName.style.cursor = 'pointer';
        }
        if (profileMiniCountry) {
            profileMiniCountry.textContent = userProfile.country;
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            profileMiniBtn.className = 'auth-btn';
        }
        
        if (adminIndicator) {
            adminIndicator.style.display = 'none';
        }
        
    } else {
        if (profileMiniAvatar) {
            profileMiniAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66';
            profileMiniAvatar.style.cursor = 'pointer';
        }
        if (profileMiniName) {
            profileMiniName.textContent = 'Guest';
            profileMiniName.style.cursor = 'pointer';
        }
        if (profileMiniCountry) {
            profileMiniCountry.textContent = 'Sign in';
        }
        if (profileMiniBtn) {
            profileMiniBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            profileMiniBtn.className = 'auth-btn';
        }
        
        if (adminIndicator) {
            adminIndicator.style.display = 'none';
        }
    }
}

// ========================================
// PROFILE HISTORY POPUP MANAGEMENT
// ========================================

// Function to open profile history popup
function openProfileHistory() {
    const profileHistoryOverlay = document.getElementById('profileHistoryOverlay');
    const profileHistoryContent = document.getElementById('profileHistoryContent');
    
    if (!profileHistoryOverlay || !profileHistoryContent) return;
    
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const allUsers = JSON.parse(localStorage.getItem('afcon2025_all_users')) || [];
    
    let currentUserData = null;
    if (userProfile) {
        currentUserData = allUsers.find(user => 
            user.name === userProfile.name && user.country === userProfile.country
        );
    }
    
    const historyItems = [];
    
    const userHistory = JSON.parse(localStorage.getItem(`afcon2025_user_history_${userProfile ? userProfile.avatarSeed : 'guest'}`)) || [];
    
    if (userHistory.length === 0 && currentUserData) {
        historyItems.push({
            type: 'registration',
            title: 'Account Created',
            description: `Welcome to AFCON 2025 Hub, ${currentUserData.name}!`,
            date: new Date(currentUserData.registrationDate),
            icon: 'fa-user-plus',
            points: 0,
            action: 'signup'
        });
        
        if (currentUserData.loginCount > 1) {
            for (let i = 1; i <= Math.min(currentUserData.loginCount, 5); i++) {
                const loginDate = new Date(currentUserData.registrationDate);
                loginDate.setDate(loginDate.getDate() + i);
                
                historyItems.push({
                    type: 'login',
                    title: 'Login Session',
                    description: 'Signed in to your account',
                    date: loginDate,
                    icon: 'fa-sign-in-alt',
                    points: 0,
                    action: 'login'
                });
            }
        }
    } else {
        historyItems.push(...userHistory);
    }
    
    const today = new Date().toDateString();
    const hasTodayLogin = historyItems.some(item => 
        new Date(item.date).toDateString() === today && item.action === 'login'
    );
    
    if (!hasTodayLogin && userProfile) {
        historyItems.push({
            type: 'login',
            title: 'Current Session',
            description: 'Currently signed in',
            date: new Date(),
            icon: 'fa-user-check',
            points: 0,
            action: 'login'
        });
    }
    
    historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const registrations = historyItems.filter(item => item.action === 'signup').length;
    const logins = historyItems.filter(item => item.action === 'login').length;
    const totalSessions = registrations + logins;
    
    let contentHTML = '';
    
    contentHTML += `
        <div class="user-profile-summary">
            <img src="${userProfile ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}&backgroundColor=00CC66` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=00CC66'}" 
                 alt="Profile" 
                 class="profile-history-avatar">
            <div class="profile-info">
                <h3>${userProfile ? userProfile.name : 'Guest User'}</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 10px;">
                    ${userProfile ? `From ${userProfile.country}` : 'Sign in to track your history'}
                    ${userProfile && userProfile.favoriteTeam ? ` | Supports ${userProfile.favoriteTeam}` : ''}
                </p>
                <div class="profile-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Joined: ${userProfile ? new Date(userProfile.loginDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Sessions: ${totalSessions}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentHTML += `
        <div class="history-stats">
            <div class="stat-card-history">
                <div class="stat-value-history">${registrations}</div>
                <div class="stat-label-history">Registrations</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${logins}</div>
                <div class="stat-label-history">Login Sessions</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${totalSessions}</div>
                <div class="stat-label-history">Total Sessions</div>
            </div>
            <div class="stat-card-history">
                <div class="stat-value-history">${userProfile ? 'Active' : 'Guest'}</div>
                <div class="stat-label-history">Account Status</div>
            </div>
        </div>
    `;
    
    contentHTML += `
        <div class="history-section-title">
            <i class="fas fa-history"></i> Connection History
        </div>
    `;
    
    if (historyItems.length > 0) {
        contentHTML += `<div class="history-list">`;
        
        const connectionHistory = historyItems.filter(item => 
            item.action === 'signup' || item.action === 'login'
        );
        
        if (connectionHistory.length > 0) {
            connectionHistory.forEach((item, index) => {
                const isRegistration = item.action === 'signup';
                
                contentHTML += `
                    <div class="history-item" style="border-left: 4px solid ${isRegistration ? '#00CC66' : '#D4AF37'}">
                        <div class="history-item-icon" style="background: ${isRegistration ? 'rgba(0, 204, 102, 0.2)' : 'rgba(212, 175, 55, 0.2)'}; color: ${isRegistration ? '#00CC66' : '#D4AF37'}">
                            <i class="fas ${item.icon}"></i>
                        </div>
                        <div class="history-item-content">
                            <div class="history-item-title">${item.title}</div>
                            <div class="history-item-desc">${item.description}</div>
                            <div class="history-item-meta">
                                <div class="history-item-date">
                                    <i class="far fa-clock"></i>
                                    ${new Date(item.date).toLocaleDateString('en-US', { 
                                        weekday: 'long',
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}                                <div class="history-item-points" style="color: ${isRegistration ? '#00CC66' : '#D4AF37'}">
                                    <i class="fas ${isRegistration ? 'fa-user-plus' : 'fa-sign-in-alt'}"></i>
                                    ${isRegistration ? 'Registration' : 'Login'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            contentHTML += `
                <div class="no-history">
                    <i class="fas fa-user-clock"></i>
                    <h4>No Connection History</h4>
                    <p>Sign in or register to start tracking your sessions</p>
                </div>
            `;
        }
        
        contentHTML += `</div>`;
    } else {
        contentHTML += `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <h4>No Connection History</h4>
                <p>Your registration and login history will appear here</p>
                ${!userProfile ? `
                    <a href="javascript:void(0)" onclick="document.getElementById('loginModal').classList.add('active'); closeProfileHistory();" 
                       class="bg-gradient-to-r from-[#00CC66] to-[#00994d] hover:from-[#00b359] hover:to-[#008040] text-white px-6 py-3 rounded-lg font-bold mt-4 inline-block">
                        <i class="fas fa-user-plus"></i> Register Now
                    </a>
                ` : ''}
            </div>
        `;
    }
    
    profileHistoryContent.innerHTML = contentHTML;
    
    profileHistoryOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Function to save user history when they register or login
function saveUserHistory(action, userName, userCountry) {
    if (!userName || !userCountry) return;
    
    const avatarSeed = userName.toLowerCase().replace(/\s/g, '');
    const userHistoryKey = `afcon2025_user_history_${avatarSeed}`;
    const userHistory = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
    
    const historyEntry = {
        type: action === 'signup' ? 'registration' : 'login',
        title: action === 'signup' ? 'Account Created' : 'Login Session',
        description: action === 'signup' 
            ? `Welcome to AFCON 2025 Hub, ${userName}!` 
            : 'Signed in to your account',
        date: new Date().toISOString(),
        icon: action === 'signup' ? 'fa-user-plus' : 'fa-sign-in-alt',
        points: 0,
        action: action
    };
    
    if (action === 'signup') {
        const existingRegistration = userHistory.find(item => 
            item.action === 'signup' && 
            item.title === 'Account Created'
        );
        
        if (!existingRegistration) {
            userHistory.push(historyEntry);
        }
    } else {
        const today = new Date().toDateString();
        const todayLogin = userHistory.find(item => 
            item.action === 'login' && 
            new Date(item.date).toDateString() === today
        );
        
        if (!todayLogin) {
            userHistory.push(historyEntry);
        }
    }
    
    const sortedHistory = userHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedHistory = sortedHistory.slice(0, 20);
    
    localStorage.setItem(userHistoryKey, JSON.stringify(limitedHistory));
}

// Function to close profile history popup
function closeProfileHistory() {
    const profileHistoryOverlay = document.getElementById('profileHistoryOverlay');
    if (profileHistoryOverlay) {
        profileHistoryOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize profile history functionality
function initProfileHistory() {
    const profileAvatar = document.getElementById('profileMiniAvatar');
    const profileName = document.getElementById('profileMiniName');
    const closeBtn = document.getElementById('closeHistoryPopup');
    
    if (profileAvatar) {
        profileAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    if (profileName) {
        profileName.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileHistory);
    }
    
    const overlay = document.getElementById('profileHistoryOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProfileHistory();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProfileHistory();
        }
    });
}

// Logout user
function logoutUser() {
    if (confirm('Are you sure you want to sign out?')) {
        const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
        
        if (adminSession && adminSession.loggedIn) {
            localStorage.removeItem('afcon2025_admin_session');
            alert('Admin logged out successfully.');
        } else {
            localStorage.removeItem('afcon2025_user_profile');
            userProfile = null;
            alert('You have been signed out successfully.');
        }
        
        updateProfileDisplay();
        loadSavedPredictions();
    }
}

// Check admin session
function checkAdminSession() {
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    return adminSession && adminSession.loggedIn;
}

// Handle admin login from main form
function handleAdminLogin(username, password) {
    if (adminLoginAttempts >= MAX_ADMIN_ATTEMPTS) {
        alert('Too many failed attempts. Admin access is temporarily locked.');
        return false;
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        adminLoginAttempts = 0;
        
        const adminSession = {
            loggedIn: true,
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: 'afcon_admin_' + Date.now()
        };
        
        localStorage.setItem('afcon2025_admin_session', JSON.stringify(adminSession));
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
        }
        
        alert('Admin login successful!');
        
        updateProfileDisplay();
        
        return true;
    } else {
        adminLoginAttempts++;
        
        const remaining = MAX_ADMIN_ATTEMPTS - adminLoginAttempts;
        alert(`Invalid admin credentials! ${remaining} attempt(s) remaining.`);
        
        if (adminLoginAttempts >= MAX_ADMIN_ATTEMPTS) {
            alert('Admin access locked for 5 minutes due to too many failed attempts.');
            setTimeout(() => {
                adminLoginAttempts = 0;
                alert('Admin login is now unlocked. You can try again.');
            }, 5 * 60 * 1000);
        }
        
        return false;
    }
}

// Function to track user in statistics
function trackUserInStatistics(userName, userCountry, favoriteTeam) {
    const allUsers = JSON.parse(localStorage.getItem('afcon2025_all_users')) || [];
    
    const existingUserIndex = allUsers.findIndex(user => 
        user.name.toLowerCase() === userName.toLowerCase() && 
        user.country === userCountry
    );
    
    if (existingUserIndex === -1) {
        const newUser = {
            name: userName,
            country: userCountry,
            favoriteTeam: favoriteTeam,
            avatarSeed : userName.toLowerCase().replace(/\s/g, ''),
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            isAdmin: false
        };
        allUsers.push(newUser);
        
        saveUserHistory('signup', userName, userCountry);
        
    } else {
        allUsers[existingUserIndex].lastLogin = new Date().toISOString();
        allUsers[existingUserIndex].loginCount = (allUsers[existingUserIndex].loginCount || 0) + 1;
        
        saveUserHistory('login', userName, userCountry);
    }
    
    localStorage.setItem('afcon2025_all_users', JSON.stringify(allUsers));
}

// Initialize user management
function initializeUserManagement() {
    console.log('Initializing user management');
    
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    const loginModal = document.getElementById('loginModal');
    
    if (profileMiniBtn) {
        profileMiniBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (userProfile || checkAdminSession()) {
                logoutUser();
            } else {
                if (loginModal) {
                    loginModal.classList.add('active');
                }
            }
        });
    }
    
    const profileMiniAvatar = document.getElementById('profileMiniAvatar');
    if (profileMiniAvatar) {
        profileMiniAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (loginModal) {
                loginModal.classList.add('active');
            }
        });
    }
    
    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
    
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('userName').value;
            const userCountry = document.getElementById('userCountrySelect').value;
            const userPassword = document.getElementById('userPassword').value;
            const favoriteTeam = document.getElementById('userFavoriteTeam').value;
            
            if (!userName || !userCountry) {
                alert('Please enter your name and select your country.');
                return;
            }
            
            if (userName.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() && 
                userPassword === ADMIN_CREDENTIALS.password) {
                
                handleAdminLogin(userName, userPassword);
                this.reset();
                return;
            }
            
            const existingProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
            const isNewUser = !existingProfile || 
                             (existingProfile.name !== userName || 
                              existingProfile.country !== userCountry);
            
            userProfile = {
                name: userName,
                country: userCountry,
                password: userPassword,
                favoriteTeam: favoriteTeam,
                avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
                loginDate: new Date().toISOString()
            };
            
            localStorage.setItem('afcon2025_user_profile', JSON.stringify(userProfile));
            
            updateProfileDisplay();
            
            if (loginModal) {
                loginModal.classList.remove('active');
            }
            
            this.reset();
            
            if (isNewUser) {
                alert(`Welcome to AFCON 2025 Hub, ${userName}! Your account has been created.`);
            } else {
                alert(`Welcome back, ${userName}! You're now signed in.`);
            }
            
            trackUserInStatistics(userName, userCountry, favoriteTeam);
            
            loadSavedPredictions();
        });
    }
}

// ========================================
// ERROR HANDLING
// ========================================
// Fonction pour debugger le curseur
function debugCursor() {
    const finalTeam1 = document.getElementById('final-team1');
    const finalTeam2 = document.getElementById('final-team2');
    
    console.log('=== DEBUG CURSEUR ===');
    console.log('final-team1:');
    console.log('- Classe:', finalTeam1.className);
    console.log('- Style cursor:', finalTeam1.style.cursor);
    console.log('- Style pointer-events:', finalTeam1.style.pointerEvents);
    console.log('- Computed cursor:', window.getComputedStyle(finalTeam1).cursor);
    console.log('- Computed pointer-events:', window.getComputedStyle(finalTeam1).pointerEvents);
    
    console.log('final-team2:');
    console.log('- Classe:', finalTeam2.className);
    console.log('- Style cursor:', finalTeam2.style.cursor);
    console.log('- Style pointer-events:', finalTeam2.style.pointerEvents);
    console.log('- Computed cursor:', window.getComputedStyle(finalTeam2).cursor);
    console.log('- Computed pointer-events:', window.getComputedStyle(finalTeam2).pointerEvents);
    console.log('=== FIN DEBUG ===');
}


// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    console.error('At:', e.filename, 'line', e.lineno);
});

// Log script initialization
console.log('Predictor script loaded successfully');
console.log(debugCursor())