# Geo Shooter

A geometric survival shooter game with upgrades, wave system, and global leaderboard.

## Features
- **Gameplay**: Control a square turret, shoot geometric enemies.
- **Upgrades**: Improve damage, fire rate, speed, and health using points earned in-game.
- **Waves**: Survive endless waves of increasingly difficult enemies.
- **Leaderboard**: Compete for the highest wave survived.
- **Auth**: Secure login and registration system.

## Setup Instructions

1. **Prerequisites**:
   - Node.js installed.
   - MongoDB installed and running on `localhost:27017`.

2. **Install Dependencies**:
   Open a terminal in this directory and run:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   node server.js
   ```

4. **Play**:
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Controls
- **WASD**: Move
- **Mouse**: Aim
- **Left Click**: Shoot
- **UI Buttons**: Buy upgrades

## Notes
- The database is named `geo-shooter`.
- Statistics are saved automatically when you die.
