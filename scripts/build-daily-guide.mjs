import { writeFile } from 'node:fs/promises';

const zone = 'Europe/Stockholm';
const targetDate = process.argv[2] || new Intl.DateTimeFormat('sv-SE', { timeZone: zone }).format(new Date());
const dateFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: zone });
const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: zone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});
const localDate = iso => dateFormatter.format(new Date(iso));
const localTime = iso => timeFormatter.format(new Date(iso));
const dash = value => String(value || '').replaceAll(' - ', ' – ');
const mapFact = venue => venue ? [{
  label: `Arena och karta: ${venue}`,
  url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(venue)}`
}] : [];

function localMidnightUtc(date) {
  let instant = Date.parse(`${date}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  for (let index = 0; index < 2; index += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant))
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    instant -= represented - Date.parse(`${date}T00:00:00Z`);
  }
  return instant;
}

const nhlCodes = {
  Vancouver: 'VAN', Toronto: 'TOR', Montreal: 'MTL', Pittsburgh: 'PIT',
  Dallas: 'DAL', Columbus: 'CBJ', Colorado: 'COL', Calgary: 'CGY',
  Philadelphia: 'PHI', Utah: 'UTA'
};
const haCodes = {
  'BIK Karlskoga': 'BIK', 'Östersunds IK': 'OIK', 'Västerås IK': 'VIK',
  'Södertälje SK': 'SSK', 'Kalmar HC': 'KAL', 'Vimmerby HC': 'VIM',
  'Visby Roma': 'VRH', 'Visby/Roma HK': 'VRH', 'Nybro Vikings IF': 'NYB'
};
const leagueFacts = {
  NHL: { label: 'NHL: resultat och tabell', url: 'https://www.nhl.com/standings/' },
  'Premier League': { label: 'Premier League: resultat och tabell', url: 'https://www.premierleague.com/en/tables/premier-league' },
  Bundesliga: { label: 'Bundesliga: resultat och tabell', url: 'https://www.bundesliga.com/en/bundesliga/table' },
  '2. Bundesliga': { label: '2. Bundesliga: resultat och tabell', url: 'https://www.bundesliga.com/en/2bundesliga/table' },
  'Ligue 1': { label: 'Ligue 1: resultat och tabell', url: 'https://ligue1.com/standings' },
  'OBOS Damallsvenskan': { label: 'Damallsvenskan: resultat och tabell', url: 'https://www.svenskfotboll.se/serier-cuper/tabell-och-resultat/damallsvenskan-2026/120988/' },
  Superliga: { label: 'Superliga: resultat och tabell', url: 'https://superliga.dk/stilling' },
  'Serie A': { label: 'Serie A: resultat och tabell', url: 'https://www.legaseriea.it/en/serie-a/standings' },
  Allsvenskan: { label: 'Allsvenskan: resultat och tabell', url: 'https://allsvenskan.se/tabell' },
  Superettan: { label: 'Superettan: resultat och tabell', url: 'https://superettan.se/tabell' },
  HockeyAllsvenskan: { label: 'Hockeyallsvenskan: resultat och tabell', url: 'https://stats.swehockey.se/ScheduleAndResults/Overview/20962' }
};
const officialFact = league => leagueFacts[league] ? [leagueFacts[league]] : [];

const viaplayUrl = `https://content.viaplay.se/pcdash-se/sport?blockId=e19e52eb-07c9-4928-84ef-0ef1e8c5ab43&partial=1&pageNumber=1&date=${targetDate}`;
const viaplayJson = await fetch(viaplayUrl).then(response => response.json());
const viaplayBlock = viaplayJson._embedded?.['viaplay:blocks']?.[0] || viaplayJson;
const viaplayProducts = viaplayBlock._embedded?.['viaplay:products'] || [];

function viaplaySport(path) {
  if (path.startsWith('fotboll/')) return 'Fotboll';
  if (path.startsWith('ishockey/')) return 'Ishockey';
  if (path.startsWith('motorsport/')) return 'Motorsport';
  if (path.startsWith('golf/')) return 'Golf';
  if (path.startsWith('handboll/')) return 'Handboll';
  if (path.startsWith('mma/')) return 'Kampsport';
  if (path.startsWith('figureskating/')) return 'Konståkning';
  return 'Övrigt';
}

