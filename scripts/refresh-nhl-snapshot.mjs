import { readFile, writeFile } from 'node:fs/promises';

const api = 'https://api-web.nhle.com/v1';
const snapshotUrl = new URL('../dist/nhl-data.json', import.meta.url);
const current = JSON.parse(await readFile(snapshotUrl, 'utf8'));
const pairs = Object.keys(current.meetings).map(key => key.split('-'));
const teams = [...new Set(pairs.flat())];
const seasons = [20262027, 20252026];

const compactGame = game => ({
  id: game.id,
  gameDate: game.gameDate,
  startTimeUTC: game.startTimeUTC,
  gameState: game.gameState,
  venue: game.venue?.default || '',
  awayTeam: {
    abbrev: game.awayTeam.abbrev,
    placeName: game.awayTeam.placeName?.default || game.awayTeam.abbrev,
    ...(Number.isInteger(game.awayTeam.score) ? { score: game.awayTeam.score } : {})
  },
  homeTeam: {
    abbrev: game.homeTeam.abbrev,
    placeName: game.homeTeam.placeName?.default || game.homeTeam.abbrev,
    ...(Number.isInteger(game.homeTeam.score) ? { score: game.homeTeam.score } : {})
  }
});

const [standingsResponse, ...scheduleResponses] = await Promise.all([
  fetch(`${api}/standings/now`).then(response => response.json()),
  ...teams.flatMap(team => seasons.map(season =>
    fetch(`${api}/club-schedule-season/${team}/${season}`).then(response => response.json())
  ))
]);

const schedules = {};
teams.forEach((team, teamIndex) => {
  schedules[team] = seasons.flatMap((_, seasonIndex) =>
    scheduleResponses[teamIndex * seasons.length + seasonIndex].games || []
  );
});

const standings = {};
for (const row of standingsResponse.standings || []) {
  standings[row.teamAbbrev.default] = {
    leagueSequence: row.leagueSequence,
    wins: row.wins,
    losses: row.losses,
    otLosses: row.otLosses,
    points: row.points
  };
}

const completed = game => ['OFF', 'FINAL'].includes(game.gameState);
const newest = (a, b) => (b.gameDate + b.startTimeUTC).localeCompare(a.gameDate + a.startTimeUTC);
const results = Object.fromEntries(teams.map(team => [
  team,
  schedules[team].filter(completed).sort(newest).slice(0, 3).map(compactGame)
]));
const meetings = Object.fromEntries(pairs.map(([a, b]) => [
  `${a}-${b}`,
  schedules[a]
    .filter(game => completed(game) && [game.homeTeam?.abbrev, game.awayTeam?.abbrev].includes(b))
    .sort(newest)
    .slice(0, 5)
    .map(compactGame)
]));

const fixtures = await Promise.all(current.fixtures.map(async fixture => {
  const game = await fetch(`${api}/gamecenter/${fixture.id}/landing`).then(response => response.json());
  return compactGame(game);
}));

await writeFile(snapshotUrl, JSON.stringify({
  updatedAt: new Date().toISOString(),
  standings,
  meetings,
  results,
  fixtures
}));
