export interface Match {
  id: string;
  created_at: string;
  title: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  winner_id?: string;
}

export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  match_id: string;
  side: 'team_a' | 'team_b';
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
}

export interface Score {
  id: string;
  match_id: string;
  team_id: string;
  set_number: number;
  games: number;
  updated_at: string;
}

// Frontend types
export interface MatchWithTeams {
  id: string;
  title: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  teamA: {
    id: string;
    name: string;
    players: Player[];
  };
  teamB: {
    id: string;
    name: string;
    players: Player[];
  };
  sets: {
    setNumber: number;
    teamAGames: number;
    teamBGames: number;
  }[];
}

export interface CreateMatchRequest {
  title: string;
  date: string;
  teamA: {
    name: string;
    players: string[];
  };
  teamB: {
    name: string;
    players: string[];
  };
}

export interface UpdateScoreRequest {
  matchId: string;
  setNumber: number;
  teamAGames: number;
  teamBGames: number;
}

export interface CompleteMatchRequest {
  matchId: string;
  winnerId: string;
}
