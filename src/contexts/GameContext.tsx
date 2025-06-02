import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
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
  handleGameWinner
} from '../utils/gameUtils';

const initialState: GameState = {
  players: [],
  teams: [],
  currentGame: {
    teamA: null,
    teamB: null
  },
  unassignedPlayers: []
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null
});

const saveToSupabase = async (state: GameState) => {
  try {
    // Save players
    for (const player of state.players) {
      await supabase
        .from('players')
        .upsert({ id: player.id, name: player.name })
        .throwOnError();
    }

    // Save teams
    for (const team of state.teams) {
      await supabase
        .from('teams')
        .upsert({ 
          id: team.id, 
          name: team.name,
          is_playing: team.isPlaying || false 
        })
        .throwOnError();

      // Save team players relationships
      for (const player of team.players) {
        await supabase
          .from('team_players')
          .upsert({ 
            team_id: team.id,
            player_id: player.id
          })
          .throwOnError();
      }
    }

    // Update current game
    const currentGameData = {
      id: 'current',
      team_a_id: state.currentGame.teamA?.id || null,
      team_b_id: state.currentGame.teamB?.id || null
    };

    await supabase
      .from('current_game')
      .upsert(currentGameData)
      .throwOnError();

  } catch (error) {
    console.error('Error saving to Supabase:', error);
  }
};

const loadFromSupabase = async (): Promise<GameState> => {
  try {
    // Load players
    const { data: playersData } = await supabase
      .from('players')
      .select('*');

    const players = playersData || [];

    // Load teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*');

    // Load team players
    const { data: teamPlayersData } = await supabase
      .from('team_players')
      .select('team_id, player_id');

    // Build teams with their players
    const teams = (teamsData || []).map(team => ({
      id: team.id,
      name: team.name,
      isPlaying: team.is_playing,
      players: teamPlayersData
        ?.filter(tp => tp.team_id === team.id)
        .map(tp => players.find(p => p.id === tp.player_id))
        .filter(Boolean) || []
    }));

    // Load current game
    const { data: currentGameData } = await supabase
      .from('current_game')
      .select('*')
      .single();

    const currentGame = {
      teamA: teams.find(t => t.id === currentGameData?.team_a_id) || null,
      teamB: teams.find(t => t.id === currentGameData?.team_b_id) || null
    };

    // Calculate unassigned players
    const assignedPlayerIds = new Set(
      teamPlayersData?.map(tp => tp.player_id) || []
    );
    
    const unassignedPlayers = players.filter(
      player => !assignedPlayerIds.has(player.id)
    );

    return {
      players,
      teams,
      currentGame,
      unassignedPlayers
    };
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    return initialState;
  }
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState = state;

  switch (action.type) {
    case ActionType.ADD_PLAYER: {
      const newPlayer = createPlayer(action.payload.name);
      newState = {
        ...state,
        players: [...state.players, newPlayer],
        unassignedPlayers: [...state.unassignedPlayers, newPlayer]
      };
      break;
    }
    
    case ActionType.REMOVE_PLAYER: {
      const { playerId } = action.payload;
      
      const updatedTeams = state.teams.map(team => ({
        ...team,
        players: team.players.filter(p => p.id !== playerId)
      })).filter(team => team.players.length > 0);
      
      newState = {
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
      break;
    }
    
    case ActionType.CREATE_TEAM: {
      const { playerIds, teamName } = action.payload;
      const teamPlayers = state.players.filter(p => playerIds.includes(p.id));
      
      if (teamPlayers.length === 0) return state;
      
      const newTeam = createTeam(
        teamName || generateTeamName(teamPlayers),
        teamPlayers
      );
      
      newState = {
        ...state,
        teams: [...state.teams, newTeam],
        unassignedPlayers: state.unassignedPlayers.filter(
          p => !playerIds.includes(p.id)
        )
      };
      
      if (!state.currentGame.teamA || !state.currentGame.teamB) {
        newState = initializeGame(newState);
      }
      break;
    }
    
    case ActionType.EDIT_TEAM: {
      const { teamId, playerIds } = action.payload;
      const teamPlayers = state.players.filter(p => playerIds.includes(p.id));
      
      const targetTeam = state.teams.find(t => t.id === teamId);
      if (!targetTeam) return state;
      
      const removedPlayers = targetTeam.players.filter(
        p => !playerIds.includes(p.id)
      );
      
      const newPlayers = teamPlayers.filter(
        p => !targetTeam.players.some(tp => tp.id === p.id)
      );
      
      const updatedTeams = state.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: teamPlayers
          };
        }
        return team;
      });
      
      newState = {
        ...state,
        teams: updatedTeams,
        unassignedPlayers: [
          ...state.unassignedPlayers.filter(
            p => !newPlayers.some(np => np.id === p.id)
          ),
          ...removedPlayers
        ],
        currentGame: {
          teamA: state.currentGame.teamA?.id === teamId
            ? { ...state.currentGame.teamA, players: teamPlayers }
            : state.currentGame.teamA,
          teamB: state.currentGame.teamB?.id === teamId
            ? { ...state.currentGame.teamB, players: teamPlayers }
            : state.currentGame.teamB
        }
      };
      break;
    }
    
    case ActionType.SET_WINNER: {
      newState = handleGameWinner(state, action.payload.teamId);
      break;
    }
    
    case ActionType.INITIALIZE_GAME: {
      newState = action.payload.state;
      break;
    }
    
    default:
      return state;
  }

  // Save state to Supabase after each action
  saveToSupabase(newState);
  return newState;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Load initial state from Supabase
  useEffect(() => {
    const loadInitialState = async () => {
      const loadedState = await loadFromSupabase();
      dispatch({ 
        type: ActionType.INITIALIZE_GAME, 
        payload: { state: loadedState } 
      });
    };

    loadInitialState();

    // Subscribe to realtime changes
    const playersSubscription = supabase
      .channel('players-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
        const loadedState = await loadFromSupabase();
        dispatch({ 
          type: ActionType.INITIALIZE_GAME, 
          payload: { state: loadedState } 
        });
      })
      .subscribe();

    const teamsSubscription = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async () => {
        const loadedState = await loadFromSupabase();
        dispatch({ 
          type: ActionType.INITIALIZE_GAME, 
          payload: { state: loadedState } 
        });
      })
      .subscribe();

    const currentGameSubscription = supabase
      .channel('current-game-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'current_game' }, async () => {
        const loadedState = await loadFromSupabase();
        dispatch({ 
          type: ActionType.INITIALIZE_GAME, 
          payload: { state: loadedState } 
        });
      })
      .subscribe();

    return () => {
      playersSubscription.unsubscribe();
      teamsSubscription.unsubscribe();
      currentGameSubscription.unsubscribe();
    };
  }, []);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);