'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MatchWithTeams } from '@/types/database';

interface Set {
  setNumber: number;
  teamAGames: number;
  teamBGames: number;
}

export default function MatchDetails({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<Set[]>([]);
  const [currentSet, setCurrentSet] = useState<Set>({ setNumber: 1, teamAGames: 0, teamBGames: 0 });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch match');
        }

        const matchData = await response.json();

        setMatch(matchData);
        setSets(matchData.sets || []);

        // Set current set
        if (matchData.status === 'in_progress' && matchData.sets && matchData.sets.length > 0) {
          const lastSet = matchData.sets[matchData.sets.length - 1];
          setCurrentSet(lastSet);
        } else if (matchData.status === 'scheduled') {
          setCurrentSet({ setNumber: 1, teamAGames: 0, teamBGames: 0 });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [params.id]);

  const incrementTeamAGames = () => {
    setCurrentSet(prev => ({ ...prev, teamAGames: prev.teamAGames + 1 }));
  };

  const incrementTeamBGames = () => {
    setCurrentSet(prev => ({ ...prev, teamBGames: prev.teamBGames + 1 }));
  };

  const decrementTeamAGames = () => {
    setCurrentSet(prev => ({ ...prev, teamAGames: Math.max(0, prev.teamAGames - 1) }));
  };

  const decrementTeamBGames = () => {
    setCurrentSet(prev => ({ ...prev, teamBGames: Math.max(0, prev.teamBGames - 1) }));
  };

  const completeSet = async () => {
    if (!match) return;

    try {
      // Save team A score
      await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: match.id,
          team_id: match.teamA.id,
          set_number: currentSet.setNumber,
          games: currentSet.teamAGames
        }),
      });

      // Save team B score
      await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: match.id,
          team_id: match.teamB.id,
          set_number: currentSet.setNumber,
          games: currentSet.teamBGames
        }),
      });

      // Add current set to sets array
      const updatedSets = [...sets, currentSet];
      setSets(updatedSets);

      // Start a new set
      setCurrentSet({
        setNumber: currentSet.setNumber + 1,
        teamAGames: 0,
        teamBGames: 0
      });
    } catch (error) {
      console.error('Error completing set:', error);
      alert('Failed to complete set. Please try again.');
    }
  };

  const completeMatch = async () => {
    if (!match) return;

    try {
      // Add the final set if it has any games
      if (currentSet.teamAGames > 0 || currentSet.teamBGames > 0) {
        // Save team A score for the final set
        await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: match.id,
            team_id: match.teamA.id,
            set_number: currentSet.setNumber,
            games: currentSet.teamAGames
          }),
        });

        // Save team B score for the final set
        await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: match.id,
            team_id: match.teamB.id,
            set_number: currentSet.setNumber,
            games: currentSet.teamBGames
          }),
        });

        setSets([...sets, currentSet]);
      }

      // Determine the winner
      const teamASets = sets.filter(set => set.teamAGames > set.teamBGames).length +
                       (currentSet.teamAGames > currentSet.teamBGames ? 1 : 0);
      const teamBSets = sets.filter(set => set.teamBGames > set.teamAGames).length +
                       (currentSet.teamBGames > currentSet.teamAGames ? 1 : 0);

      const winnerId = teamASets > teamBSets ? match.teamA.id : match.teamB.id;

      // Update match status to completed
      await fetch(`/api/matches/${match.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          winner_id: winnerId
        }),
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error completing match:', error);
      alert('Failed to complete match. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading match details...</div>;
  }

  if (!match) {
    return <div className="text-center py-8">Match not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-green-600 hover:text-green-800">
          ← Back to Matches
        </Link>
        <h1 className="text-2xl font-bold mt-2">{match.title}</h1>
        <p className="text-gray-600">{match.date}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">{match.teamA.name}</h2>
          <div className="text-sm text-gray-600">
            Players: {match.teamA.players.join(', ')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">{match.teamB.name}</h2>
          <div className="text-sm text-gray-600">
            Players: {match.teamB.players.join(', ')}
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">Score</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Set</th>
                <th className="text-center py-2">{match.teamA.name}</th>
                <th className="text-center py-2">{match.teamB.name}</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.setNumber} className="border-b">
                  <td className="py-2">{set.setNumber}</td>
                  <td className="text-center py-2">{set.teamAGames}</td>
                  <td className="text-center py-2">{set.teamBGames}</td>
                </tr>
              ))}

              {match.status !== 'completed' && (
                <tr>
                  <td className="py-2">{currentSet.setNumber}</td>
                  <td className="text-center py-2">{currentSet.teamAGames}</td>
                  <td className="text-center py-2">{currentSet.teamBGames}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Controls - Only show if match is not completed */}
      {match.status !== 'completed' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">Update Score</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">{match.teamA.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decrementTeamAGames}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold">{currentSet.teamAGames}</span>
                <button
                  onClick={incrementTeamAGames}
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">{match.teamB.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decrementTeamBGames}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold">{currentSet.teamBGames}</span>
                <button
                  onClick={incrementTeamBGames}
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={completeSet}
              className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
            >
              Complete Set
            </button>
            <button
              onClick={completeMatch}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Complete Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
