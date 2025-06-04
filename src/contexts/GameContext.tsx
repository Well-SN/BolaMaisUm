
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
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

const CURRENT_GAME_RECORD_ID = 'c0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5';
const RESET_PASSWORD = 'admin123';

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
    resetGame: (password: string) => Promise<boolean>;
}>({
    state: initialState,
    dispatch: () => null,
    resetGame: async () => false
});

const saveToSupabase = async (state: GameState) => {
    try {
        console.log('Saving state to Supabase:', state);
        
        // Save players first
        for (const player of state.players) {
          await supabase
            .from('players')
            .upsert({ id: player.id, name: player.name })
            .throwOnError();
        }
    
        // Get all existing team_player records to clean up
        const { data: existingTeamPlayers } = await supabase
          .from('team_players')
          .select('team_id, player_id');
    
        // Delete all existing team_player records
        if (existingTeamPlayers && existingTeamPlayers.length > 0) {
          await supabase
            .from('team_players')
            .delete()
            .in('team_id', existingTeamPlayers.map(r => r.team_id))
            .throwOnError();
        }
    
        // Get all existing teams to clean up
        const { data: existingTeams } = await supabase
          .from('teams')
          .select('id');
    
        // Delete teams that no longer exist in the state
        if (existingTeams) {
          const currentTeamIds = state.teams.map(t => t.id);
          const teamsToDelete = existingTeams
            .filter(team => !currentTeamIds.includes(team.id))
            .map(team => team.id);
    
          if (teamsToDelete.length > 0) {
            await supabase
              .from('teams')
              .delete()
              .in('id', teamsToDelete)
              .throwOnError();
          }
        }
    
        // Save teams with players
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
          id: CURRENT_GAME_RECORD_ID,
          team_a_id: state.currentGame.teamA?.id || null,
          team_b_id: state.currentGame.teamB?.id || null
        };
    
        await supabase
          .from('current_game')
          .upsert(currentGameData)
          .throwOnError();
    
        console.log('State saved successfully to Supabase');
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      }
};

const deletePlayerFromSupabase = async (playerId: string) => {
    try {
        // Remove player from all teams first
        await supabase
            .from('team_players')
            .delete()
            .eq('player_id', playerId)
            .throwOnError();
        
        // Then delete the player
        await supabase
            .from('players')
            .delete()
            .eq('id', playerId)
            .throwOnError();
        
        console.log('Player deleted from Supabase:', playerId);
    } catch (error) {
        console.error('Error deleting player from Supabase:', error);
    }
};

const deleteTeamFromSupabase = async (teamId: string) => {
    try {
        // Remove team-player relationships first
        await supabase
            .from('team_players')
            .delete()
            .eq('team_id', teamId)
            .throwOnError();
        
        // Then delete the team
        await supabase
            .from('teams')
            .delete()
            .eq('id', teamId)
            .throwOnError();
        
        console.log('Team deleted from Supabase:', teamId);
    } catch (error) {
        console.error('Error deleting team from Supabase:', error);
    }
};

const resetSupabase = async () => {
    try {
        // Delete all team_player records
        await supabase
          .from('team_players')
          .delete()
          .neq('team_id', 'non-existent-id'); // Delete all records
        
        // Delete all teams
        await supabase
          .from('teams')
          .delete()
          .neq('id', 'non-existent-id'); // Delete all records
        
        // Delete all players
        await supabase
          .from('players')
          .delete()
          .neq('id', 'non-existent-id'); // Delete all records
    
        // Reset current game
        await supabase
          .from('current_game')
          .update({ team_a_id: null, team_b_id: null })
          .eq('id', CURRENT_GAME_RECORD_ID)
          .throwOnError();
    
        console.log('Supabase reset successfully');
        return true;
      } catch (error) {
        console.error('Error resetting Supabase:', error);
        return false;
      }
};

