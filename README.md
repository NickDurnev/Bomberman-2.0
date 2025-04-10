# Bomberman

A modern web-based multiplayer remake of the classic Bomberman game, built with Phaser 3, React, TypeScript, and Socket.IO.

![Bomberman Logo](public/assets/bomb_logo.png)

## Overview

Bomberman is a real-time multiplayer game where players navigate a grid-based map, placing bombs to destroy obstacles and eliminate opponents. The last player standing wins the match!

### Key Features

-   **Multiplayer Gameplay**: Play with friends in real-time using Socket.IO for communication
-   **Classic Mechanics**: Place bombs, collect power-ups, and be the last one standing
-   **Modern Tech Stack**: Built with Phaser 3, React, TypeScript, and TailwindCSS
-   **Responsive Design**: Play on desktop or mobile devices
-   **User Authentication**: Sign in with Auth0 to save your progress and stats

## Game Mechanics

-   **Movement**: Navigate the grid-based map with arrow keys or WASD
-   **Bomb Placement**: Press spacebar to place bombs
-   **Power-ups**:

    -   Bomb Count: Increase the number of bombs you can place simultaneously
    -   Bomb Power: Increase the blast radius of your bombs
    -   Speed: Move faster around the map
    -   Delay: Reduce the time between bomb placements

-   **Map Objects**:
    -   Destructible walls: Can be destroyed by bombs to reveal paths or power-ups
    -   Indestructible walls: Form the permanent structure of the map
    -   Portals: Teleport to another location on the map

## Tech Stack

-   **Frontend**:

    -   React 18 with TypeScript
    -   TailwindCSS for styling
    -   Zustand for state management
    -   React Router for navigation
    -   Auth0 for authentication

-   **Game Engine**:

    -   Phaser 3.80.1 - A powerful HTML5 game framework
    -   Custom entity system for game objects
    -   Scene management for game states

-   **Networking**:

    -   Socket.IO for real-time communication
    -   Custom event handling for game synchronization

-   **Build Tools**:
    -   Vite for fast development and optimized builds
    -   ESLint and TypeScript for code quality

## Project Structure

-   `src/game` - Contains the game source code

    -   `entities/` - Game objects like Player, Bombs, Explosions, etc.
    -   `scenes/` - Phaser scenes (Preload, Playing, GameOver)
    -   `main.ts` - Game configuration and initialization
    -   `EventBus.ts` - Communication between React and Phaser
    -   `PhaserGame.tsx` - React component that wraps the Phaser game

-   `public/assets` - Game assets (sprites, sounds, maps)

## Getting Started

### Prerequisites

-   Node.js 16+ and npm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/bomberman-2.0.git
    cd bomberman-2.0
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Multiplayer Setup

The game connects to a Socket.IO server for multiplayer functionality. For a full experience, you'll need to set up the server component (not included in this repository).

## Debugging

Use the browser console to view debug messages. The game includes error handling for common issues like asset loading failures and missing player data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   Original Bomberman game by Hudson Soft
-   Phaser 3 game framework
-   React and the entire frontend ecosystem
-   The open-source community for inspiration and resources

---

© 2025 Bomberman

