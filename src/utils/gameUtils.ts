import { v4 as uuidv4 } from 'uuid';
import { Player, Team, GameState } from '../types';

export const createPlayer = (name: string): Player => ({
  id: uuidv4(),
  name: name.trim()
});

export const createTeam = (name: string, players: Player[]): Team => ({
  id: uuidv4(),
  name: name.trim(),
  players,
  isPlaying: false
});

export const generateTeamName = (players: Player[]): string => {
  if (players.length === 0) return "Time Vazio";
  
  const acronym = players
    .map(player => player.name.charAt(0).toUpperCase())
    .join('');
  
  const suffixes = ["Squad", "Crew", "Ballers", "Stars", "Elite", "Force"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${acronym} ${randomSuffix}`;
};

export const initializeGame = (state: GameState): GameState => {
  // Get teams with players that aren't currently playing
  const availableTeams = state.teams.filter(team => 
    team.players.length > 0 && // Only teams with players can play
    !team.isPlaying
  );

  console.log('Available teams for game:', availableTeams);

  // If no current game and at least 2 teams available, start new game
  if (!state.currentGame.teamA && !state.currentGame.teamB && availableTeams.length >= 2) {
    const [teamA, teamB] = availableTeams.slice(0, 2);
    
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === teamA.id || team.id === teamB.id
      })),
      currentGame: {
        teamA: { ...teamA, isPlaying: true },
        teamB: { ...teamB, isPlaying: true }
      }
    };
  }

  // Fill empty slots if available
  if (!state.currentGame.teamA && availableTeams.length > 0) {
    const nextTeam = availableTeams[0];
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || (state.currentGame.teamB && team.id === state.currentGame.teamB.id)
      })),
      currentGame: {
        ...state.currentGame,
        teamA: { ...nextTeam, isPlaying: true }
      }
    };
  }

  if (!state.currentGame.teamB && availableTeams.length > 0) {
    const nextTeam = availableTeams[0];
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || (state.currentGame.teamA && team.id === state.currentGame.teamA.id)
      })),
      currentGame: {
        ...state.currentGame,
        teamB: { ...nextTeam, isPlaying: true }
      }
    };
  }

  return state;
};

export const handleGameWinner = (state: GameState, winnerTeamId: string): GameState => {
  if (!state.currentGame.teamA || !state.currentGame.teamB) {
    return state;
  }

  const currentTeamA = state.currentGame.teamA;
  const currentTeamB = state.currentGame.teamB;
  
  const winner = winnerTeamId === currentTeamA.id ? currentTeamA : currentTeamB;
  const loser = winnerTeamId === currentTeamA.id ? currentTeamB : currentTeamA;
  
  console.log('Winner:', winner.name, 'Loser:', loser.name);
  
  // Get teams in queue (not playing and have players)
  const queueTeams = state.teams.filter(team => 
    team.players.length > 0 && 
    !team.isPlaying && 
    team.id !== currentTeamA.id && 
    team.id !== currentTeamB.id
  );
  
  console.log('Teams in queue:', queueTeams.map(t => t.name));
  
  const nextTeam = queueTeams.length > 0 ? queueTeams[0] : null;
  console.log('Next team to play:', nextTeam?.name || 'None');
  
  // Create new teams array with proper order
  let updatedTeams = [...state.teams];
  
  // Remove loser from current position
  updatedTeams = updatedTeams.filter(team => team.id !== loser.id);
  
  // Update team statuses
  updatedTeams = updatedTeams.map(team => {
    if (team.id === winner.id) {
      return { ...team, isPlaying: true };
    } else if (nextTeam && team.id === nextTeam.id) {
      return { ...team, isPlaying: true };
    } else {
      return { ...team, isPlaying: false };
    }
  });
  
  // Add loser to the end of the queue (not playing)
  updatedTeams.push({ ...loser, isPlaying: false });
  
  console.log('Updated teams order:', updatedTeams.map(t => `${t.name} (playing: ${t.isPlaying})`));
  
  const newCurrentGame = {
    teamA: { ...winner, isPlaying: true },
    teamB: nextTeam ? { ...nextTeam, isPlaying: true } : null
  };
  
  console.log('New current game:', {
    teamA: newCurrentGame.teamA?.name,
    teamB: newCurrentGame.teamB?.name
  });
  
  return {
    ...state,
    teams: updatedTeams,
    currentGame: newCurrentGame
  };
};