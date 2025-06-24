const API_BASE_URL = '/api';

export class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Players
  async getPlayers() {
    return this.request('/players.php');
  }

  async createPlayer(name: string) {
    return this.request('/players.php', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deletePlayer(id: string) {
    return this.request('/players.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Teams
  async getTeams() {
    return this.request('/teams.php');
  }

  async createTeam(name: string, playerIds: string[]) {
    return this.request('/teams.php', {
      method: 'POST',
      body: JSON.stringify({ name, playerIds }),
    });
  }

  async updateTeam(id: string, data: { name?: string; playerIds?: string[] }) {
    return this.request('/teams.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async deleteTeam(id: string) {
    return this.request('/teams.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Game
  async getCurrentGame() {
    return this.request('/game.php');
  }

  async updateCurrentGame(teamAId: string | null, teamBId: string | null) {
    return this.request('/game.php', {
      method: 'POST',
      body: JSON.stringify({ teamAId, teamBId }),
    });
  }

  async setWinner(winnerId: string) {
    return this.request('/game.php', {
      method: 'PUT',
      body: JSON.stringify({ winnerId }),
    });
  }

  // Reset
  async resetDatabase(password: string) {
    return this.request('/reset.php', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Initialize database
  async initializeDatabase() {
    return this.request('/init.php');
  }
}

export const apiClient = new ApiClient();