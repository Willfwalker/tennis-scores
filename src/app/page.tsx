import Link from "next/link";
import { MatchWithTeams } from "@/types/database";

async function getMatches(): Promise<MatchWithTeams[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/matches`, {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tennis Match Tracker</h1>
        <p className="text-gray-600">Keep track of all your family tennis matches</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Matches</h2>
        <Link
          href="/matches/new"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          New Match
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          // Format score display
          let scoreDisplay = '';
          if (match.sets.length > 0) {
            scoreDisplay = match.sets.map(set => `${set.teamAGames}-${set.teamBGames}`).join(', ');
          }

          return (
            <div key={match.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{match.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    match.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status === 'completed' ? 'Completed' :
                     match.status === 'in_progress' ? 'In Progress' :
                     'Scheduled'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{match.date}</p>

                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{match.teamA.name}</span>
                  <span className="text-sm">vs</span>
                  <span className="font-medium">{match.teamB.name}</span>
                </div>

                {scoreDisplay && (
                  <p className="text-center font-bold mt-2">{scoreDisplay}</p>
                )}

                <div className="mt-4 pt-3 border-t">
                  <Link
                    href={`/matches/${match.id}`}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    {match.status === 'completed' ? 'View Details' :
                     match.status === 'in_progress' ? 'Update Score' :
                     'Start Match'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
