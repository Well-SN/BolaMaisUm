
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
    !team.isPlaying && 
    team.id !== state.currentGame.teamA?.id && 
    team.id !== state.currentGame.teamB?.id
  );

  console.log('Available teams for game:', availableTeams);

  // If no current game and at least 2 teams available, start new game
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

  // Fill empty slots if available
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
  if (!state.currentGame.teamA || !state.currentGame.teamB) {
    return state;
  }

  const currentTeamA = state.currentGame.teamA;
  const currentTeamB = state.currentGame.teamB;
  
  const winner = winnerTeamId === currentTeamA.id ? currentTeamA : currentTeamB;
  const loser = winnerTeamId === currentTeamA.id ? currentTeamB : currentTeamA;
  
  // Get available teams (with players) for queue
  const queueTeams = state.teams.filter(team => 
    team.players.length > 0 && 
    !team.isPlaying && 
    team.id !== currentTeamA.id && 
    team.id !== currentTeamB.id
  );
  
  const hasNextTeam = queueTeams.length > 0;
  const nextTeam = hasNextTeam ? queueTeams[0] : null;
  
  // Update team positions
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
  
  // Move loser to end of queue
  updatedTeams = updatedTeams.filter(team => team.id !== loser.id);
  updatedTeams.push({ ...loser, isPlaying: false });
  
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
