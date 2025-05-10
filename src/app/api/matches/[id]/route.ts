import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 404 });
    }

    // Get teams for this match
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('match_id', id);

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }

    const teamA = teams.find(team => team.side === 'team_a');
    const teamB = teams.find(team => team.side === 'team_b');

    // Get players for each team
    let teamAPlayers = [];
    let teamBPlayers = [];

    if (teamA) {
      const { data: teamAPlayerLinks, error: teamAPlayersError } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', teamA.id);

      if (!teamAPlayersError && teamAPlayerLinks) {
        const playerIds = teamAPlayerLinks.map(link => link.player_id);

        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);

        if (!playersError) {
          teamAPlayers = players;
        }
      }
    }

    if (teamB) {
      const { data: teamBPlayerLinks, error: teamBPlayersError } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', teamB.id);

      if (!teamBPlayersError && teamBPlayerLinks) {
        const playerIds = teamBPlayerLinks.map(link => link.player_id);

        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);

        if (!playersError) {
          teamBPlayers = players;
        }
      }
    }

    // Get scores for this match
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('*')
      .eq('match_id', id)
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

    const result = {
      ...match,
      teamA: teamA ? {
        id: teamA.id,
        name: teamA.name,
        players: teamAPlayers
      } : null,
      teamB: teamB ? {
        id: teamB.id,
        name: teamB.name,
        players: teamBPlayers
      } : null,
      sets: formattedSets
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update match
    if (body.status) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: body.status, winner_id: body.winner_id })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}
