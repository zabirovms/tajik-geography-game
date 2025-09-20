# World Geography Games

## Overview
A Vue.js-based geography learning game application converted from a UniApp project. The application features multiple game modes including flag identification, country shapes, capitals, timed challenges, multiplayer, and random mode games.

## Recent Changes
- **2025-09-20**: Successfully converted UniApp project to Vue.js web application
- **2025-09-20**: Resolved dependency conflicts and created proper Vite configuration
- **2025-09-20**: Set up frontend workflow on port 5000 with proper host configuration for Replit
- **2025-09-20**: Configured deployment settings for production

## Project Architecture

### Technology Stack
- **Frontend Framework**: Vue.js 3.4.0
- **Build Tool**: Vite 4.0.0
- **Router**: Vue Router 4.0.0
- **Styling**: Sass/SCSS, CSS3 with responsive design
- **Development Server**: Vite dev server on port 5000

### Directory Structure
```
src/
├── main.js              # Application entry point
├── App.vue              # Root component
├── style.css            # Global styles
├── router/
│   └── index.js         # Vue Router configuration
├── views/
│   ├── Home.vue         # Main homepage
│   ├── Achievements.vue # Achievements page
│   ├── Profile.vue      # User profile page
│   └── games/           # Game components
│       ├── FlagsGame.vue
│       ├── ShapesGame.vue
│       ├── CapitalsGame.vue
│       ├── TimedChallenge.vue
│       ├── Multiplayer.vue
│       └── RandomMode.vue
└── components/          # Reusable components
```

### Game Features
1. **Flag Challenge** - Country flag identification
2. **Shape Challenge** - Country outline recognition
3. **Capital Challenge** - Capital city knowledge
4. **Timed Challenge** - Speed-based geography questions
5. **Multiplayer** - Social gaming features
6. **Random Mode** - Mixed question types

## Development Workflow

### Running Locally
```bash
npm run dev
```
- Starts Vite development server on port 5000
- Accessible at http://localhost:5000
- Hot module replacement enabled
- Configured for Replit environment with host 0.0.0.0

### Building for Production
```bash
npm run build
```
- Builds optimized production bundle to `dist/` directory
- Static assets are optimized and compressed

### Preview Production Build
```bash
npm run preview
```
- Serves production build for testing

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build Command**: `npm run build`
- **Run Command**: `npx serve -s dist -l 5000`
- **Port**: 5000 (configured for Replit)

## User Preferences
- Clean, modern UI design
- Mobile-responsive layout
- Emoji-based icons for visual appeal
- Chinese language interface
- Bottom navigation for mobile experience

## Technical Notes
- Converted from UniApp to standard Vue.js for better web compatibility
- Removed UniApp-specific dependencies that caused version conflicts
- Implemented custom routing instead of UniApp's page routing
- Replaced UniApp UI components with standard HTML/CSS equivalents
- Maintained original design aesthetic and functionality

## Next Steps for Further Development
1. Implement actual game logic for each game mode
2. Add backend API integration for scoring and leaderboards
3. Implement user authentication and progress tracking
4. Add more interactive features and animations
5. Expand question database for each game type
6. Add sound effects and improved visual feedback