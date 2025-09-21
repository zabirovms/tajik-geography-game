# World Geography Games

A Vue.js application featuring interactive geography games using amCharts5 for mapping and visualization.

## Project Overview
- **Name**: World Geography Games
- **Type**: Frontend web application
- **Framework**: Vue.js 3 with Vue Router
- **Build Tool**: Vite
- **Mapping Library**: amCharts 5 with geodata
- **Styling**: SCSS/Sass
- **Language**: Multi-language support (includes Tajik)

## Architecture
This is a uni-app based project that can run on multiple platforms, but currently configured to run as a web application. The project includes:

- Interactive world map with country data
- Multiple game modes (Capitals, Flags, Shapes, Timed Challenge, Multiplayer, Random Mode)
- Achievement system
- User profile management
- Multi-language support

## Key Components
- **WorldMapViewer**: Main interactive map component
- **GameContainer**: Container for various game modes
- **CountryTooltip**: Interactive country information display
- Game modes: CapitalsGame, FlagsGame, ShapesGame, TimedChallenge, Multiplayer, RandomMode

## Development Setup
- **Port**: 5000 (configured for Replit)
- **Host**: 0.0.0.0 (allows external access)
- **Dev Server**: Vite with HMR disabled for Replit compatibility
- **Build**: Standard Vite build process

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build Command**: `npm run build`
- **Serve Command**: `serve -s dist -l 5000`

## Recent Changes
- **2024-09-21**: Initial import setup completed
  - Installed all dependencies
  - Configured Vite server for Replit environment (host: 0.0.0.0, allowedHosts: true)
  - Verified application runs successfully with world map initialization
  - Set up deployment configuration for production

## Current Status
✅ Frontend application running successfully on port 5000
✅ amCharts world map initializes and loads country data
✅ Multi-language support active (detected Tajik language)
✅ Deployment configuration completed