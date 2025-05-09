import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { CreateMatchRequest } from '@/types/database';

export async function GET() {
  try {
    // Get all matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (matchesError) {
      return NextResponse.json({ error: matchesError.message }, { status: 500 });
    }
    
    // For each match, get the teams
    const matchesWithTeams = await Promise.all(
      matches.map(async (match) => {
        // Get teams for this match
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('match_id', match.id);
        
        if (teamsError) {
          return match;
        }
        
        const teamA = teams.find(team => team.side === 'team_a');
        const teamB = teams.find(team => team.side === 'team_b');
        
        // Get scores for this match
        const { data: scores, error: scoresError } = await supabase
          .from('scores')
          .select('*')
          .eq('match_id', match.id)
          .order('set_number', { ascending: true });
        
        // Format scores by set
        const formattedSets = [];
        if (!scoresError && scores) {
          const setNumbers = [...new Set(scores.map(score => score.set_number))];
          
          for (const setNumber of setNumbers) {
            const setScores = scores.filter(score => score.set_number === setNumber);
            const teamAScore = setScores.find(score => score.team_id === teamA?.id);
            const teamBScore = setScores.find(score => score.team_id === teamB?.id);
            
            formattedSets.push({
              setNumber,
              teamAGames: teamAScore?.games || 0,
              teamBGames: teamBScore?.games || 0
            });
          }
        }
        
        return {
          ...match,
          teamA: teamA ? { id: teamA.id, name: teamA.name } : null,
          teamB: teamB ? { id: teamB.id, name: teamB.name } : null,
          sets: formattedSets
        };
      })
    );
    
    return NextResponse.json(matchesWithTeams);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateMatchRequest = await request.json();
    
    // Start a transaction
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        title: body.title,
        date: body.date,
        status: 'scheduled'
      })
      .select()
      .single();
    
    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }
    
    // Create Team A
    const { data: teamA, error: teamAError } = await supabase
      .from('teams')
      .insert({
        name: body.teamA.name,
        match_id: match.id,
        side: 'team_a'
      })
      .select()
      .single();
    
    if (teamAError) {
      return NextResponse.json({ error: teamAError.message }, { status: 500 });
    }
    
    // Create Team B
    const { data: teamB, error: teamBError } = await supabase
      .from('teams')
      .insert({
        name: body.teamB.name,
        match_id: match.id,
        side: 'team_b'
      })
      .select()
      .single();
    
    if (teamBError) {
      return NextResponse.json({ error: teamBError.message }, { status: 500 });
    }
    
    // Create players for Team A
    for (const playerName of body.teamA.players) {
      if (!playerName.trim()) continue;
      
      // Check if player already exists
      const { data: existingPlayers, error: playerQueryError } = await supabase
        .from('players')
        .select('*')
        .eq('name', playerName.trim())
        .limit(1);
      
      let playerId;
      
      if (playerQueryError) {
        continue;
      }
      
      if (existingPlayers && existingPlayers.length > 0) {
        playerId = existingPlayers[0].id;
      } else {
        // Create new player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert({ name: playerName.trim() })
          .select()
          .single();
        
        if (playerError) {
          continue;
        }
        
        playerId = newPlayer.id;
      }
      
      // Link player to team
      await supabase
        .from('team_players')
        .insert({
          team_id: teamA.id,
          player_id: playerId
        });
    }
    
    // Create players for Team B
    for (const playerName of body.teamB.players) {
      if (!playerName.trim()) continue;
      
      // Check if player already exists
      const { data: existingPlayers, error: playerQueryError } = await supabase
        .from('players')
        .select('*')
        .eq('name', playerName.trim())
        .limit(1);
      
      let playerId;
      
      if (playerQueryError) {
        continue;
      }
      
      if (existingPlayers && existingPlayers.length > 0) {
        playerId = existingPlayers[0].id;
      } else {
        // Create new player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert({ name: playerName.trim() })
          .select()
          .single();
        
        if (playerError) {
          continue;
        }
        
        playerId = newPlayer.id;
      }
      
      // Link player to team
      await supabase
        .from('team_players')
        .insert({
          team_id: teamB.id,
          player_id: playerId
        });
    }
    
    return NextResponse.json({ id: match.id });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
  }
}
