
import { v4 as uuidv4 } from 'uuid';
import { Player, Team, GameState } from '../types';

export const createPlayer = (name: string): Player => ({
  id: uuidv4(),
  name
});

export const createTeam = (name: string, players: Player[]): Team => ({
  id: uuidv4(),
  name,
  players,
  isPlaying: false
});

export const generateTeamName = (players: Player[]): string => {
  if (players.length === 0) return "Empty Team";
  
  const acronym = players
    .map(player => player.name.charAt(0).toUpperCase())
    .join('');
  
  const suffixes = ["Squad", "Crew", "Ballers", "Stars", "Elite", "Force"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${acronym} ${randomSuffix}`;
};

export const initializeGame = (state: GameState): GameState => {
  // Get all teams that have players and aren't currently in a game
  const availableTeams = state.teams.filter(team => 
    team.players.length > 0 && // ONLY teams with players can play
    !team.isPlaying && 
    team.id !== state.currentGame.teamA?.id && 
    team.id !== state.currentGame.teamB?.id
  );

  // If we have no current game and at least 2 teams with players, start a new game
  if (!state.currentGame.teamA && !state.currentGame.teamB && availableTeams.length >= 2) {
    const [teamA, teamB] = availableTeams;
    
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

  // If we have one slot open and available teams with players, fill it
  if (!state.currentGame.teamA && availableTeams.length > 0) {
    const [nextTeam] = availableTeams;
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || team.id === state.currentGame.teamB?.id
      })),
      currentGame: {
        ...state.currentGame,
        teamA: { ...nextTeam, isPlaying: true }
      }
    };
  }

  if (!state.currentGame.teamB && availableTeams.length > 0) {
    const [nextTeam] = availableTeams;
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || team.id === state.currentGame.teamA?.id
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
  // Verify the current game exists
  if (!state.currentGame.teamA || !state.currentGame.teamB) {
    return state;
  }

  // Determine winner and loser
  const currentTeamA = state.currentGame.teamA;
  const currentTeamB = state.currentGame.teamB;
  
  const winner = winnerTeamId === currentTeamA.id ? currentTeamA : currentTeamB;
  const loser = winnerTeamId === currentTeamA.id ? currentTeamB : currentTeamA;
  
  // Get all available teams in queue order (not currently playing and have players)
  const queueTeams = state.teams.filter(team => 
    team.players.length > 0 && // ONLY teams with players can be in queue
    !team.isPlaying && 
    team.id !== currentTeamA.id && 
    team.id !== currentTeamB.id
  );
  
  // Check if we have a next team available
  const hasNextTeam = queueTeams.length > 0;
  const nextTeam = hasNextTeam ? queueTeams[0] : null;
  
  // Create new teams array with updated positions
  let updatedTeams = state.teams.map(team => {
    if (team.id === winner.id) {
      return { ...team, isPlaying: true };
    } else if (team.id === loser.id) {
      return { ...team, isPlaying: false };
    } else if (nextTeam && team.id === nextTeam.id) {
      return { ...team, isPlaying: true };
    }
    return team;
  });
  
  // Add loser to the end of the queue
  updatedTeams = updatedTeams.filter(team => team.id !== loser.id);
  updatedTeams.push({ ...loser, isPlaying: false });
  
  // Update current game with winner and next team (if available)
  const newCurrentGame = {
    teamA: { ...winner, isPlaying: true },
    teamB: nextTeam ? { ...nextTeam, isPlaying: true } : null
  };
  
  return {
    ...state,
    teams: updatedTeams,
    currentGame: newCurrentGame
  };
};
