export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  isPlaying?: boolean;
}

export interface GameState {
  players: Player[];
  teams: Team[];
  currentGame: {
    teamA: Team | null;
    teamB: Team | null;
  };
  unassignedPlayers: Player[];
}

export enum ActionType {
  ADD_PLAYER = 'ADD_PLAYER',
  REMOVE_PLAYER = 'REMOVE_PLAYER',
  CREATE_TEAM = 'CREATE_TEAM',
  EDIT_TEAM = 'EDIT_TEAM',
  REMOVE_TEAM = 'REMOVE_TEAM',
  SET_WINNER = 'SET_WINNER',
  SWAP_PLAYERS = 'SWAP_PLAYERS',
  INITIALIZE_GAME = 'INITIALIZE_GAME',
}

export type GameAction = 
  | { type: ActionType.ADD_PLAYER; payload: { name: string } }
  | { type: ActionType.REMOVE_PLAYER; payload: { playerId: string } }
  | { type: ActionType.CREATE_TEAM; payload: { playerIds: string[]; teamName: string } }
  | { type: ActionType.EDIT_TEAM; payload: { teamId: string; playerIds: string[] } }
  | { type: ActionType.REMOVE_TEAM; payload: { teamId: string } }
  | { type: ActionType.SET_WINNER; payload: { teamId: string } }
  | { type: ActionType.SWAP_PLAYERS; payload: { sourcePlayerId: string; targetPlayerId: string } }
  | { type: ActionType.INITIALIZE_GAME; payload: { state: GameState } };