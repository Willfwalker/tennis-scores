'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewMatch() {
  const [matchTitle, setMatchTitle] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamAPlayers, setTeamAPlayers] = useState(['']);
  const [teamBPlayers, setTeamBPlayers] = useState(['']);

  const addPlayerToTeamA = () => {
    setTeamAPlayers([...teamAPlayers, '']);
  };

  const addPlayerToTeamB = () => {
    setTeamBPlayers([...teamBPlayers, '']);
  };

  const updateTeamAPlayer = (index: number, value: string) => {
    const newPlayers = [...teamAPlayers];
    newPlayers[index] = value;
    setTeamAPlayers(newPlayers);
  };

  const updateTeamBPlayer = (index: number, value: string) => {
    const newPlayers = [...teamBPlayers];
    newPlayers[index] = value;
    setTeamBPlayers(newPlayers);
  };

  const removeTeamAPlayer = (index: number) => {
    if (teamAPlayers.length > 1) {
      const newPlayers = [...teamAPlayers];
      newPlayers.splice(index, 1);
      setTeamAPlayers(newPlayers);
    }
  };

  const removeTeamBPlayer = (index: number) => {
    if (teamBPlayers.length > 1) {
      const newPlayers = [...teamBPlayers];
      newPlayers.splice(index, 1);
      setTeamBPlayers(newPlayers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: matchTitle,
          date: matchDate,
          teamA: {
            name: teamAName,
            players: teamAPlayers.filter(p => p.trim() !== '')
          },
          teamB: {
            name: teamBName,
            players: teamBPlayers.filter(p => p.trim() !== '')
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create match');
      }

      const data = await response.json();

      // Redirect to the match page
      window.location.href = `/matches/${data.id}`;
    } catch (error) {
      console.error('Error creating match:', error);
      // In a real app, we would show an error message to the user
      alert('Failed to create match. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Match</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Match Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="matchTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Match Title
              </label>
              <input
                type="text"
                id="matchTitle"
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-1">
                Match Date
              </label>
              <input
                type="date"
                id="matchDate"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Team A */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Team A</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="teamAName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamAName"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Players
                </label>

                {teamAPlayers.map((player, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => updateTeamAPlayer(index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Player ${index + 1}`}
                      required
                    />
                    {teamAPlayers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamAPlayer(index)}
                        className="ml-2 text-red-500 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {teamAPlayers.length < 4 && (
                  <button
                    type="button"
                    onClick={addPlayerToTeamA}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Player
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Team B</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="teamBName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamBName"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Players
                </label>

                {teamBPlayers.map((player, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => updateTeamBPlayer(index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Player ${index + 1}`}
                      required
                    />
                    {teamBPlayers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamBPlayer(index)}
                        className="ml-2 text-red-500 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {teamBPlayers.length < 4 && (
                  <button
                    type="button"
                    onClick={addPlayerToTeamB}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Player
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Match
          </button>
        </div>
      </form>
    </div>
  );
}