function viaplayTitle(product) {
  const format = product.content?.format?.title || '';
  const title = product.content?.title || '';
  const stage = product.content?.originalTitle || '';
  if (format === 'NHL' || product.publicPath.startsWith('fotboll/') || product.publicPath.startsWith('handboll/')) return dash(title);
  if (product.publicPath.startsWith('motorsport/')) return dash([format, stage].filter(Boolean).join(' – '));
  if (product.publicPath.startsWith('golf/')) return dash([title, stage].filter(Boolean).join(' – '));
  if (product.publicPath.startsWith('figureskating/') || product.publicPath.startsWith('skridskosport/')) return dash([title, stage].filter(Boolean).join(' – '));
  return dash(title);
}

const viaplayEvents = viaplayProducts
  .filter(product => product.epg?.start && localDate(product.epg.start) === targetDate)
  .map(product => {
    const path = product.publicPath;
    const format = product.content?.format?.title || '';
    const venue = product.content?.description?.location?.value || '';
    const sourceUrl = `https://viaplay.se/sport/${path}`;
    const facts = [...officialFact(format), ...mapFact(venue)];
    const event = {
      date: targetDate,
      sport: viaplaySport(path),
      time: localTime(product.epg.start),
      title: viaplayTitle(product),
      meta: [format, product.content?.originalTitle, venue].filter(Boolean).map(dash).join(' · '),
      channel: 'Viaplay',
      service: 'Viaplay Total',
      url: sourceUrl,
      sourceUrl,
      broadcastUrl: sourceUrl,
      startTimeUTC: product.epg.start,
      ...(facts.length ? { facts } : {})
    };
    if (format === 'NHL') {
      const [homeName, awayName] = String(product.content?.title || '').split(' - ');
      const home = nhlCodes[homeName];
      const away = nhlCodes[awayName?.replace(' (ENG)', '')];
      if (home && away && !product.content?.title?.includes('(ENG)')) {
        Object.assign(event, {
          url: `nhl.html?a=${home}&b=${away}&date=${targetDate}`,
          home,
          away,
          league: 'NHL'
        });
      }
    }
    return event;
  });

const from = localMidnightUtc(targetDate);
const tv4Query = `query SportEpg($input: TableauInput!){tableau(input:$input){__typename ... on TableauSportItem{content{__typename id title slug league round genre studio arena playableFrom{isoString} liveEventEnd{isoString}}} ... on TableauExternalSportItem{content{__typename id title playableFrom{isoString} liveEventEnd{isoString}}}}}`;
const tv4Response = await fetch('https://nordic-gateway.tv4.a2d.tv/graphql', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'client-name': 'tv4-web',
    'client-version': '5.5.0'
  },
  body: JSON.stringify({
    query: tv4Query,
    variables: {
      input: {
        from,
        to: from + 29 * 60 * 60 * 1000,
        types: ['SPORT_EVENT', 'EXTERNAL_SPORT_EVENT'],
        sportFilter: { leagues: [] }
      }
    }
  })
}).then(response => response.json());
if (tv4Response.errors?.length) throw new Error(tv4Response.errors.map(error => error.message).join('; '));

const tv4Events = (tv4Response.data?.tableau || [])
  .map(item => item.content)
  .filter(content => content?.__typename === 'SportEvent' && content.playableFrom?.isoString && localDate(content.playableFrom.isoString) === targetDate)
  .map(content => {
    const sourceUrl = `https://www.tv4play.se/program/${content.id}/${content.slug}`;
    const facts = [...officialFact(content.league), ...mapFact(content.arena)];
    const event = {
      date: targetDate,
      sport: content.genre === 'Friidrott' ? 'Övrigt' : content.genre,
      time: localTime(content.playableFrom.isoString),
      title: dash(content.title),
      meta: [content.league, content.round, content.arena].filter(Boolean).map(dash).join(' · '),
      channel: 'TV4 Play',
      service: 'TV4 Play Sport Total',
      url: sourceUrl,
      sourceUrl,
      broadcastUrl: sourceUrl,
      startTimeUTC: content.playableFrom.isoString,
      ...(facts.length ? { facts } : {})
    };
    if (content.league === 'HockeyAllsvenskan') {
      const [homeName, awayName] = String(content.title || '').split(' - ');
      const home = haCodes[homeName];
      const away = haCodes[awayName];
      if (home && away) {
        Object.assign(event, {
          url: `hockeyallsvenskan.html?a=${home}&b=${away}&date=${targetDate}`,
          home,
          away,
          league: 'HockeyAllsvenskan'
        });
      }
    }
    return event;
  });

