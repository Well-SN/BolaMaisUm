import { v4 as uuidv4 } from 'uuid';
import { Player, Team, GameState } from '../types';

export const createPlayer = (name: string): Player => ({
  id: uuidv4(),
  name
});

export const createTeam = (name: string, players: Player[]): Team => ({
  id: uuidv4(),
  name,
  players
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

export const formTeamsFromUnassigned = (players: Player[]): Team[] => {
  const teams: Team[] = [];
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffledPlayers.length; i += 3) {
    if (i + 3 <= shuffledPlayers.length) {
      const teamPlayers = shuffledPlayers.slice(i, i + 3);
      const teamName = generateTeamName(teamPlayers);
      teams.push(createTeam(teamName, teamPlayers));
    }
  }
  
  return teams;
};

export const initializeGame = (state: GameState): GameState => {
  const newTeams = formTeamsFromUnassigned(state.unassignedPlayers);
  const allTeams = [...state.teams, ...newTeams];
  
  let currentGame = { ...state.currentGame };
  let remainingTeams = [...allTeams];
  
  if (!currentGame.teamA && remainingTeams.length > 0) {
    currentGame.teamA = remainingTeams[0];
    remainingTeams[0] = { ...remainingTeams[0], isPlaying: true };
    remainingTeams = remainingTeams.slice(1);
  }
  
  if (!currentGame.teamB && remainingTeams.length > 0) {
    currentGame.teamB = remainingTeams[0];
    remainingTeams[0] = { ...remainingTeams[0], isPlaying: true };
    remainingTeams = remainingTeams.slice(1);
  }
  
  return {
    ...state,
    teams: allTeams.map(team => ({
      ...team,
      isPlaying: team.id === currentGame.teamA?.id || team.id === currentGame.teamB?.id
    })),
    currentGame,
    unassignedPlayers: state.unassignedPlayers.filter(player => 
      !allTeams.some(team => team.players.some(p => p.id === player.id))
    )
  };
};

export const handleGameWinner = (state: GameState, winnerTeamId: string): GameState => {
  const loserTeam = 
    state.currentGame.teamA?.id === winnerTeamId 
      ? state.currentGame.teamB 
      : state.currentGame.teamA;
  
  const winnerTeam = state.teams.find(team => team.id === winnerTeamId);
  
  if (!winnerTeam || !loserTeam) return state;
  
  const updatedTeams = state.teams
    .map(team => ({
      ...team,
      isPlaying: team.id === winnerTeamId || team.id === state.teams[0]?.id
    }))
    .filter(team => team.id !== loserTeam.id)
    .concat({ ...loserTeam, isPlaying: false });
  
  const nextTeam = updatedTeams.find(team => 
    !team.isPlaying && team.id !== winnerTeamId && team.id !== loserTeam.id
  );
  
  const currentGame = {
    teamA: winnerTeam,
    teamB: nextTeam || null
  };
  
  const finalTeams = updatedTeams.map(team => ({
    ...team,
    isPlaying: team.id === winnerTeamId || team.id === nextTeam?.id
  }));
  
  return {
    ...state,
    teams: finalTeams,
    currentGame
  };
};

export const getNextAvailablePlayers = (state: GameState): Player[] => {
  return state.unassignedPlayers.slice(0, 3);
};