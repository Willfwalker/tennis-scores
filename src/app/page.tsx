import Link from "next/link";
import { MatchWithTeams } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getMatches(): Promise<MatchWithTeams[]> {
  try {
    // Use absolute URL for API routes
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/matches`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tennis Match Tracker</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Keep track of all your family tennis matches</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Recent Matches</h2>
        <Button asChild>
          <Link href="/matches/new">New Match</Link>
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: '1fr'
      }}>
        {matches.map((match) => {
          // Format score display
          let scoreDisplay = '';
          if (match.sets.length > 0) {
            scoreDisplay = match.sets.map(set => `${set.teamAGames}-${set.teamBGames}`).join(', ');
          }

          // Status badge styles
          const getBadgeStyles = (status) => {
            const baseStyle = {
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px'
            };

            if (status === 'completed') {
              return {
                ...baseStyle,
                backgroundColor: '#dbeafe',
                color: '#1e40af'
              };
            } else if (status === 'in_progress') {
              return {
                ...baseStyle,
                backgroundColor: '#fef3c7',
                color: '#92400e'
              };
            } else {
              return {
                ...baseStyle,
                backgroundColor: '#f3f4f6',
                color: '#1f2937'
              };
            }
          };

          return (
            <Card key={match.id} style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
              <CardHeader style={{ paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <CardTitle>{match.title}</CardTitle>
                  <span style={getBadgeStyles(match.status)}>
                    {match.status === 'completed' ? 'Completed' :
                     match.status === 'in_progress' ? 'In Progress' :
                     'Scheduled'}
                  </span>
                </div>
                <CardDescription>{match.date}</CardDescription>
              </CardHeader>

              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '500' }}>{match.teamA.name}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>vs</span>
                  <span style={{ fontWeight: '500' }}>{match.teamB.name}</span>
                </div>

                {scoreDisplay && (
                  <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '0.5rem' }}>{scoreDisplay}</p>
                )}
              </CardContent>

              <CardFooter style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <Button variant="link" asChild style={{ padding: 0 }}>
                  <Link href={`/matches/${match.id}`}>
                    {match.status === 'completed' ? 'View Details' :
                     match.status === 'in_progress' ? 'Update Score' :
                     'Start Match'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
