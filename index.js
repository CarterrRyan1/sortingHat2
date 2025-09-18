// Application state
        const state = {
            teams: [],
            participants: [],
            currentPhase: 'setup', // setup, draft, results
            draftOrder: [],
            currentRound: 0,
            currentTeamIndex: 0
        };

        // DOM Elements
        const elements = {
            teamNameInput: document.getElementById('team-name'),
            addTeamButton: document.getElementById('add-team'),
            teamsList: document.getElementById('teams-list'),
            participantNameInput: document.getElementById('participant-name'),
            addParticipantButton: document.getElementById('add-participant'),
            participantsList: document.getElementById('participants-list'),
            startDraftButton: document.getElementById('start-draft'),
            phases: {
                setup: document.getElementById('setup-phase'),
                draft: document.getElementById('draft-phase'),
                results: document.getElementById('results-phase')
            }
        };

        // Team management functions
        function addTeam(name) {
            if (!name) return;
            
            const teamName = name.trim();
            if (teamName === '') return;
            
            if (state.teams.some(team => team.name === teamName)) {
                showError('Team name already exists');
                return;
            }

            const team = {
                id: Date.now(),
                name: teamName,
                members: []
            };

            state.teams.push(team);
            renderTeams();
            validateDraftStart();
            elements.teamNameInput.value = '';
        }

        function deleteTeam(teamId) {
            state.teams = state.teams.filter(team => team.id !== teamId);
            renderTeams();
            validateDraftStart();
        }

        function renderTeams() {
            elements.teamsList.innerHTML = state.teams.map(team => `
                <div class="list-item" data-team-id="${team.id}">
                    <span>${team.name}</span>
                    <button class="delete-btn" onclick="deleteTeam(${team.id})">Delete</button>
                </div>
            `).join('');
        }

        function validateDraftStart() {
            const hasEnoughTeams = state.teams.length >= 2;
            const hasEnoughParticipants = state.participants.length >= 2;
            elements.startDraftButton.disabled = !(hasEnoughTeams && hasEnoughParticipants);
        }

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            // Remove any existing error messages
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            elements.teamNameInput.parentElement.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }

        // Event Listeners for team management
        elements.addTeamButton.addEventListener('click', () => {
            addTeam(elements.teamNameInput.value);
        });

        elements.teamNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTeam(elements.teamNameInput.value);
            }
        });

        // Participant management functions
        function addParticipant(name) {
            if (!name) return;
            
            const participantName = name.trim();
            if (participantName === '') return;
            
            if (state.participants.some(p => p.name === participantName)) {
                showParticipantError('Participant name already exists');
                return;
            }

            const participant = {
                id: Date.now(),
                name: participantName
            };

            state.participants.push(participant);
            renderParticipants();
            validateDraftStart();
            elements.participantNameInput.value = '';
        }

        function deleteParticipant(participantId) {
            state.participants = state.participants.filter(p => p.id !== participantId);
            renderParticipants();
            validateDraftStart();
        }

        function renderParticipants() {
            elements.participantsList.innerHTML = state.participants.map(participant => `
                <div class="list-item" data-participant-id="${participant.id}">
                    <span>${participant.name}</span>
                    <button class="delete-btn" onclick="deleteParticipant(${participant.id})">Delete</button>
                </div>
            `).join('');
        }

        function showParticipantError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            // Remove any existing error messages
            const existingError = document.querySelector('.participants-section .error-message');
            if (existingError) {
                existingError.remove();
            }
            
            elements.participantNameInput.parentElement.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }

        // Event Listeners for participant management
        elements.addParticipantButton.addEventListener('click', () => {
            addParticipant(elements.participantNameInput.value);
        });

        elements.participantNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addParticipant(elements.participantNameInput.value);
            }
        });

        // Phase management
        function showPhase(phase) {
            Object.entries(elements.phases).forEach(([name, element]) => {
                element.classList.toggle('active', name === phase);
            });
            state.currentPhase = phase;
        }

        // Draft management
        function calculateTeamSizes() {
            const numParticipants = state.participants.length;
            const numTeams = state.teams.length;
            const minPerTeam = Math.floor(numParticipants / numTeams);
            const remainder = numParticipants % numTeams;
            
            return state.teams.map((_, index) => {
                // Distribute remainder participants among first few teams
                return minPerTeam + (index < remainder ? 1 : 0);
            });
        }

        function initializeDraft() {
            // Reset team members
            state.teams.forEach(team => team.members = []);
            
            // Shuffle participants
            state.draftPool = [...state.participants]
                .sort(() => Math.random() - 0.5);
            
            // Calculate team sizes
            state.targetTeamSizes = calculateTeamSizes();
            
            state.currentRound = 1;
            state.currentTeamIndex = 0;
            
            showPhase('draft');
            updateDraftBoard();
            updateDraftControls();
        }

        function performDraftPick() {
            if (state.draftPool.length === 0) {
                finishDraft();
                return;
            }

            const currentTeam = state.teams[state.currentTeamIndex];
            const teamSize = state.targetTeamSizes[state.currentTeamIndex];

            // Only draft if team isn't full
            if (currentTeam.members.length < teamSize) {
                const participant = state.draftPool.pop();
                currentTeam.members.push(participant);
            }

            // Move to next team
            state.currentTeamIndex++;
            if (state.currentTeamIndex >= state.teams.length) {
                state.currentTeamIndex = 0;
                state.currentRound++;
            }

            updateDraftBoard();
            updateDraftControls();

            // Check if draft is complete
            if (state.draftPool.length === 0) {
                finishDraft();
            }
        }

        function updateDraftBoard() {
            const draftBoard = document.getElementById('draft-board');
            draftBoard.innerHTML = state.teams.map((team, index) => `
                <div class="team-column ${state.currentTeamIndex === index ? 'active' : ''}">
                    <h3>${team.name} (${team.members.length}/${state.targetTeamSizes[index]})</h3>
                    ${team.members.map(member => `
                        <div class="list-item">
                            <span>${member.name}</span>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }

        function updateDraftControls() {
            const currentRound = document.getElementById('current-round');
            currentRound.textContent = `Round ${state.currentRound}`;
            
            const nextPickButton = document.getElementById('next-pick');
            nextPickButton.disabled = state.draftPool.length === 0;
        }

        function finishDraft() {
            showPhase('results');
            renderFinalResults();
        }

        function renderFinalResults() {
            const finalTeams = document.getElementById('final-teams');
            finalTeams.innerHTML = state.teams.map(team => `
                <div class="team-column">
                    <h3>${team.name} (${team.members.length} members)</h3>
                    ${team.members.map(member => `
                        <div class="list-item">
                            <span>${member.name}</span>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }

        // Event listeners for draft management
        elements.startDraftButton.addEventListener('click', initializeDraft);

        document.getElementById('next-pick').addEventListener('click', performDraftPick);

        document.getElementById('new-draft').addEventListener('click', () => {
            state.teams.forEach(team => team.members = []);
            state.draftPool = [];
            showPhase('setup');
        });

        // Enhanced UI interactions and validations
        function validateInput(input, type) {
            const value = input.value.trim();
            
            if (value === '') {
                showError(`Please enter a ${type} name`, input);
                return false;
            }
            
            if (value.length < 2) {
                showError(`${type} name must be at least 2 characters`, input);
                return false;
            }
            
            if (value.length > 30) {
                showError(`${type} name must be less than 30 characters`, input);
                return false;
            }
            
            if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
                showError(`${type} name can only contain letters, numbers, spaces, hyphens, and underscores`, input);
                return false;
            }
            
            return true;
        }

        function showError(message, input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message fade-in';
            errorDiv.textContent = message;
            
            const container = input.parentElement;
            const existingError = container.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            container.appendChild(errorDiv);
            input.classList.add('shake');
            
            setTimeout(() => {
                errorDiv.remove();
                input.classList.remove('shake');
            }, 3000);
        }

        function updateStartDraftTooltip() {
            const button = elements.startDraftButton;
            const teams = state.teams.length;
            const participants = state.participants.length;
            
            if (teams < 2 && participants < 2) {
                button.setAttribute('data-tooltip', 'Need at least 2 teams and 2 participants');
            } else if (teams < 2) {
                button.setAttribute('data-tooltip', 'Need at least 2 teams');
            } else if (participants < 2) {
                button.setAttribute('data-tooltip', 'Need at least 2 participants');
            } else {
                button.removeAttribute('data-tooltip');
            }
        }

        // Enhanced event listeners
        elements.teamNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z0-9\s-_]/g, '');
        });

        elements.participantNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z0-9\s-_]/g, '');
        });

        elements.addTeamButton.addEventListener('click', () => {
            if (validateInput(elements.teamNameInput, 'team')) {
                addTeam(elements.teamNameInput.value);
            }
        });

        elements.addParticipantButton.addEventListener('click', () => {
            if (validateInput(elements.participantNameInput, 'participant')) {
                addParticipant(elements.participantNameInput.value);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (state.currentPhase === 'draft' && e.code === 'Space') {
                e.preventDefault();
                const nextPickButton = document.getElementById('next-pick');
                if (!nextPickButton.disabled) {
                    performDraftPick();
                }
            }
        });

        // Improved rendering functions
        function renderTeams() {
            elements.teamsList.innerHTML = state.teams.map(team => `
                <div class="list-item fade-in" data-team-id="${team.id}">
                    <span>${team.name}</span>
                    <button class="delete-btn tooltip" data-tooltip="Delete team" onclick="deleteTeam(${team.id})">Delete</button>
                </div>
            `).join('');
            updateStartDraftTooltip();
        }

        function renderParticipants() {
            elements.participantsList.innerHTML = state.participants.map(participant => `
                <div class="list-item fade-in" data-participant-id="${participant.id}">
                    <span>${participant.name}</span>
                    <button class="delete-btn tooltip" data-tooltip="Delete participant" onclick="deleteParticipant(${participant.id})">Delete</button>
                </div>
            `).join('');
            updateStartDraftTooltip();
        }

        // Initialize the application
        function init() {
            renderTeams();
            renderParticipants();
            validateDraftStart();
            
            // Add tooltips to initial elements
            elements.startDraftButton.classList.add('tooltip');
            elements.addTeamButton.classList.add('tooltip');
            elements.addParticipantButton.classList.add('tooltip');
            
            elements.addTeamButton.setAttribute('data-tooltip', 'Add a new team');
            elements.addParticipantButton.setAttribute('data-tooltip', 'Add a new participant');
            
            updateStartDraftTooltip();
        }

        init();