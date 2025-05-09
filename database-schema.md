# Tennis Score Tracker Database Schema

## Tables

### matches
- `id` (uuid, primary key): Unique identifier for the match
- `created_at` (timestamp): When the match was created
- `title` (text): Title/name of the match
- `date` (date): Date when the match is/was played
- `status` (text): Status of the match (scheduled, in_progress, completed)
- `winner_id` (uuid, nullable): Reference to the winning team/player (null if not completed)

### players
- `id` (uuid, primary key): Unique identifier for the player
- `name` (text): Name of the player
- `created_at` (timestamp): When the player was added

### teams
- `id` (uuid, primary key): Unique identifier for the team
- `name` (text): Name of the team (could be same as player name for singles)
- `created_at` (timestamp): When the team was created
- `match_id` (uuid, foreign key): Reference to the match
- `side` (text): Which side the team is on (team_a or team_b)

### team_players
- `id` (uuid, primary key): Unique identifier for the team-player relationship
- `team_id` (uuid, foreign key): Reference to the team
- `player_id` (uuid, foreign key): Reference to the player

### scores
- `id` (uuid, primary key): Unique identifier for the score entry
- `match_id` (uuid, foreign key): Reference to the match
- `team_id` (uuid, foreign key): Reference to the team
- `set_number` (integer): Which set this score belongs to
- `games` (integer): Number of games won in this set
- `updated_at` (timestamp): When the score was last updated

## Relationships
- A match has two teams (team_a and team_b)
- A team belongs to one match
- A team has one or more players (singles or doubles)
- A player can be part of multiple teams (across different matches)
- A match has multiple score entries (for each set and team)
