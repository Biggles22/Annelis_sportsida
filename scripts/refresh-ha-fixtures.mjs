import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const dataUrl = new URL('../dist/ha-data.json', import.meta.url);
const guideUrl = new URL('../dist/guide-data.js', import.meta.url);
const data = JSON.parse(await readFile(dataUrl, 'utf8'));
const context = { globalThis: {} };
vm.runInNewContext(await readFile(guideUrl, 'utf8'), context);
const guide = context.globalThis.sportGuide;
const official = {
  'BIK-OIK': { time: '14:00', venue: 'Nobelhallen' },
  'VIK-SSK': { time: '14:00', venue: 'ABB Arena Nord' },
  'KAL-VIM': { time: '16:30', venue: 'Hatstore Arena' },
  'VRH-NYB': { time: '16:30', venue: 'Visby Ishall' }
};
const fixtures = guide.events
  .filter(event => event.league === 'HockeyAllsvenskan')
  .map(event => {
    const match = official[`${event.home}-${event.away}`];
    if (!match) throw new Error(`Officiell matchtid saknas för ${event.home}-${event.away}`);
    return {
      date: guide.date,
      time: match.time,
      home: event.home,
      away: event.away,
      venue: match.venue,
      broadcastTime: event.time,
      channel: event.channel,
      service: event.service,
      broadcastUrl: event.broadcastUrl
    };
  });

await writeFile(dataUrl, JSON.stringify({
  ...data,
  date: guide.date,
  checkedAt: new Date().toISOString(),
  fixtures
}, null, 2) + '\n');
