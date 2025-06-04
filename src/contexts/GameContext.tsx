import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'; // Importe useRef
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

const CURRENT_GAME_RECORD_ID = 'c0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5';
const RESET_PASSWORD = 'admin123'; // Em produção, isto deve estar em variáveis de ambiente

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

// Mantenha a função saveToSupabase como está, fora do reducer.
const saveToSupabase = async (state: GameState) => {
    // ... (sua implementação atual de saveToSupabase)
    try {
        // Get all existing team_player records
        const { data: existingTeamPlayers } = await supabase
          .from('team_players')
          .select('team_id, player_id');
    
        // Delete team_player records that are no longer valid
        if (existingTeamPlayers && existingTeamPlayers.length > 0) {
          const validTeamPlayerPairs = state.teams.flatMap(team => 
            team.players.map(player => ({
              team_id: team.id,
              player_id: player.id
            }))
          );
    
          const recordsToDelete = existingTeamPlayers.filter(record => 
            !validTeamPlayerPairs.some(valid => 
              valid.team_id === record.team_id && 
              valid.player_id === record.player_id
            )
          );
    
          if (recordsToDelete.length > 0) {
            await supabase
              .from('team_players')
              .delete()
              .in('team_id', recordsToDelete.map(r => r.team_id))
              .in('player_id', recordsToDelete.map(r => r.player_id))
              .throwOnError();
          }
        }
    
        // Save players
        for (const player of state.players) {
          await supabase
            .from('players')
            .upsert({ id: player.id, name: player.name })
            .throwOnError();
        }
    
        // Get all existing teams
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
    
        // Save teams (only teams with players)
        const teamsWithPlayers = state.teams.filter(team => team.players.length > 0);
        for (const team of teamsWithPlayers) {
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
    
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      }
};

const resetSupabase = async () => {
    // ... (sua implementação atual de resetSupabase)
    try {
        // Get all records to delete
        const { data: teamPlayers } = await supabase
          .from('team_players')
          .select('team_id, player_id');
        
        const { data: teams } = await supabase
          .from('teams')
          .select('id');
        
        const { data: players } = await supabase
          .from('players')
          .select('id');
    
        // Delete records with specific WHERE clauses
        if (teamPlayers && teamPlayers.length > 0) {
          await supabase
            .from('team_players')
            .delete()
            .in('team_id', teamPlayers.map(tp => tp.team_id))
            .throwOnError();
        }
    
        if (teams && teams.length > 0) {
          await supabase
            .from('teams')
            .delete()
            .in('id', teams.map(t => t.id))
            .throwOnError();
        }
    
        if (players && players.length > 0) {
          await supabase
            .from('players')
            .delete()
            .in('id', players.map(p => p.id))
            .throwOnError();
        }
    
        await supabase
          .from('current_game')
          .update({ team_a_id: null, team_b_id: null })
          .eq('id', CURRENT_GAME_RECORD_ID)
          .throwOnError();
    
        return true;
      } catch (error) {
        console.error('Error resetting Supabase:', error);
        return false;
      }
};

const loadFromSupabase = async (): Promise<GameState> => {
    // ... (sua implementação atual de loadFromSupabase)
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
    
        // Load current game using the UUID
        const { data: currentGameData } = await supabase
          .from('current_game')
          .select('*')
          .eq('id', CURRENT_GAME_RECORD_ID)
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

// **Remova a chamada saveToSupabase daqui!**
const gameReducer = (state: GameState, action: GameAction): GameState => {
    let newState = state;

    switch (action.type) {
        case ActionType.ADD_PLAYER: {
            // Antes de criar um novo player, verifique se já existe um player com o mesmo nome
            // Isso evitará IDs duplicados para o mesmo nome se a inserção for mais rápida que a sincronização
            const existingPlayer = state.players.find(p => p.name === action.payload.name.trim());
            if (existingPlayer) {
                // Se o player já existe, retorne o estado atual sem alterações ou com uma mensagem de erro
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
    return newState; // Apenas retorne o novo estado
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    // Use um ref para garantir que o saveToSupabase não seja chamado no montagem inicial
    const isInitialMount = useRef(true); 

    // Este useEffect é responsável por salvar o estado no Supabase sempre que ele muda
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return; // Não salve no montagem inicial
        }
        // console.log("State changed, saving to Supabase:", state); // Para depuração
        saveToSupabase(state);
    }, [state]); // Dispara sempre que o estado muda

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
        // Use 'game-state-updates' para um canal único que escuta todas as tabelas relevantes
        // Isso ajuda a evitar múltiplos "dispatch" para a mesma mudança
        const channel = supabase
            .channel('game-state-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players' },
                async () => {
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
                    const loadedState = await loadFromSupabase();
                    dispatch({ 
                        type: ActionType.INITIALIZE_GAME, 
                        payload: { state: loadedState } 
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'team_players' }, // Adicione esta tabela também
                async () => {
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
    }, []); // Array de dependências vazio para rodar apenas na montagem e desmontagem
    
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