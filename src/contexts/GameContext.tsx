import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
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

const loadFromAPI = async (): Promise<GameState> => {
    try {
        console.log('Loading initial state from API...');
        
        // Initialize database first
        await apiClient.initializeDatabase();
        
        const [playersData, teamsData, currentGameData] = await Promise.all([
            apiClient.getPlayers(),
            apiClient.getTeams(),
            apiClient.getCurrentGame()
        ]);

        console.log('Loaded players:', playersData);
        console.log('Loaded teams:', teamsData);
        console.log('Loaded current game:', currentGameData);

        const players = playersData || [];
        const teams = teamsData || [];
        
        const currentGame = {
            teamA: currentGameData?.teamA || null,
            teamB: currentGameData?.teamB || null
        };

        // Get assigned player IDs
        const assignedPlayerIds = new Set();
        teams.forEach((team: any) => {
            team.players.forEach((player: any) => {
                assignedPlayerIds.add(player.id);
            });
        });
        
        const unassignedPlayers = players.filter(
            (player: any) => !assignedPlayerIds.has(player.id)
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
        console.error('Error loading from API:', error);
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
            
            // Save to API
            apiClient.createPlayer(action.payload.name).catch(console.error);
            
            newState = {
                ...state,
                players: [...state.players, newPlayer],
                unassignedPlayers: [...state.unassignedPlayers, newPlayer]
            };
            break;
        }
        case ActionType.REMOVE_PLAYER: {
            const { playerId } = action.payload;
            
            // Delete from API
            apiClient.deletePlayer(playerId).catch(console.error);
            
            const updatedTeams = state.teams.map(team => ({
                ...team,
                players: team.players.filter(p => p.id !== playerId)
            }));
            
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
            
            // Save to API
            apiClient.createTeam(newTeam.name, playerIds).catch(console.error);
            
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
                // Update current game in API
                apiClient.updateCurrentGame(
                    newState.currentGame.teamA?.id || null,
                    newState.currentGame.teamB?.id || null
                ).catch(console.error);
            }
            break;
        }
        case ActionType.EDIT_TEAM: {
            const { teamId, playerIds } = action.payload;
            const teamPlayers = state.players.filter(p => playerIds.includes(p.id));
            
            const targetTeam = state.teams.find(t => t.id === teamId);
            if (!targetTeam) return state;
            
            // Update in API
            apiClient.updateTeam(teamId, { playerIds }).catch(console.error);
            
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
            
            // Delete from API
            apiClient.deleteTeam(teamId).catch(console.error);
            
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
                // Update current game in API
                apiClient.updateCurrentGame(
                    newState.currentGame.teamA?.id || null,
                    newState.currentGame.teamB?.id || null
                ).catch(console.error);
            }
            break;
        }
        case ActionType.SET_WINNER: {
            // Handle winner in API
            apiClient.setWinner(action.payload.teamId).catch(console.error);
            
            newState = handleGameWinner(state, action.payload.teamId);
            break;
        }
        case ActionType.INITIALIZE_GAME: {
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

    useEffect(() => {
        const loadInitialState = async () => {
            if (isLoadingInitialState.current) return;
            
            isLoadingInitialState.current = true;
            console.log('Loading initial state from API...');
            const loadedState = await loadFromAPI();
            console.log('Loaded state:', loadedState);
            
            dispatch({ 
                type: ActionType.INITIALIZE_GAME, 
                payload: { state: loadedState } 
            });
            
            isInitialMount.current = false;
            isLoadingInitialState.current = false;
        };

        loadInitialState();

        // Set up polling for real-time updates
        const pollInterval = setInterval(async () => {
            if (isLoadingInitialState.current) return;
            
            try {
                const loadedState = await loadFromAPI();
                dispatch({ 
                    type: ActionType.INITIALIZE_GAME, 
                    payload: { state: loadedState } 
                });
            } catch (error) {
                console.error('Error polling for updates:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => {
            clearInterval(pollInterval);
        };
    }, []);
    
    const resetGame = async (password: string): Promise<boolean> => {
        if (password !== RESET_PASSWORD) {
            return false;
        }

        try {
            await apiClient.resetDatabase(password);
            dispatch({ 
                type: ActionType.INITIALIZE_GAME, 
                payload: { state: initialState } 
            });
            return true;
        } catch (error) {
            console.error('Error resetting game:', error);
            return false;
        }
    };

    return (
        <GameContext.Provider value={{ state, dispatch, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);