const loadFromSupabase = async (): Promise<GameState> => {
    try {
        console.log('Loading initial state from Supabase...');
        
        // Load players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*');
    
        if (playersError) {
          console.error('Error loading players:', playersError);
          return initialState;
        }
    
        const players = playersData || [];
        console.log('Loaded players:', players);
    
        // Load teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');
    
        if (teamsError) {
          console.error('Error loading teams:', teamsError);
          return initialState;
        }
    
        // Load team players
        const { data: teamPlayersData, error: teamPlayersError } = await supabase
          .from('team_players')
          .select('team_id, player_id');
    
        if (teamPlayersError) {
          console.error('Error loading team players:', teamPlayersError);
          return initialState;
        }
    
        // Build teams with their players
        const teams = (teamsData || []).map(team => ({
          id: team.id,
          name: team.name,
          isPlaying: team.is_playing || false,
          players: teamPlayersData
            ?.filter(tp => tp.team_id === team.id)
            .map(tp => players.find(p => p.id === tp.player_id))
            .filter(Boolean) || []
        }));
    
        console.log('Built teams:', teams);
    
        // Load current game
        const { data: currentGameData, error: currentGameError } = await supabase
          .from('current_game')
          .select('*')
          .eq('id', CURRENT_GAME_RECORD_ID)
          .single();
    
        if (currentGameError) {
          console.error('Error loading current game:', currentGameError);
        }
    
        const currentGame = {
          teamA: teams.find(t => t.id === currentGameData?.team_a_id) || null,
          teamB: teams.find(t => t.id === currentGameData?.team_b_id) || null
        };
    
        console.log('Current game:', currentGame);
    
        // Calculate unassigned players
        const assignedPlayerIds = new Set(
          teamPlayersData?.map(tp => tp.player_id) || []
        );
        
        const unassignedPlayers = players.filter(
          player => !assignedPlayerIds.has(player.id)
        );
    
        console.log('Unassigned players:', unassignedPlayers);
    
        const loadedState = {
          players,
          teams,
          currentGame,
          unassignedPlayers
        };
        
        console.log('Final loaded state:', loadedState);
        return loadedState;
      } catch (error) {
        console.error('Error loading from Supabase:', error);
        return initialState;
      }
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
    let newState = state;

    switch (action.type) {
        case ActionType.ADD_PLAYER: {
            const existingPlayer = state.players.find(p => p.name === action.payload.name.trim());
            if (existingPlayer) {
                console.warn(`Player with name "${action.payload.name.trim()}" already exists.`);
                return state; 
            }
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
            
            // Delete from Supabase immediately
            deletePlayerFromSupabase(playerId);
            
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
        case ActionType.REMOVE_TEAM: {
            const { teamId } = action.payload;
            const teamToRemove = state.teams.find(t => t.id === teamId);
            
            if (!teamToRemove) return state;
            
            // Delete from Supabase immediately
            deleteTeamFromSupabase(teamId);
            
            // Adicionar os jogadores do time de volta para os não atribuídos
            newState = {
                ...state,
                teams: state.teams.filter(t => t.id !== teamId),
                unassignedPlayers: [
                    ...state.unassignedPlayers,
                    ...teamToRemove.players
                ],
                currentGame: {
                    teamA: state.currentGame.teamA?.id === teamId ? null : state.currentGame.teamA,
                    teamB: state.currentGame.teamB?.id === teamId ? null : state.currentGame.teamB
                }
            };
            
            // Se o jogo atual foi afetado, inicializar novo jogo se possível
            if (state.currentGame.teamA?.id === teamId || state.currentGame.teamB?.id === teamId) {
                newState = initializeGame(newState);
            }
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
    return newState;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const isInitialMount = useRef(true); 
    const isLoadingInitialState = useRef(false);

    useEffect(() => {
        if (isInitialMount.current || isLoadingInitialState.current) {
            return;
        }
        console.log('Saving state to Supabase:', state);
        saveToSupabase(state);
    }, [state]);

    useEffect(() => {
        const loadInitialState = async () => {
            if (isLoadingInitialState.current) return;
            
            isLoadingInitialState.current = true;
            console.log('Loading initial state from Supabase...');
            const loadedState = await loadFromSupabase();
            console.log('Loaded state:', loadedState);
            
            dispatch({ 
                type: ActionType.INITIALIZE_GAME, 
                payload: { state: loadedState } 
            });
            
            isInitialMount.current = false;
            isLoadingInitialState.current = false;
        };

        loadInitialState();

        const channel = supabase
            .channel('game-state-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players' },
                async () => {
                    if (isLoadingInitialState.current) return;
                    console.log('Players table changed, reloading state...');
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'teams' },
                async () => {
                    if (isLoadingInitialState.current) return;
                    console.log('Teams table changed, reloading state...');
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'team_players' },
                async () => {
                    if (isLoadingInitialState.current) return;
                    console.log('Team players table changed, reloading state...');
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'current_game' },
                async () => {
                    if (isLoadingInitialState.current) return;
                    console.log('Current game table changed, reloading state...');
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);
    
    const resetGame = async (password: string): Promise<boolean> => {
        if (password !== RESET_PASSWORD) {
            return false;
        }

        const success = await resetSupabase();
        if (success) {
            dispatch({ 
                type: ActionType.INITIALIZE_GAME, 
                payload: { state: initialState } 
            });
        }
        return success;
    };

    return (
        <GameContext.Provider value={{ state, dispatch, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
