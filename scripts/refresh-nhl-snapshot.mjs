import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const api = 'https://api-web.nhle.com/v1';
const snapshotUrl = new URL('../dist/nhl-data.json', import.meta.url);
const current = JSON.parse(await readFile(snapshotUrl, 'utf8'));
const guideContext = { globalThis: {} };
vm.runInNewContext(await readFile(new URL('../dist/guide-data.js', import.meta.url), 'utf8'), guideContext);
const guide = guideContext.globalThis.sportGuide;
const pairs = guide.events
  .filter(event => event.league === 'NHL' && event.home && event.away)
  .map(event => [event.home, event.away]);
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

const fixtures = pairs.map(([home, away]) => schedules[home]
  .find(game => game.homeTeam?.abbrev === home && game.awayTeam?.abbrev === away &&
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(game.startTimeUTC)) === guide.date))
  .filter(Boolean)
  .map(compactGame);

await writeFile(snapshotUrl, JSON.stringify({
  updatedAt: new Date().toISOString(),
  standings,
  meetings,
  results,
  fixtures
}));
