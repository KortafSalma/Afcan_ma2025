// ALL AFCON 2025 TEAMS
// Update Flags//
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
//Update Flags Can2025.ma

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
    document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
    document.getElementById('resetBtn').addEventListener('click', resetAllPredictions);
    document.getElementById('shareBtn').addEventListener('click', sharePredictions);
    
    // Navigation functionality
    initializeNavigation();
    
    // Screenshot modal events
    document.getElementById('downloadScreenshot').addEventListener('click', downloadScreenshot);
    document.getElementById('shareScreenshot').addEventListener('click', shareScreenshot);
    document.getElementById('closeScreenshot').addEventListener('click', () => {
        document.getElementById('screenshotModal').classList.remove('active');
    });
    
    // Saved predictions panel events
    document.getElementById('savedPredictionsToggle').addEventListener('click', toggleSavedPredictionsPanel);
    document.getElementById('closeSavedPanel').addEventListener('click', toggleSavedPredictionsPanel);
    document.getElementById('clearAllPredictions').addEventListener('click', clearAllSavedPredictions);
    
    console.log('Predictor initialized successfully');
});

// Initialize navigation
function initializeNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    // Mobile menu toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            navLinks.classList.toggle('active');
            
            // Change icon
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
            // Update active class
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            if (navLinks && window.innerWidth <= 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                // Reset icon
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            
            // Get the target section
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
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target) || 
                                mobileToggle.contains(event.target);
        
        if (!isClickInsideNav && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            // Reset icon
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Close mobile menu on window resize (if resized to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            // Reset icon
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
    
    // Get current user
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    // Determine user ID
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    console.log('Current user ID:', userId);
    
    // Get user's saved predictions
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

// Load a saved prediction
function loadUserPrediction(index) {
    console.log('Loading user prediction at index:', index);
    
    // Get current user
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    // Determine user ID
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    }
    
    // Get user's saved predictions
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    const userPredictions = allPredictions[userId] || [];
    
    if (index >= 0 && index < userPredictions.length) {
        const savedPrediction = userPredictions[index];
        predictions = {...savedPrediction.predictions};
        
        // Update UI with loaded prediction
        resetAllPredictionsUI();
        applyPredictionsToUI();
        updateProgress();
        
        // Close panel
        toggleSavedPredictionsPanel();
        
        alert('Prediction loaded successfully!');
    } else {
        console.error('Invalid prediction index:', index);
    }
}

// Delete a saved prediction
function deleteUserPrediction(index) {
    console.log('Deleting user prediction at index:', index);
    
    if (!confirm('Are you sure you want to delete this prediction?')) {
        return;
    }
    
    // Get current user
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    // Determine user ID
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
    
    // Get current user
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    // Determine user ID
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

// Apply predictions to UI
function applyPredictionsToUI() {
    console.log('Applying predictions to UI');
    
    // Apply R16 predictions
    Object.keys(predictions).forEach(key => {
        if (key.startsWith('m')) {
            const teamCode = predictions[key];
            if (teamCode) {
                const teamBox = document.querySelector(`[data-match="${key}"][data-team="${teamCode}"]`);
                if (teamBox) {
                    selectRoundOf16Winner(key, teamCode, teamBox);
                }
            }
        }
    });
    
    // Apply QF predictions
    ['qf1', 'qf2', 'qf3', 'qf4'].forEach(qfMatch => {
        const winnerCode = predictions[qfMatch];
        if (winnerCode) {
            const winnerBox = document.querySelector(`[id^="${qfMatch}-team"][data-team="${winnerCode}"]`);
            if (winnerBox) {
                selectQuarterFinalWinner(qfMatch, winnerCode, winnerBox);
            }
        }
    });
    
    // Apply SF predictions
    ['sf1', 'sf2'].forEach(sfMatch => {
        const winnerCode = predictions[sfMatch];
        if (winnerCode) {
            const winnerBox = document.querySelector(`[id^="${sfMatch}-team"][data-team="${winnerCode}"]`);
            if (winnerBox) {
                selectSemiFinalWinner(sfMatch, winnerCode, winnerBox);
            }
        }
    });
    
    // Apply final champion
    const championCode = predictions['final-winner'];
    if (championCode) {
        const championBox = document.querySelector(`[data-team="${championCode}"]`);
        if (championBox) {
            selectChampion(championBox);
        }
    }
}

// Initialize Round of 16 selections
function initializeRoundOf16() {
    console.log('Initializing Round of 16 selections');
    
    document.querySelectorAll('.team-box[data-match]').forEach(element => {
        element.addEventListener('click', function() {
            if (this.classList.contains('locked')) return;
            
            const match = this.getAttribute('data-match');
            const team = this.getAttribute('data-team');
            selectRoundOf16Winner(match, team, this);
        });
    });
    
    // Initialize final winner selection
    const finalWinnerBox = document.getElementById('final-winner-box');
    if (finalWinnerBox) {
        finalWinnerBox.addEventListener('click', function() {
            if (!this.classList.contains('locked')) {
                selectChampion(this);
            }
        });
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
    
    updateProgress();
}

// Update quarter finals based on R16 selections
function updateQuarterFinals() {
    console.log('Updating quarter finals');
    
    // Update each quarter final match
    Object.keys(matchMappings).forEach(qfMatch => {
        if (qfMatch.startsWith('qf')) {
            const [match1, match2] = matchMappings[qfMatch];
            const team1Code = predictions[match1];
            const team2Code = predictions[match2];
            
            updateMatchDisplay(qfMatch, team1Code, team2Code);
            
            // If both teams are selected, make QF match clickable
            if (team1Code && team2Code) {
                enableQuarterFinalSelection(qfMatch);
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
    
    // Store team data
    box.dataset.team = team.code;
    box.dataset.match = box.id.split('-')[0];
}

// Enable quarter final selection (make boxes clickable)
function enableQuarterFinalSelection(qfMatch) {
    const team1Box = document.getElementById(`${qfMatch}-team1`);
    const team2Box = document.getElementById(`${qfMatch}-team2`);
    
    if (team1Box && team2Box) {
        // Remove locked class
        team1Box.classList.remove('locked');
        team2Box.classList.remove('locked');
        
        // Add click event listeners
        team1Box.addEventListener('click', function() {
            selectQuarterFinalWinner(qfMatch, this.dataset.team, this);
        });
        
        team2Box.addEventListener('click', function() {
            selectQuarterFinalWinner(qfMatch, this.dataset.team, this);
        });
    }
}

// Select winner in quarter finals
function selectQuarterFinalWinner(match, teamCode, element) {
    console.log(`Selecting ${teamCode} as winner for ${match}`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions[match] = teamCode;
    
    // Update UI for this match
    document.querySelectorAll(`[id^="${match}-team"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    // Update semi finals
    updateSemiFinals();
    
    updateProgress();
}

// Update semi finals based on QF selections
function updateSemiFinals() {
    console.log('Updating semi finals');
    
    // Update SF1
    const qf1Winner = predictions['qf1'];
    const qf2Winner = predictions['qf2'];
    
    if (qf1Winner) {
        const team = allTeams.find(t => t.code === qf1Winner);
        updateTeamBox(document.getElementById('sf1-team1'), team);
    }
    
    if (qf2Winner) {
        const team = allTeams.find(t => t.code === qf2Winner);
        updateTeamBox(document.getElementById('sf1-team2'), team);
    }
    
    // Update SF2
    const qf3Winner = predictions['qf3'];
    const qf4Winner = predictions['qf4'];
    
    if (qf3Winner) {
        const team = allTeams.find(t => t.code === qf3Winner);
        updateTeamBox(document.getElementById('sf2-team1'), team);
    }
    
    if (qf4Winner) {
        const team = allTeams.find(t => t.code === qf4Winner);
        updateTeamBox(document.getElementById('sf2-team2'), team);
    }
    
    // Enable SF selection if both teams are available
    if (qf1Winner && qf2Winner) {
        enableSemiFinalSelection('sf1');
    }
    
    if (qf3Winner && qf4Winner) {
        enableSemiFinalSelection('sf2');
    }
    
    // Update finals
    updateFinals();
}

// Enable semi final selection
function enableSemiFinalSelection(sfMatch) {
    const team1Box = document.getElementById(`${sfMatch}-team1`);
    const team2Box = document.getElementById(`${sfMatch}-team2`);
    
    if (team1Box && team2Box) {
        team1Box.classList.remove('locked');
        team2Box.classList.remove('locked');
        
        team1Box.addEventListener('click', function() {
            selectSemiFinalWinner(sfMatch, this.dataset.team, this);
        });
        
        team2Box.addEventListener('click', function() {
            selectSemiFinalWinner(sfMatch, this.dataset.team, this);
        });
    }
}

// Select winner in semi finals
function selectSemiFinalWinner(match, teamCode, element) {
    console.log(`Selecting ${teamCode} as winner for ${match}`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions[match] = teamCode;
    
    // Update UI for this match
    document.querySelectorAll(`[id^="${match}-team"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    // Update finals
    updateFinals();
    
    updateProgress();
}

// Update finals based on SF selections
function updateFinals() {
    console.log('Updating finals');
    
    const sf1Winner = predictions['sf1'];
    const sf2Winner = predictions['sf2'];
    
    // Update final teams
    if (sf1Winner) {
        const team = allTeams.find(t => t.code === sf1Winner);
        updateTeamBox(document.getElementById('final-team1'), team);
    }
    
    if (sf2Winner) {
        const team = allTeams.find(t => t.code === sf2Winner);
        updateTeamBox(document.getElementById('final-team2'), team);
    }
    
    // Update third place teams
    if (sf1Winner) {
        // Find loser of SF1
        const sf1Teams = matchMappings['sf1'].map(qf => predictions[qf]);
        const sf1Loser = sf1Teams.find(teamCode => teamCode && teamCode !== sf1Winner);
        if (sf1Loser) {
            const team = allTeams.find(t => t.code === sf1Loser);
            updateTeamBox(document.getElementById('third-team1'), team);
        }
    }
    
    if (sf2Winner) {
        // Find loser of SF2
        const sf2Teams = matchMappings['sf2'].map(qf => predictions[qf]);
        const sf2Loser = sf2Teams.find(teamCode => teamCode && teamCode !== sf2Winner);
        if (sf2Loser) {
            const team = allTeams.find(t => t.code === sf2Loser);
            updateTeamBox(document.getElementById('third-team2'), team);
        }
    }
    
    // Enable final selection if both finalists are available
    if (sf1Winner && sf2Winner) {
        enableFinalSelection();
    }
}

// Enable final selection
function enableFinalSelection() {
    const finalTeam1 = document.getElementById('final-team1');
    const finalTeam2 = document.getElementById('final-team2');
    const finalWinnerBox = document.getElementById('final-winner-box');
    
    if (finalTeam1 && finalTeam2) {
        finalTeam1.classList.remove('locked');
        finalTeam2.classList.remove('locked');
        
        // Make final teams clickable for champion selection
        finalTeam1.addEventListener('click', function() {
            selectChampion(this);
        });
        
        finalTeam2.addEventListener('click', function() {
            selectChampion(this);
        });
        
        // Also make champion box clickable
        if (finalWinnerBox) {
            finalWinnerBox.classList.remove('locked');
            finalWinnerBox.classList.remove('empty-team');
        }
    }
}

// Select champion
function selectChampion(element) {
    const teamCode = element.dataset.team;
    if (!teamCode) return;
    
    console.log(`Selecting ${teamCode} as champion`);
    
    const team = allTeams.find(t => t.code === teamCode);
    predictions['final-winner'] = teamCode;
    
    // Update champion box
    const finalWinnerBox = document.getElementById('final-winner-box');
    finalWinnerBox.innerHTML = `
        <img src="${team.flag}" alt="${team.name} Flag" class="flag-icon">
        <span class="font-bold text-xl">${team.code}</span>
        <span class="ml-auto text-sm text-[#D4AF37]">✓</span>
    `;
    finalWinnerBox.classList.add('selected');
    
    // Show champion text
    const championText = document.getElementById('championText');
    const championName = document.getElementById('championName');
    if (championText && championName) {
        championName.textContent = team.name;
        championText.classList.remove('hidden');
    }
    
    updateProgress();
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

// Save predictions
function savePredictions() {
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
    
    // Get current user
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    
    // Determine user ID
    let userId = 'guest';
    if (userProfile) {
        userId = userProfile.avatarSeed;
    } else if (adminSession && adminSession.loggedIn) {
        userId = adminSession.username.toLowerCase();
    } else {
        // Guest users need to sign in
        if (confirm('Please sign in to save your predictions! Would you like to sign in now?')) {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
            }
        }
        return;
    }
    
    // Get all predictions
    const allPredictions = JSON.parse(localStorage.getItem('afcon2025_all_predictions')) || {};
    
    // Get user's predictions
    const userPredictions = allPredictions[userId] || [];
    
    // Add new prediction
    userPredictions.unshift(data);
    
    // Keep only last 10 predictions
    if (userPredictions.length > 10) {
        userPredictions.length = 10;
    }
    
    // Save back to all predictions
    allPredictions[userId] = userPredictions;
    localStorage.setItem('afcon2025_all_predictions', JSON.stringify(allPredictions));
    
    // Update saved predictions list
    loadSavedPredictions();
    
    alert('Predictions saved successfully!');
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.add('save-animation');
        setTimeout(() => saveBtn.classList.remove('save-animation'), 500);
    }
}

// Reset all predictions UI (without confirmation)
function resetAllPredictionsUI() {
    console.log('Resetting predictions UI');
    
    // Reset predictions object
    Object.keys(predictions).forEach(key => {
        predictions[key] = null;
    });
    
    // Reset all team boxes
    document.querySelectorAll('.team-box').forEach(box => {
        box.classList.remove('selected');
        box.classList.remove('locked');
        box.querySelector('.prediction-check')?.classList.add('hidden');
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
    
    // Reset quarter finals to empty
    document.querySelectorAll('.team-box[id^="qf"]').forEach(box => {
        box.classList.add('locked');
        box.classList.add('empty-team');
        const matchId = box.id.split('-')[0];
        const teamNumber = box.id.includes('team1') ? '1' : '2';
        const matchNumber = matchId.replace('qf', '');
        const r16Match = `m${matchNumber}${teamNumber}`;
        box.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Winner ${r16Match.toUpperCase()}</span>
        `;
    });
    
    // Reset semi finals
    document.querySelectorAll('.team-box[id^="sf"]').forEach(box => {
        box.classList.add('locked');
        box.classList.add('empty-team');
        box.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold ${box.id.includes('sf1') || box.id.includes('sf2') ? 'text-lg' : ''}">${box.id.includes('team1') ? 'Winner QF1' : 'Winner QF2'}</span>
        `;
    });
    
    // Reset finals
    const finalTeam1 = document.getElementById('final-team1');
    if (finalTeam1) {
        finalTeam1.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold text-xl">Winner SF1</span>
        `;
        finalTeam1.classList.add('locked', 'empty-team');
    }
    
    const finalTeam2 = document.getElementById('final-team2');
    if (finalTeam2) {
        finalTeam2.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold text-xl">Winner SF2</span>
        `;
        finalTeam2.classList.add('locked', 'empty-team');
    }
    
    // Reset champion
    const finalWinnerBox = document.getElementById('final-winner-box');
    if (finalWinnerBox) {
        finalWinnerBox.innerHTML = `
            <div class="flag-placeholder"></div>
            <span id="final-winner" class="font-bold text-xl">Select Champion</span>
        `;
        finalWinnerBox.classList.add('locked', 'empty-team');
        finalWinnerBox.classList.remove('selected');
    }
    
    // Reset third place
    const thirdTeam1 = document.getElementById('third-team1');
    if (thirdTeam1) {
        thirdTeam1.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Loser SF1</span>
        `;
        thirdTeam1.classList.add('locked', 'empty-team');
    }
    
    const thirdTeam2 = document.getElementById('third-team2');
    if (thirdTeam2) {
        thirdTeam2.innerHTML = `
            <div class="flag-placeholder"></div>
            <span class="font-bold">Loser SF2</span>
        `;
        thirdTeam2.classList.add('locked', 'empty-team');
    }
    
    // Hide champion text
    const championText = document.getElementById('championText');
    if (championText) {
        championText.classList.add('hidden');
    }
    
    // Reinitialize event listeners
    initializeRoundOf16();
}

// Reset all predictions
function resetAllPredictions() {
    if (confirm('Are you sure you want to reset all predictions?')) {
        resetAllPredictionsUI();
        updateProgress();
        alert('All predictions have been reset.');
    }
}

// Share predictions
function sharePredictions() {
    const champion = predictions['final-winner'] ? 
        allTeams.find(t => t.code === predictions['final-winner']).name : 'Not selected yet';
    
    let shareText = `My AFCON 2025 Predictions:\n\n`;
    shareText += `🏆 Champion: ${champion}\n\n`;
    
    const finalist1 = predictions['final-team1'] ? 
        allTeams.find(t => t.code === predictions['final-team1']).name : 'TBD';
    const finalist2 = predictions['final-team2'] ? 
        allTeams.find(t => t.code === predictions['final-team2']).name : 'TBD';
    
    shareText += `Final: ${finalist1} vs ${finalist2}\n\n`;
    shareText += `Make your predictions: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My AFCON 2025 Predictions',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Predictions copied to clipboard!');
        }).catch(() => {
            prompt('Copy your predictions:', shareText);
        });
    }
}

// Take screenshot
function takeScreenshot() {
    const completed = Object.values(predictions).filter(p => p !== null).length;
    if (completed < 15) {
        alert(`Please complete all predictions before taking a screenshot (${completed}/15 completed).`);
        return;
    }
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    // Hide control panels and navigation for clean screenshot
    const elementsToHide = [
        document.querySelector('.fixed.top-20.right-4'),
        document.querySelector('.fixed.top-16'),
        document.querySelector('.nav-container'),
        document.querySelector('.saved-predictions-toggle')
    ];
    
    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Add watermark text
    const watermark = document.createElement('div');
    watermark.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999;">
            AFCON 2025 Predictor • ${window.location.href}
        </div>
    `;
    document.body.appendChild(watermark);
    
    // Capture the bracket
    html2canvas(document.getElementById('bracketContainer'), {
        backgroundColor: '#1a0f0f',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
    }).then(canvas => {
        // Restore hidden elements
        elementsToHide.forEach(el => {
            if (el) el.style.display = '';
        });
        
        if (document.body.contains(watermark)) {
            document.body.removeChild(watermark);
        }
        
        // Show screenshot in modal
        const screenshotImage = document.getElementById('screenshotImage');
        const screenshotModal = document.getElementById('screenshotModal');
        
        if (screenshotImage) {
            screenshotImage.src = canvas.toDataURL('image/png');
        }
        
        if (screenshotModal) {
            screenshotModal.classList.add('active');
        }
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        
        // Store canvas for download
        window.screenshotCanvas = canvas;
    }).catch(error => {
        console.error('Screenshot error:', error);
        alert('Error creating screenshot. Please try again.');
        
        // Restore hidden elements
        elementsToHide.forEach(el => {
            if (el) el.style.display = '';
        });
        
        if (document.body.contains(watermark)) {
            document.body.removeChild(watermark);
        }
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    });
}

// Download screenshot
function downloadScreenshot() {
    if (!window.screenshotCanvas) return;
    
    const link = document.createElement('a');
    link.download = `afcon-2025-predictions-${Date.now()}.png`;
    link.href = window.screenshotCanvas.toDataURL('image/png');
    link.click();
}

// Share screenshot
function shareScreenshot() {
    if (!window.screenshotCanvas) return;
    
    window.screenshotCanvas.toBlob(blob => {
        const file = new File([blob], 'afcon-predictions.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'My AFCON 2025 Predictions',
                text: 'Check out my AFCON 2025 tournament predictions!'
            }).catch(console.error);
        } else {
            alert('Sharing screenshots is not supported on this device/browser. You can download and share the image manually.');
        }
    }, 'image/png');
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
        // Admin is logged in
        const displayName = adminSession.username;
        const avatarSeed = displayName.toLowerCase().replace(/\s/g, '');
        
        // Update mini profile
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
        
        // Show admin indicator
        if (adminIndicator) {
            adminIndicator.style.display = 'block';
        }
        
    } else if (userProfile) {
        // Regular user is logged in
        const avatarSeed = userProfile.avatarSeed;
        
        // Update mini profile
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
        
        // Hide admin indicator
        if (adminIndicator) {
            adminIndicator.style.display = 'none';
        }
        
    } else {
        // No one is logged in
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
        
        // Hide admin indicator
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
    
    // Get user data
    const userProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
    const allUsers = JSON.parse(localStorage.getItem('afcon2025_all_users')) || [];
    
    // Find current user in all users
    let currentUserData = null;
    if (userProfile) {
        currentUserData = allUsers.find(user => 
            user.name === userProfile.name && user.country === userProfile.country
        );
    }
    
    // Prepare history items
    const historyItems = [];
    
    // 1. Get user's actual history from storage (including registrations and logins)
    const userHistory = JSON.parse(localStorage.getItem(`afcon2025_user_history_${userProfile ? userProfile.avatarSeed : 'guest'}`)) || [];
    
    // If no history exists, create it from current data
    if (userHistory.length === 0 && currentUserData) {
        // Add initial registration
        historyItems.push({
            type: 'registration',
            title: 'Account Created',
            description: `Welcome to AFCON 2025 Hub, ${currentUserData.name}!`,
            date: new Date(currentUserData.registrationDate),
            icon: 'fa-user-plus',
            points: 0,
            action: 'signup'
        });
        
        // Add recent logins
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
        // Use existing history
        historyItems.push(...userHistory);
    }
    
    // 2. Add current login if not already in history
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
    
    // Sort history by date (newest first)
    historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate stats
    const registrations = historyItems.filter(item => item.action === 'signup').length;
    const logins = historyItems.filter(item => item.action === 'login').length;
    const totalSessions = registrations + logins;
    
    // Build popup content
    let contentHTML = '';
    
    // User profile summary
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
    
    // Stats section
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
    
    // History section
    contentHTML += `
        <div class="history-section-title">
            <i class="fas fa-history"></i> Connection History
        </div>
    `;
    
    if (historyItems.length > 0) {
        contentHTML += `<div class="history-list">`;
        
        // Show only registration and login history (no predictions)
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
                                    })}
                                </div>
                                <div class="history-item-points" style="color: ${isRegistration ? '#00CC66' : '#D4AF37'}">
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
    
    // Update content
    profileHistoryContent.innerHTML = contentHTML;
    
    // Show popup
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
    
    // Check if this registration already exists
    if (action === 'signup') {
        const existingRegistration = userHistory.find(item => 
            item.action === 'signup' && 
            item.title === 'Account Created'
        );
        
        if (!existingRegistration) {
            userHistory.push(historyEntry);
        }
    } else {
        // For logins, only add if not already logged in today
        const today = new Date().toDateString();
        const todayLogin = userHistory.find(item => 
            item.action === 'login' && 
            new Date(item.date).toDateString() === today
        );
        
        if (!todayLogin) {
            userHistory.push(historyEntry);
        }
    }
    
    // Keep only last 20 entries
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
    // Add event listener to profile avatar and name
    const profileAvatar = document.getElementById('profileMiniAvatar');
    const profileName = document.getElementById('profileMiniName');
    const closeBtn = document.getElementById('closeHistoryPopup');
    
    // Open popup when clicking on profile avatar
    if (profileAvatar) {
        profileAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    // Open popup when clicking on profile name
    if (profileName) {
        profileName.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProfileHistory();
        });
    }
    
    // Close popup when clicking close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileHistory);
    }
    
    // Close popup when clicking outside
    const overlay = document.getElementById('profileHistoryOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProfileHistory();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProfileHistory();
        }
    });
}

// Logout user
function logoutUser() {
    if (confirm('Are you sure you want to sign out?')) {
        // Check if it's admin
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
        loadSavedPredictions(); // Reload predictions (will show empty for guest)
    }
}

// Check admin session
function checkAdminSession() {
    const adminSession = JSON.parse(localStorage.getItem('afcon2025_admin_session'));
    return adminSession && adminSession.loggedIn;
}

// Handle admin login from main form
function handleAdminLogin(username, password) {
    // Check login attempts
    if (adminLoginAttempts >= MAX_ADMIN_ATTEMPTS) {
        alert('Too many failed attempts. Admin access is temporarily locked.');
        return false;
    }
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Successful login
        adminLoginAttempts = 0;
        
        // Create admin session
        const adminSession = {
            loggedIn: true,
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: 'afcon_admin_' + Date.now()
        };
        
        localStorage.setItem('afcon2025_admin_session', JSON.stringify(adminSession));
        
        // Hide any open modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
        }
        
        alert('Admin login successful!');
        
        // Update profile display
        updateProfileDisplay();
        
        return true;
    } else {
        // Failed login
        adminLoginAttempts++;
        
        const remaining = MAX_ADMIN_ATTEMPTS - adminLoginAttempts;
        alert(`Invalid admin credentials! ${remaining} attempt(s) remaining.`);
        
        // Lock if max attempts reached
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
    
    // Check if user already exists
    const existingUserIndex = allUsers.findIndex(user => 
        user.name.toLowerCase() === userName.toLowerCase() && 
        user.country === userCountry
    );
    
    if (existingUserIndex === -1) {
        // Add new user (registration)
        const newUser = {
            name: userName,
            country: userCountry,
            favoriteTeam: favoriteTeam,
            avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            isAdmin: false
        };
        allUsers.push(newUser);
        
        // Save registration history
        saveUserHistory('signup', userName, userCountry);
        
    } else {
        // Update existing user (login)
        allUsers[existingUserIndex].lastLogin = new Date().toISOString();
        allUsers[existingUserIndex].loginCount = (allUsers[existingUserIndex].loginCount || 0) + 1;
        
        // Save login history
        saveUserHistory('login', userName, userCountry);
    }
    
    localStorage.setItem('afcon2025_all_users', JSON.stringify(allUsers));
}

// Initialize user management
function initializeUserManagement() {
    console.log('Initializing user management');
    
    // Attach click events to login buttons
    const profileMiniBtn = document.getElementById('profileMiniBtn');
    const loginModal = document.getElementById('loginModal');
    
    // Profile button
    if (profileMiniBtn) {
        profileMiniBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (userProfile || checkAdminSession()) {
                // User or Admin is logged in, log them out
                logoutUser();
            } else {
                // User is not logged in, show login modal
                if (loginModal) {
                    loginModal.classList.add('active');
                }
            }
        });
    }
    
    // Profile avatar click
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
    
    // Close modal button
    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
    
    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Login form submission
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
            
            // Check if this is admin login attempt
            if (userName.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() && 
                userPassword === ADMIN_CREDENTIALS.password) {
                
                // Handle admin login
                handleAdminLogin(userName, userPassword);
                this.reset();
                return;
            }
            
            // Check if this is a registration or login
            const existingProfile = JSON.parse(localStorage.getItem('afcon2025_user_profile'));
            const isNewUser = !existingProfile || 
                             (existingProfile.name !== userName || 
                              existingProfile.country !== userCountry);
            
            // Regular user registration/login
            userProfile = {
                name: userName,
                country: userCountry,
                password: userPassword,
                favoriteTeam: favoriteTeam,
                avatarSeed: userName.toLowerCase().replace(/\s/g, ''),
                loginDate: new Date().toISOString()
            };
            
            localStorage.setItem('afcon2025_user_profile', JSON.stringify(userProfile));
            
            // Update display
            updateProfileDisplay();
            
            // Close modal
            if (loginModal) {
                loginModal.classList.remove('active');
            }
            
            // Reset form
            this.reset();
            
            // Show appropriate message
            if (isNewUser) {
                alert(`Welcome to AFCON 2025 Hub, ${userName}! Your account has been created.`);
            } else {
                alert(`Welcome back, ${userName}! You're now signed in.`);
            }
            
            // Track user in statistics (this will save history)
            trackUserInStatistics(userName, userCountry, favoriteTeam);
            
            // Reload saved predictions for the new user
            loadSavedPredictions();
        });
    }
}

// ========================================
// ERROR HANDLING
// ========================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    console.error('At:', e.filename, 'line', e.lineno);
});

// Log script initialization
console.log('Predictor script loaded successfully');