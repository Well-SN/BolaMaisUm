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
    
        // Clean up existing team_player records first to avoid conflicts
        const { data: existingTeamPlayers } = await supabase
          .from('team_players')
          .select('team_id, player_id');
    
        if (existingTeamPlayers && existingTeamPlayers.length > 0) {
          await supabase
            .from('team_players')
            .delete()
            .in('team_id', existingTeamPlayers.map(r => r.team_id))
            .throwOnError();
        }
    
        // Save ALL teams (including empty ones) - CRITICAL: Keep all teams
        for (const team of state.teams) {
          await supabase
            .from('teams')
            .upsert({ 
              id: team.id, 
              name: team.name,
              is_playing: team.isPlaying || false 
            })
            .throwOnError();

          // Only save team-player relationships for teams that have players
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
    
        // Clean up teams that no longer exist in state
        const { data: existingTeams } = await supabase
          .from('teams')
          .select('id');
    
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
        await supabase
            .from('team_players')
            .delete()
            .eq('player_id', playerId)
            .throwOnError();
        
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
        await supabase
            .from('team_players')
            .delete()
            .eq('team_id', teamId)
            .throwOnError();
        
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
        await supabase
          .from('team_players')
          .delete()
          .neq('team_id', 'non-existent-id');
        
        await supabase
          .from('teams')
          .delete()
          .neq('id', 'non-existent-id');
        
        await supabase
          .from('players')
          .delete()
          .neq('id', 'non-existent-id');
    
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
        
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*');
    
        if (playersError) {
          console.error('Error loading players:', playersError);
          return initialState;
        }
    
        const players = playersData || [];
        console.log('Loaded players:', players);
    
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');
    
        if (teamsError) {
          console.error('Error loading teams:', teamsError);
          return initialState;
        }
    
        const { data: teamPlayersData, error: teamPlayersError } = await supabase
          .from('team_players')
          .select('team_id, player_id');
    
        if (teamPlayersError) {
          console.error('Error loading team players:', teamPlayersError);
          return initialState;
        }
    
        // CRITICAL FIX: Always keep ALL teams, even empty ones
        const teams = (teamsData || [])
          .map(team => {
            const teamPlayers = teamPlayersData
              ?.filter(tp => tp.team_id === team.id)
              .map(tp => players.find(p => p.id === tp.player_id))
              .filter(Boolean) || [];
            
            return {
              id: team.id,
              name: team.name,
              isPlaying: team.is_playing || false,
              players: teamPlayers
            };
          });
          // REMOVED: .filter(team => team.players.length > 0) - This was causing teams to disappear!
    
        console.log('Built teams (including empty ones):', teams);
    
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
            const existingPlayer = state.players.find(p => 
              p.name.toLowerCase().trim() === action.payload.name.toLowerCase().trim()
            );
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
            
            deletePlayerFromSupabase(playerId);
            
            // CRITICAL FIX: Keep all teams, just remove the player from them
            const updatedTeams = state.teams.map(team => ({
                ...team,
                players: team.players.filter(p => p.id !== playerId)
            }));
            
            newState = {
                ...state,
                players: state.players.filter(p => p.id !== playerId),
                teams: updatedTeams, // Keep all teams
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
            
            // Remove players from unassigned only if they were actually unassigned
            const playersToRemoveFromUnassigned = teamPlayers.filter(player => 
                state.unassignedPlayers.some(up => up.id === player.id)
            );
            
            newState = {
                ...state,
                teams: [...state.teams, newTeam],
                unassignedPlayers: state.unassignedPlayers.filter(
                    p => !playersToRemoveFromUnassigned.some(rp => rp.id === p.id)
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
            
            // CRITICAL FIX: Allow teams to have 0 players (empty teams are valid)
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
                        players: teamPlayers // This can be empty array now
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
            
            deleteTeamFromSupabase(teamId);
            
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
            // For reordering, we just update the state without triggering saves
            console.log('Initializing game with new state:', action.payload.state);
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
    const isSaving = useRef(false); // Prevent concurrent saves
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isInitialMount.current || isLoadingInitialState.current || isSaving.current) {
            return;
        }
        
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Add delay to prevent rapid saves and batch them
        saveTimeoutRef.current = setTimeout(() => {
            if (!isSaving.current) {
                isSaving.current = true;
                console.log('Saving state to Supabase after delay:', state);
                saveToSupabase(state).finally(() => {
                    isSaving.current = false;
                });
            }
        }, 2000); // Increased delay to 2 seconds to prevent conflicts

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
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

        // Reduced real-time updates to prevent constant reloading during reordering
        const channel = supabase
            .channel('game-state-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'players' },
                async () => {
                    if (isLoadingInitialState.current || isSaving.current) return;
                    console.log('New player added, reloading state...');
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'players' },
                async () => {
                    if (isLoadingInitialState.current || isSaving.current) return;
                    console.log('Player deleted, reloading state...');
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
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
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
