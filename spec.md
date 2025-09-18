# Draft Pick Application Specification

## Project Overview
A single-page web application that allows users to create teams and randomly distribute people among those teams through an automated draft process. The application ensures all participants are assigned to teams with fair distribution.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: In-memory storage (session-based)
- **Deployment**: Single HTML file that can run in any modern web browser
- **Dependencies**: None (completely self-contained)

## Core Requirements

### Essential Features
1. **Team Management**
   - Create multiple teams with custom names
   - Edit/delete teams before draft starts
   - Minimum 2 teams required

2. **People Management**
   - Add participants to the draft pool
   - Edit/delete people before draft starts
   - Minimum 2 people required

3. **Automated Draft Process**
   - Random selection of people for each team
   - Round-based assignment system
   - Complete distribution guarantee (no one left unassigned)

4. **Fair Distribution**
   - Even distribution across teams
   - Handle remainder participants appropriately
   - Example: 23 people, 5 teams = 5,5,5,4,4 distribution

### User Interface Requirements
1. **Setup Phase**
   - Form inputs for adding teams and people
   - Lists showing current teams and participants
   - Validation before starting draft

2. **Draft Phase**
   - Visual draft board showing team assignments
   - Progress indicators (current round, team turn)
   - "Next Pick" controls for user interaction
   - Real-time updates of remaining participants

3. **Results Phase**
   - Final team rosters display
   - Option to restart with new draft

## Functional Specifications

### Draft Logic
- **Distribution Algorithm**: Calculate even distribution with remainder handling
- **Selection Process**: Random selection from remaining participant pool
- **Team Order**: Sequential team selection (Team A, B, C, repeat)
- **Completion**: Draft ends when all participants are assigned

### Data Management
- In-memory storage during active session
- Data resets when page is refreshed or closed
- Simple state management with JavaScript variables

### User Experience
- Single-page application with state-based views
- Responsive design for desktop and mobile
- Clear visual feedback for user actions
- Error handling and validation messages

## Technical Constraints
- No external libraries or frameworks
- Must work offline after initial page load
- Compatible with modern browsers (Chrome, Firefox, Safari, Edge)
- Self-contained in single HTML file

## Success Criteria
1. Users can create teams and add participants
2. Draft process randomly and fairly distributes all participants
3. Application works reliably across different scenarios
4. Interface is intuitive and responsive

## Future Considerations
- LocalStorage data persistence
- Export results functionality
- Draft history tracking
- Multiple draft algorithms
- Team size constraints
- Import participant lists

## File Structure
```
draft/
├── index.html          # Main application file
├── spec.md            # This specification document
└── README.md          # Setup and usage instructions
```