# SnakeFi - Base Mini App

Earn while you slither—crypto's most addictive on-chain snake game.

## Features

- 🎮 Classic snake gameplay with progressive difficulty
- 🎨 Multiple unlockable skins with cyberpunk aesthetics
- 🏆 Daily leaderboards and competitive play
- 📱 Mobile-first touch controls
- ⌨️ Keyboard support (Arrow keys or WASD)
- 🎯 Level progression system
- 💎 OnchainKit integration for Base Wallet

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your OnchainKit API key to `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Controls

- **Arrow Keys** or **WASD**: Move snake
- **Swipe**: Touch controls on mobile
- **Space**: Pause/Resume
- **Settings**: Change skins
- **Leaderboard**: View top scores

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- OnchainKit for Base integration
- HTML5 Canvas for game rendering

## Game Mechanics

- Collect yellow food to grow and score points
- Avoid walls and your own tail
- Speed increases every 100 points (new level)
- Unlock new skins by reaching higher levels
- Compete on daily leaderboards

## Monetization (Coming Soon)

- Zen Mode subscription ($2.99/mo)
- Battle Pass seasons ($4.99)
- Premium skins and power-ups
- Micro-transactions via Base Wallet

## License

MIT
