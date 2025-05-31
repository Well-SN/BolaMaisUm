import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Player, 
  Team, 
  GameState, 
  GameAction, 
  ActionType 
} from '../types';
import {
  createPlayer,
  createTeam,
  generateTeamName,
  initializeGame,
  handleGameWinner,
  saveGameState,
  loadGameState
} from '../utils/gameUtils';

// Initial state
const initialState: GameState = {
  players: [],
  teams: [],
  currentGame: {
    teamA: null,
    teamB: null
  },
  unassignedPlayers: []
};

// Create context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case ActionType.ADD_PLAYER: {
      const newPlayer = createPlayer(action.payload.name);
      const updatedState = {
        ...state,
        players: [...state.players, newPlayer],
        unassignedPlayers: [...state.unassignedPlayers, newPlayer]
      };
      saveGameState(updatedState);
      return updatedState;
    }
    
    case ActionType.REMOVE_PLAYER: {
      const { playerId } = action.payload;
      
      // Remove player from all teams
      const updatedTeams = state.teams.map(team => ({
        ...team,
        players: team.players.filter(p => p.id !== playerId)
      })).filter(team => team.players.length > 0);
      
      const updatedState = {
        ...state,
        players: state.players.filter(p => p.id !== playerId),
        teams: updatedTeams,
        unassignedPlayers: state.unassignedPlayers.filter(p => p.id !== playerId),
        currentGame: {
          teamA: state.currentGame.teamA?.players.some(p => p.id === playerId)
            ? null
            : state.currentGame.teamA,
          teamB: state.currentGame.teamB?.players.some(p => p.id === playerId)
            ? null
            : state.currentGame.teamB
        }
      };
      saveGameState(updatedState);
      return updatedState;
    }
    
    case ActionType.CREATE_TEAM: {
      const { playerIds, teamName } = action.payload;
      const teamPlayers = state.players.filter(p => playerIds.includes(p.id));
      
      // Don't create empty teams
      if (teamPlayers.length === 0) return state;
      
      const newTeam = createTeam(
        teamName || generateTeamName(teamPlayers),
        teamPlayers
      );
      
      const updatedState = {
        ...state,
        teams: [...state.teams, newTeam],
        unassignedPlayers: state.unassignedPlayers.filter(
          p => !playerIds.includes(p.id)
        )
      };
      
      // If we don't have a current game yet, initialize one
      const finalState = 
        !state.currentGame.teamA || !state.currentGame.teamB
          ? initializeGame(updatedState)
          : updatedState;
      
      saveGameState(finalState);
      return finalState;
    }
    
    case ActionType.EDIT_TEAM: {
      const { teamId, playerIds } = action.payload;
      const teamPlayers = state.players.filter(p => playerIds.includes(p.id));
      
      // Find players being removed from the team
      const targetTeam = state.teams.find(t => t.id === teamId);
      if (!targetTeam) return state;
      
      const removedPlayers = targetTeam.players.filter(
        p => !playerIds.includes(p.id)
      );
      
      // Find new players being added to the team
      const newPlayers = teamPlayers.filter(
        p => !targetTeam.players.some(tp => tp.id === p.id)
      );
      
      // Update the teams
      const updatedTeams = state.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: teamPlayers
          };
        }
        return team;
      });
      
      // Update the unassigned players
      const updatedUnassignedPlayers = [
        ...state.unassignedPlayers.filter(
          p => !newPlayers.some(np => np.id === p.id)
        ),
        ...removedPlayers
      ];
      
      const updatedState = {
        ...state,
        teams: updatedTeams,
        unassignedPlayers: updatedUnassignedPlayers,
        currentGame: {
          teamA: state.currentGame.teamA?.id === teamId
            ? { ...state.currentGame.teamA, players: teamPlayers }
            : state.currentGame.teamA,
          teamB: state.currentGame.teamB?.id === teamId
            ? { ...state.currentGame.teamB, players: teamPlayers }
            : state.currentGame.teamB
        }
      };
      saveGameState(updatedState);
      return updatedState;
    }
    
    case ActionType.SET_WINNER: {
      const { teamId } = action.payload;
      const updatedState = handleGameWinner(state, teamId);
      saveGameState(updatedState);
      return updatedState;
    }
    
    case ActionType.SWAP_PLAYERS: {
      const { sourcePlayerId, targetPlayerId } = action.payload;
      
      // Find the players
      const sourcePlayer = state.players.find(p => p.id === sourcePlayerId);
      const targetPlayer = state.players.find(p => p.id === targetPlayerId);
      
      if (!sourcePlayer || !targetPlayer) return state;
      
      // Find the teams containing these players
      const sourceTeam = state.teams.find(team => 
        team.players.some(p => p.id === sourcePlayerId)
      );
      
      const targetTeam = state.teams.find(team => 
        team.players.some(p => p.id === targetPlayerId)
      );
      
      // If either player is not in a team, return
      if (!sourceTeam || !targetTeam) return state;
      
      // Update the teams
      const updatedTeams = state.teams.map(team => {
        if (team.id === sourceTeam.id) {
          return {
            ...team,
            players: team.players.map(p => 
              p.id === sourcePlayerId ? targetPlayer : p
            )
          };
        } else if (team.id === targetTeam.id) {
          return {
            ...team,
            players: team.players.map(p => 
              p.id === targetPlayerId ? sourcePlayer : p
            )
          };
        }
        return team;
      });
      
      const updatedState = {
        ...state,
        teams: updatedTeams,
        currentGame: {
          teamA: state.currentGame.teamA
            ? {
                ...state.currentGame.teamA,
                players: state.currentGame.teamA.players.map(p => {
                  if (p.id === sourcePlayerId && state.currentGame.teamA?.id === sourceTeam.id) {
                    return targetPlayer;
                  } else if (p.id === targetPlayerId && state.currentGame.teamA?.id === targetTeam.id) {
                    return sourcePlayer;
                  }
                  return p;
                })
              }
            : null,
          teamB: state.currentGame.teamB
            ? {
                ...state.currentGame.teamB,
                players: state.currentGame.teamB.players.map(p => {
                  if (p.id === sourcePlayerId && state.currentGame.teamB?.id === sourceTeam.id) {
                    return targetPlayer;
                  } else if (p.id === targetPlayerId && state.currentGame.teamB?.id === targetTeam.id) {
                    return sourcePlayer;
                  }
                  return p;
                })
              }
            : null
        }
      };
      saveGameState(updatedState);
      return updatedState;
    }
    
    case ActionType.INITIALIZE_GAME: {
      return action.payload.state;
    }
    
    default:
      return state;
  }
};

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Load saved state on initial render
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ 
        type: ActionType.INITIALIZE_GAME, 
        payload: { state: savedState } 
      });
    }
  }, []);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);