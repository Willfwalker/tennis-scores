import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, set_number, team_id, games } = body;

    // Check if a score entry already exists for this match, set, and team
    const { data: existingScores, error: queryError } = await supabase
      .from('scores')
      .select('*')
      .eq('match_id', match_id)
      .eq('set_number', set_number)
      .eq('team_id', team_id);

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    let result;

    if (existingScores && existingScores.length > 0) {
      // Update existing score
      const { data, error: updateError } = await supabase
        .from('scores')
        .update({ games })
        .eq('id', existingScores[0].id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      result = data;
    } else {
      // Create new score entry
      const { data, error: insertError } = await supabase
        .from('scores')
        .insert({
          match_id,
          set_number,
          team_id,
          games
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      result = data;
    }

    // Update match status to in_progress if it's currently scheduled
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('status')
      .eq('id', match_id)
      .single();

    if (!matchError && match && match.status === 'scheduled') {
      await supabase
        .from('matches')
        .update({ status: 'in_progress' })
        .eq('id', match_id);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}
