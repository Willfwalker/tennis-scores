'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MatchWithTeams } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Set {
  setNumber: number;
  teamAGames: number;
  teamBGames: number;
}

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<Set[]>([]);
  const [currentSet, setCurrentSet] = useState<Set>({ setNumber: 1, teamAGames: 0, teamBGames: 0 });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/matches/${id}`);

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
  }, [params]);

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
    return <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading match details...</p>
      </div>
    </div>;
  }

  if (!match) {
    return <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">Match not found</h2>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>;
  }

  return (
    <div>
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/">← Back to Matches</Link>
        </Button>
        <h1 className="text-3xl font-bold">{match.title}</h1>
        <p className="text-muted-foreground">{match.date}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{match.teamA.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Players: {match.teamA.players.join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{match.teamB.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Players: {match.teamB.players.join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Display */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Score</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Score Controls - Only show if match is not completed */}
      {match.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Update Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">{match.teamA.name}</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={decrementTeamAGames}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold">{currentSet.teamAGames}</span>
                  <Button
                    onClick={incrementTeamAGames}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary/10"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">{match.teamB.name}</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={decrementTeamBGames}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold">{currentSet.teamBGames}</span>
                  <Button
                    onClick={incrementTeamBGames}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary/10"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              onClick={completeSet}
              variant="outline"
            >
              Complete Set
            </Button>
            <Button
              onClick={completeMatch}
            >
              Complete Match
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