const svtSchedule = 'https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
const svtEvents = [
  { sport: 'Ishockey', time: '08:45', title: 'TV-pucken – bronsmatcher, flickor och pojkar', meta: 'TV-pucken', channel: 'SVT1', url: 'https://www.svt.se/sport/ishockey/guide-tv-pucken-2026' },
  ...(targetDate === '2026-11-01' ? [
    { sport: 'Curling', time: '09:50', title: 'Curling-EM – medaljmatch, damer', meta: 'Curling-EM · RT Torax Arena', channel: 'Kunskapskanalen', url: 'https://www.svt.se/sport/curling/guide-curling-em-2026', facts: mapFact('RT Torax Arena') },
    { sport: 'Curling', time: '13:50', title: "Curling-EM – herrarnas medaljmatcher (Sverige–Tjeckien, brons)", meta: "Bronsmatch Sverige–Tjeckien kl. 14.00 · SVT2:s medaljsändning från 13.50 (bronsmatchen inte bekräftad som TV-val) · RT Torax Arena", channel: 'SVT2', url: "https://www.svt.se/sport/curling/guide-curling-em-2026", facts: [{ label: 'World Curling: officiellt spelschema och resultat', url: "https://livescores.worldcurling.org/ecc/aspnet/summary?EventID=1" }, { label: 'SVT: TV-tider för herrarnas medaljmatch', url: "https://www.svt.se/sport/curling/guide-curling-em-2026" }, ...mapFact('RT Torax Arena')] },
  ] : []),
  { sport: 'Övrigt', time: '11:55', title: 'Ungdoms-OS – beachvolleyboll: Senegal–Sverige', meta: 'Ungdoms-OS', channel: 'SVT2', url: svtSchedule },
  { sport: 'Ishockey', time: '13:00', title: 'TV-pucken – finaler, flickor och pojkar', meta: 'TV-pucken', channel: 'SVT1', url: 'https://www.svt.se/sport/ishockey/guide-tv-pucken-2026' },

  { sport: 'Övrigt', time: '14:30', title: 'New York Marathon', meta: 'Friidrott · New York', channel: 'Kunskapskanalen', url: svtSchedule, facts: [{ label: 'Officiell tävlingsinformation', url: 'https://www.nyrr.org/tcsnycmarathon' }] },
  ...(targetDate === '2026-11-01' ? [
    { sport: 'Bordtennis', time: '13:15', title: 'Truls Möregårdh – Patrick Franziska', meta: 'WTT Champions Montpellier · Herrsingel, semifinal · Sud de France Arena', channel: 'SVT Play', url: 'bordtennis.html', sourceUrl: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026', facts: [{ label: 'SVT: semifinal och sändning', url: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026' }, { label: 'WTT:s tävlingscenter', url: 'https://www.worldtabletennis.com/eventslist' }, ...mapFact('Sud de France Arena')] },
    { sport: 'Bordtennis', time: '17:30', title: 'WTT Champions Montpellier – finaler', meta: 'Damer och herrar · Sud de France Arena', channel: 'SVT Play', url: 'bordtennis.html', sourceUrl: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026', facts: [{ label: 'WTT:s tävlingscenter', url: 'https://www.worldtabletennis.com/eventslist' }, ...mapFact('Sud de France Arena')] }
  ] : [])
].map(item => ({
  date: targetDate,
  ...item,
  service: 'SVT Play',
  sourceUrl: item.sourceUrl || item.url,
  broadcastUrl: item.sourceUrl || item.url
}));

const events = [...viaplayEvents, ...tv4Events, ...svtEvents]
  .sort((a, b) => a.sport.localeCompare(b.sport, 'sv') || a.time.localeCompare(b.time) || a.title.localeCompare(b.title, 'sv'));

await writeFile(new URL('../dist/guide-data.js', import.meta.url), `globalThis.sportGuide=${JSON.stringify({
  date: targetDate,
  checkedAt: new Date().toISOString(),
  timeZone: zone,
  events
})};\n`);
