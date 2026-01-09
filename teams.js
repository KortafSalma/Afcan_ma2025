        // Mobile navigation toggle
        document.getElementById('mobileToggle').addEventListener('click', function() {
            document.getElementById('navLinks').classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navLinks').classList.remove('active');
            });
        });

        // Search functionality
        const searchInput = document.getElementById('teamSearch');
        const teams = document.querySelectorAll('.team-detail-card');
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            
            // If search is empty, show all teams
            if (searchTerm === '') {
                teams.forEach(team => {
                    team.style.display = 'block';
                });
                return;
            }
            
            teams.forEach(team => {
                const teamName = team.querySelector('h3').textContent.toLowerCase();
                const countryCode = team.querySelector('h3').textContent.match(/🇦🇫|🇦🇱|🇩🇿|🇦🇴|🇧🇯|🇧🇼|🇧🇫|🇧🇮|🇨🇻|🇨🇲|🇨🇩|🇨🇮|🇪🇬|🇬🇶|🇪🇷|🇸🇿|🇪🇹|🇬🇦|🇬🇲|🇬🇭|🇬🇳|🇬🇼|🇰🇪|🇱🇸|🇱🇷|🇱🇾|🇲🇬|🇲🇼|🇲🇱|🇲🇷|🇲🇺|🇲🇦|🇲🇿|🇳🇦|🇳🇪|🇳🇬|🇨🇬|🇷🇪|🇷🇼|🇸🇹|🇸🇳|🇸🇨|🇸🇱|🇸🇴|🇿🇦|🇸🇸|🇸🇩|🇹🇿|🇹🇬|🇹🇳|🇺🇬|🇿🇲|🇿🇼/)?.[0] || '';
                const teamNameWithoutFlag = teamName.replace(countryCode, '').trim();
                
                // Search in team name and country name
                if (teamNameWithoutFlag.includes(searchTerm) || teamName.includes(searchTerm)) {
                    team.style.display = 'block';
                } else {
                    team.style.display = 'none';
                }
            });
        });

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                teams.forEach(team => {
                    if (filter === 'all') {
                        team.style.display = 'block';
                    } else if (filter === 'qualified') {
                        if (team.getAttribute('data-status') === 'qualified') {
                            team.style.display = 'block';
                        } else {
                            team.style.display = 'none';
                        }
                    } else if (filter === 'eliminated') {
                        if (team.getAttribute('data-status') === 'eliminated') {
                            team.style.display = 'block';
                        } else {
                            team.style.display = 'none';
                        }
                    } else {
                        if (team.getAttribute('data-group') === filter.split('-')[1]) {
                            team.style.display = 'block';
                        } else {
                            team.style.display = 'none';
                        }
                    }
                });
            });
        });

        // View details button functionality
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const teamName = this.closest('.team-detail-card').querySelector('h3').textContent;
                alert(`More details about ${teamName} will be displayed here. This would navigate to a detailed team page.`);
                // In a real implementation, this would redirect to a team details page
                // window.location.href = `team-details.html?team=${encodeURIComponent(teamName)}`;
            });
        });