# Street Queue - 3v3 Basketball Management App

## Project Overview
Street Queue is a web application designed to manage 3v3 street basketball games. It helps organize players, teams, and game rotations in a seamless way.

## Technical Stack
- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/           # React components
│   ├── CurrentGame.tsx  # Displays current match
│   ├── Header.tsx       # App header
│   ├── PlayerRegistration.tsx  # Player signup
│   ├── QueueDisplay.tsx # Shows team queue
│   ├── TeamDisplay.tsx  # Team card component
│   ├── TeamEditor.tsx   # Team editing modal
│   └── UnassignedPlayers.tsx  # Shows available players
├── contexts/
│   └── GameContext.tsx  # Global state management
├── types/
│   └── index.ts        # TypeScript definitions
├── utils/
│   └── gameUtils.ts    # Helper functions
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## Core Features

### 1. Player Management
- Add new players to the roster
- Remove players from the system
- Track unassigned players

### 2. Team Management
- Create teams manually or automatically
- Edit team composition
- Generate automatic team names
- Maximum 3 players per team

### 3. Game Management
- Track current game
- Manage winner/loser rotation
- Automatic queue management
- Next team preview

## State Management

The application uses React Context API through `GameContext.tsx` with the following structure:

```typescript
interface GameState {
  players: Player[];        // All registered players
  teams: Team[];           // All formed teams
  currentGame: {           // Current match
    teamA: Team | null;
    teamB: Team | null;
  };
  unassignedPlayers: Player[]; // Available players
}
```

### Actions
- ADD_PLAYER: Register new player
- REMOVE_PLAYER: Remove player from system
- CREATE_TEAM: Form new team
- EDIT_TEAM: Modify team composition
- SET_WINNER: Handle game completion
- SWAP_PLAYERS: Exchange players between teams

## Data Persistence
The application uses localStorage to persist game state between sessions:
- Saves state on every change
- Loads state on application startup
- Handles data recovery on errors

## UI/UX Features
- Responsive design for all screen sizes
- Neon-themed styling with basketball court aesthetics
- Smooth animations using Framer Motion
- Toast notifications for user feedback
- Drag-and-drop functionality for team management
- Modal dialogs for team editing

## Game Flow

1. **Player Registration**
   - Players sign up through registration form
   - Added to unassigned players pool

2. **Team Formation**
   - Manual: Select specific players
   - Automatic: System forms teams from unassigned players
   - Teams require 1-3 players

3. **Game Management**
   - Two teams play at a time
   - Winner stays on court
   - Loser moves to end of queue
   - Next team automatically moves up

## Styling

The application uses a custom Tailwind configuration with:
- Custom color scheme (neon theme)
- Basketball court textures
- Custom animations
- Responsive breakpoints
- Custom component classes

## Performance Considerations
- Optimized re-renders using React.memo
- Efficient state updates
- Lazy loading of components
- Minimized bundle size
- Local storage for persistence

## Future Enhancements
1. User authentication
2. Statistics tracking
3. Tournament mode
4. Team history
5. Player rankings
6. Social features
7. Mobile app version
8. Real-time updates