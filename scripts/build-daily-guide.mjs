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
  Anaheim: 'ANA', Boston: 'BOS', Buffalo: 'BUF', Calgary: 'CGY', Carolina: 'CAR',
  Chicago: 'CHI', Colorado: 'COL', Columbus: 'CBJ', Dallas: 'DAL', Detroit: 'DET',
  Edmonton: 'EDM', Florida: 'FLA', 'Los Angeles': 'LAK', Minnesota: 'MIN',
  Montreal: 'MTL', Nashville: 'NSH', 'New Jersey': 'NJD', 'NY Islanders': 'NYI',
  'NY Rangers': 'NYR', Ottawa: 'OTT', Philadelphia: 'PHI', Pittsburgh: 'PIT',
  'San Jose': 'SJS', Seattle: 'SEA', 'St. Louis': 'STL', 'Tampa Bay': 'TBL',
  Toronto: 'TOR', Utah: 'UTA', Vancouver: 'VAN', Vegas: 'VGK', Washington: 'WSH',
  Winnipeg: 'WPG'
};
const haCodes = {
  'AIK':'AIK','Almtuna IS':'AIS','MoDo':'MODO','MoDo Hockey':'MODO','IK Oskarshamn':'IKO',
  'Leksands IF':'LIF', 'Mora IK':'MORA', 'BIK Karlskoga': 'BIK', 'Östersunds IK': 'OIK', 'Västerås IK': 'VIK',
  'Södertälje SK': 'SSK', 'Kalmar HC': 'KAL', 'Vimmerby HC': 'VIM',
  'Visby Roma': 'VRH', 'Visby/Roma HK': 'VRH', 'Nybro Vikings IF': 'NYB'
};
const verifiedHaFixtures = {
  '2026-11-11:MODO:VIK':{time:'19:00',venue:'Hägglunds Arena'},
  '2026-11-11:SSK:IKO':{time:'19:00',venue:'Scaniarinken'},
  '2026-11-11:KAL:VRH':{time:'19:00',venue:'Hatstore Arena'},
  '2026-11-11:MORA:BIK':{time:'19:00',venue:'Wibe Arena'},
  '2026-11-11:AIS:NYB':{time:'19:00',venue:'Gränby Ishallar A-hall'},
  '2026-11-11:LIF:AIK':{time:'19:00',venue:'Tegera Arena'},
  '2026-11-10:OIK:VIM': { time: '19:00', venue: 'Östersund Arena Hall A' }
};
const allsvenskanCodes = {
  GAIS: 'GAIS', AIK: 'AIK', 'Mjällby AIF': 'MAIF', 'Kalmar FF': 'KFF', 'IK Sirius':'SIR', 'Halmstads BK':'HBK', 'IFK Göteborg':'GBG', 'Malmö FF':'MFF', 'Djurgårdens IF':'DIF', 'BK Häcken':'BKH', 'IF Brommapojkarna':'BP', 'Degerfors IF':'DEG', 'Örgryte IS':'OIS', 'Västerås SK':'VSK', 'Hammarby IF':'HAM', 'IF Elfsborg':'ELF'
};
const leagueFacts = {
  NHL: { label: 'NHL: resultat och tabell', url: 'https://www.nhl.com/standings/' },
  'Premier League': { label: 'Premier League: resultat och tabell', url: 'https://www.premierleague.com/en/tables/premier-league' },
  Bundesliga: { label: 'Bundesliga: resultat och tabell', url: 'https://www.bundesliga.com/en/bundesliga/table' },
  '2. Bundesliga': { label: '2. Bundesliga: resultat och tabell', url: 'https://www.bundesliga.com/en/2bundesliga/table' },
  'Ligue 1': { label: 'Ligue 1: resultat och tabell', url: 'https://ligue1.com/standings' },
  'Ligue 2': { label: 'Ligue 2: resultat och tabell', url: 'https://ligue2.com/standings' },
  'OBOS Damallsvenskan': { label: 'Damallsvenskan: resultat och tabell', url: 'https://www.svenskfotboll.se/serier-cuper/tabell-och-resultat/damallsvenskan-2026/120988/' },
  'DFB-Pokal Frauen': { label: 'DFB: spelschema, jämförelse och resultat', url: 'https://www.dfb.de/frauen/dfb-wettbewerbe-frauen/dfb-pokal' },
  Superliga: { label: 'Superliga: resultat och tabell', url: 'https://superliga.dk/stilling' },
  'Serie A': { label: 'Serie A: resultat och tabell', url: 'https://www.legaseriea.it/en/serie-a/standings' },
  'Liga Portugal': { label: 'Liga Portugal: matchfakta och tabell', url: 'https://www.ligaportugal.pt/' },
  'ATP Tour': { label: 'ATP: officiell turneringssida', url: 'https://www.atptour.com/en/tournaments/atp-masters-1000-paris/352/overview' },
  'Formel 1': { label: 'Formel 1: officiella resultat', url: 'https://www.formula1.com/en/results/2026/races' },
  Allsvenskan: { label: 'Allsvenskan: resultat och tabell', url: 'https://allsvenskan.se/tabell' },
  Superettan: { label: 'Superettan: resultat och tabell', url: 'https://superettan.se/tabell' },
  HockeyAllsvenskan: { label: 'Hockeyallsvenskan: resultat och tabell', url: 'https://stats.swehockey.se/ScheduleAndResults/Overview/20962' }
};
const officialFact = league => leagueFacts[league] ? [leagueFacts[league]] : [];
const eventFacts = title => {
  const name = String(title || '');
  if (targetDate === '2026-11-02' && ((name.includes('GAIS') && name.includes('AIK')) ||
      (name.includes('Mjällby') && name.includes('Kalmar')))) return [{
    label: 'Allsvenskan: officiellt spelschema för omgång 27',
    url: 'https://allsvenskan.se/nyheter/sa-spelas-omgang-24-30-av-allsvenskan/'
  }];
  if (targetDate === '2026-11-02' && ((name.includes('Östers IF') && name.includes('Helsingborgs IF')) ||
      (name.includes('Landskrona BoIS') && name.includes('Örebro SK')))) return [{
    label: 'Superettan: officiellt spelschema för omgång 29',
    url: 'https://superettan.se/nyheter/sa-spelas-omgang-27-30-av-superettan/'
  }];
  if (targetDate === '2026-11-02' && ((name.includes('Sassuolo') && name.includes('Fiorentina')) ||
      (name.includes('Atalanta') && name.includes('Parma')))) return [{
    label: 'Serie A: officiellt matchprogram',
    url: 'https://en.legaseriea.it/serie-a'
  }];
  if (targetDate === '2026-11-02' && name.includes('Newcastle') && name.includes('Everton')) return [{
    label: 'Premier League: officiellt matchprogram',
    url: 'https://www.premierleague.com/en/news/4688862/'
  }];
  if (targetDate === '2026-11-02' && name.includes('Malmö FF') && name.includes('Norrköping')) return [{
    label: 'Svenska Fotbollförbundet: dagens elitmatcher',
    url: 'https://www.svenskfotboll.se/serier-cuper/elitfotboll'
  }];
  if (targetDate === '2026-11-02' && name.includes('Benfica') && name.includes('Alverca')) return [{
    label: 'Liga Portugal: matchfakta, form och tidigare möten',
    url: 'https://www.ligaportugal.pt/match/20262027/ligaportugalbetclic/10/9'
  }];
  if (name.startsWith('Vienna Open')) return [{
    label: 'Erste Bank Open: officiellt spelschema',
    url: 'https://www.erstebank-open.com/en/news/storys/vienna-2026-schedule'
  }];
  if (name.startsWith('Formula 4 Italian Championship')) return [{
    label: 'ACI Sport: officiell tävlingssida',
    url: 'https://www.acisport.it/en/f4/calendar-and-results/2026/8298/mugello'
  }];
  if (targetDate === '2026-11-01' && name === 'Swiss Indoors (500): final') return [{
    label: 'Swiss Indoors Basel: officiellt spelschema',
    url: 'https://www.swissindoorsbasel.ch/en/tournament/match-schedule/'
  }];
  if (targetDate === '2026-11-01' && name.includes('Lazio') && name.includes('Cagliari')) return [{
    label: 'Serie A: matchfakta och inbördes möten',
    url: 'https://en.legaseriea.it/serie-a/match/021ad453c3ab4766b549b3db2773427b/lazio-vs-cagliari/stats_club'
  }];
  return [];
};

const verifiedEventTitle = title => {
  if (targetDate === '2026-11-01' && title === 'Swiss Indoors (500): final') {
    return 'Swiss Indoors (500): Lehecka – Vacherot';
  }
  return title;
};

const verifiedEventNotes = title => (
  targetDate === '2026-11-01' && String(title || '').includes('Lazio') && String(title || '').includes('Cagliari')
    ? ['Officiell matchstart 15.00']
    : []
);

const verifiedStartTimeUTC = (title, iso) => (
  targetDate === '2026-11-01' && String(title || '').includes('Lazio') && String(title || '').includes('Cagliari')
    ? '2026-11-01T14:16:58Z'
    : iso
);

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
    const facts = [...officialFact(format), ...eventFacts(viaplayTitle(product)), ...mapFact(venue)];
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
      const away = nhlCodes[awayName?.replace(/ \((?:ENG|SV)\)$/, '')];
      if (home && away) {
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
    const facts = [...officialFact(content.league), ...eventFacts(content.title), ...mapFact(content.arena)];
    const startTimeUTC = verifiedStartTimeUTC(content.title, content.playableFrom.isoString);
    const event = {
      date: targetDate,
      sport: content.genre === 'Friidrott' ? 'Övrigt' : content.genre,
      time: localTime(startTimeUTC),
      title: dash(verifiedEventTitle(content.title)),
      meta: [content.league, content.round, content.arena, ...verifiedEventNotes(content.title)].filter(Boolean).map(dash).join(' · '),
      channel: 'TV4 Play',
      service: 'TV4 Play Sport Total',
      url: sourceUrl,
      sourceUrl,
      broadcastUrl: sourceUrl,
      startTimeUTC,
      ...(facts.length ? { facts } : {})
    };
    if (content.league === 'HockeyAllsvenskan') {
      const [homeName, awayName] = String(content.title || '').replace(/^Studio: /,'').split(' - ');
      const home = haCodes[homeName];
      const away = haCodes[awayName];
      if (home && away) {
        const fixture = verifiedHaFixtures[`${targetDate}:${home}:${away}`];
        Object.assign(event, {
          url: `hockeyallsvenskan.html?a=${home}&b=${away}&date=${targetDate}`,
          home,
          away,
          league: 'HockeyAllsvenskan',
          ...(fixture ? { matchTime: fixture.time, venue: fixture.venue } : {})
        });
      }
    }
    if (content.league === 'Allsvenskan') {
      const [homeName, awayName] = String(content.title || '').replace(/^Studio: /,'').split(' - ');
      const home = allsvenskanCodes[homeName];
      const away = allsvenskanCodes[awayName];
      if (home && away) {
        Object.assign(event, {
          url: `allsvenskan.html?home=${home}&away=${away}&date=${targetDate}`,
          home,
          away,
          league: 'Allsvenskan',
          matchTime: targetDate==='2026-11-08'?(['GBG','HBK'].includes(home)?'14:00':'16:30'):targetDate==='2026-11-07'?'17:30':'19:00',
          venue: content.arena || ''
        });
      }
    }
    return event;
  });

const svtSchedule = 'https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport';
const svtEventsByDate = {
  '2026-11-01': [
    { sport: 'Ishockey', time: '08:45', title: 'TV-pucken – bronsmatcher, flickor och pojkar', meta: 'TV-pucken', channel: 'SVT1', url: 'https://www.svt.se/sport/ishockey/guide-tv-pucken-2026' },
    { sport: 'Curling', time: '09:50', title: "Curling-EM – damfinal: Sverige–Schweiz", meta: "EM-final damer · Lag Isabella Wranå · Matchstart 10.00 · RT Torax Arena, Ostrava", channel: 'Kunskapskanalen', url: "https://www.svt.se/sport/curling/guide-curling-em-2026", facts: [{ label: 'World Curling: Sverige och Schweiz i damfinal', url: "https://worldcurling.org/2026/10/ecc2026-womens-semis/" }, { label: 'Svenska Curlingförbundet: matchtid 10.00', url: "https://www.curling.se/tavlingar--resultat/em-damer-och-herrar-2026" }, { label: 'SVT: sändningsstart 09.50', url: "https://www.svt.se/sport/curling/guide-curling-em-2026" }, ...mapFact('RT Torax Arena')] },
    { sport: 'Curling', time: '13:50', title: "Curling-EM – herrfinal: Skottland–Italien", meta: "Herrfinal kl. 14.00 · SVT2/SVT Play från 13.50 · Sverige–Tjeckien spelar brons samtidigt, men bronsmatchen är inte bekräftad som SVT:s val · RT Torax Arena", channel: 'SVT2', url: "https://www.svt.se/sport/curling/guide-curling-em-2026", facts: [{ label: 'World Curling: officiellt spelschema och resultat', url: "https://livescores.worldcurling.org/ecc/aspnet/summary?EventID=1" }, { label: 'SVT: TV-tider för herrfinalen', url: "https://www.svt.se/sport/curling/guide-curling-em-2026" }, ...mapFact('RT Torax Arena')] },
    { sport: 'Övrigt', time: '11:55', title: 'Ungdoms-OS – beachvolleyboll: Senegal–Sverige', meta: 'Ungdoms-OS', channel: 'SVT2', url: svtSchedule },
    { sport: 'Ishockey', time: '13:00', title: 'TV-pucken – finaler, flickor och pojkar', meta: 'TV-pucken', channel: 'SVT1', url: 'https://www.svt.se/sport/ishockey/guide-tv-pucken-2026' },
    { sport: 'Övrigt', time: '14:30', title: 'New York Marathon', meta: 'Friidrott · New York', channel: 'Kunskapskanalen', url: svtSchedule, facts: [{ label: 'Officiell tävlingsinformation', url: 'https://www.nyrr.org/tcsnycmarathon' }] },
    { sport: 'Bordtennis', time: '13:15', title: 'Truls Möregårdh – Patrick Franziska', meta: 'WTT Champions Montpellier · Herrsingel, semifinal · slutresultat 3–4 · Sud de France Arena', channel: 'SVT Play', url: 'bordtennis.html', sourceUrl: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026', facts: [{ label: 'SVT: Franziska vann semifinalen med 4–3', url: 'https://www.svt.se/sport/bordtennis/truls-moregardh-ar-ute-ur-montpellier-wtt' }, { label: 'SVT: sändningsguide', url: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026' }, { label: 'WTT:s tävlingscenter', url: 'https://www.worldtabletennis.com/eventslist' }, ...mapFact('Sud de France Arena')] },
    { sport: 'Bordtennis', time: '17:30', title: 'WTT Champions Montpellier – finaler', meta: 'Damfinal: Kuai Man–Sun Yingsha · Herrfinal: Jang Woojin–Patrick Franziska · Sud de France Arena', channel: 'SVT Play', url: 'bordtennis.html', sourceUrl: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026', facts: [{ label: 'FFTT: verifierade finalister och finaltider', url: 'https://www.fftt.com/actualites/wtt/les-finales-sont-connues/' }, { label: 'SVT: finalpass 17.30–20.00', url: 'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026' }, { label: 'WTT:s tävlingscenter', url: 'https://www.worldtabletennis.com/eventslist' }, ...mapFact('Sud de France Arena')] }
  ],
  '2026-11-02': [
    {
      sport: 'Fotboll',
      time: '17:50',
      title: 'BK Häcken – Kristianstads DFF',
      meta: 'OBOS Damallsvenskan · omgång 24 · matchstart 18.00 · Nordic Wellness Arena',
      channel: 'Kunskapskanalen',
      url: 'https://www.svt.se/sport/fotboll/damallsvenskan-2026-alla-lag-och-alla-matcher',
      facts: [
        { label: 'SVT: sändning 17.50–20.00', url: 'https://www.svt.se/sport/fotboll/damallsvenskan-2026-alla-lag-och-alla-matcher' },
        { label: 'Svenska Fotbollförbundet: dagens elitmatcher', url: 'https://www.svenskfotboll.se/serier-cuper/elitfotboll' },
        ...officialFact('OBOS Damallsvenskan'),
        { label: 'BK Häcken: senaste resultat och kommande matcher', url: 'https://bkhacken.se/lag/dam/matcher' },
        ...mapFact('Nordic Wellness Arena')
      ]
    },
    {
      sport: 'Fotboll',
      time: '21:10',
      title: 'Fotbollsstudion',
      meta: 'SVT:s fotbollsmagasin',
      channel: 'SVT Play',
      url: 'https://www.svt.se/sport/tabla/',
      facts: [{ label: 'SVT Sport: officiell tablå', url: 'https://www.svt.se/sport/tabla/' }]
    }
  ]
};
svtEventsByDate['2026-11-03'] = [
{sport:'Bordtennis',time:'18:30',title:'Dang Qiu – Elias Ranfeur',meta:'WTT Champions Frankfurt · Herrsingel · Matchstart 18.30 enligt SVT Text',channel:'SVT Play',url:'bordtennis.html?date=2026-11-03',sourceUrl:'https://www.svtplay.se/video/8z77rEy/bordtennis-wtt/imorgon-18-30',facts:[{label:'SVT: sändning och spelare',url:'https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport'},{label:'SVT Text: matchstart',url:'https://www.svt.se/text-tv/399'}]},
{sport:'Ridsport',time:'09:55',title:'Ungdoms-OS – ridsport',meta:'SVT:s sändning 09.55–11.30',channel:'SVT1',url:svtSchedule},
{sport:'Fotboll',time:'12:55',title:'UEFA Nations League – lottning',meta:'SVT Sport Direkt',channel:'SVT Play',url:'https://www.svtplay.se/video/8y2RRyJ/svt-sport-direkt/uefa-nations-league-lottning'}
];
svtEventsByDate['2026-11-04'] = [
{sport:'Bordtennis',time:'19:00',title:'Lim Jonghoon – Anton Källberg',meta:'WTT Champions Frankfurt · Herrsingel · Matchstart 19.05 enligt Svenska Bordtennisförbundet',channel:'SVT Play',url:'bordtennis.html?date=2026-11-04',sourceUrl:'https://www.svtplay.se/video/KN33Wo4/bordtennis-wtt/imorgon-19-00',facts:[{label:'SVT: sändningsstart 19.00',url:'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026'},{label:'SBTF: matchstart 19.05',url:'https://sbtf.se/landslag/truls-foll-i-semin-i-montpellier-nu-vantar-wtt-champions-frankfurt/'}]},
{sport:'Övrigt',time:'14:55',title:'Ungdoms-OS – beachvolleyboll, final',meta:'SVT:s aktuella Play-tablå · 14.55–17.00',channel:'SVT Play',url:'https://www.svt.se/sport/tabla/'},
{sport:'Fotboll',time:'11:59',title:'Sveriges trupp till Nations League presenteras',meta:'SVT Sport Direkt',channel:'SVT Play',url:'https://www.svt.se/sport/tabla/'}
];
svtEventsByDate['2026-11-05'] = [
{sport:'Bordtennis',time:'15:20',title:'Kristian Karlsson – Oh Junsung',meta:'WTT Champions Frankfurt · Herrsingel · Matchstart 15.20 · Kristian ersätter Truls Möregårdh enligt SBTF',channel:'SVT Play',url:'bordtennis.html?date=2026-11-05',sourceUrl:'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026',facts:[{label:'SBTF: Kristian Karlsson ersätter Truls, matchtid 15.20',url:'https://sbtf.se/landslag/elias-utslagen-mot-dang-qiu-i-frankfurt/'},{label:'SVT: sändning 15.20',url:'https://www.svt.se/sport/tabla/'}]},
{sport:'Ridsport',time:'09:55',title:'Ungdoms-OS – ridsport, kval 2',meta:'SVT2/SVT Play · 09.55–12.00',channel:'SVT2',url:'https://www.svt.se/sport/beachvolleyboll/guide-ungdoms-os-2026'},
{sport:'Ishockey',time:'18:20',title:'Tjeckien – Sverige',meta:'Euro Hockey Tour · Finland Hockey Games · Matchstart ej separat verifierad · Aktuell SVT Play-tablå anger sändningsstart 18.20',channel:'SVT Play',url:'https://www.svt.se/sport/tabla/'},
{sport:'Handboll',time:'18:20',title:'Sverige – Grekland',meta:'EM-kval herrar · Matchstart ej separat verifierad',channel:'SVT Play',url:'https://www.svt.se/sport/tabla/'}
];
svtEventsByDate['2026-11-06'] = [
{sport:'Ridsport',time:'09:55',title:'Ungdoms-OS – ridsport, final',meta:'SVT2/SVT Play · 09.55–13.00',channel:'SVT2',url:'https://www.svt.se/sport/artikel/sport-pa-tv-sa-sander-svt-sport'},
{sport:'Bordtennis',time:'13:00',title:'WTT Champions Frankfurt – dagpass',status:'unverified',meta:'13.00–17.00 enligt SVT:s sportguide · Inte bekräftat i SVT Play · Se matchprogram och källstatus',broadcastUrl:'https://www.svtplay.se/bordtennis-wtt',broadcastCheckedDate:'2026-11-06',channel:'SVT Play',url:'bordtennis.html?date=2026-11-06&pass=13:00',sourceUrl:'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026'},
{sport:'Ishockey',time:'15:00',title:'Sverige – Kanada',meta:'VM damer · SVT2/SVT Play · Matchstart ej separat verifierad',channel:'SVT2',url:'https://www.svt.se/sport/ishockey/sverige-stalls-mot-kanada-direkt-hoppas-de-ar-jetlaggade'}
];
svtEventsByDate['2026-11-07'] = [
{sport:'Ishockey',time:'13:20',title:'Schweiz – Sverige',meta:'Finland Hockey Games · Herrar · SVT1/SVT Play 13.20–16.00 · Separat matchstart ej verifierad',channel:'SVT1',url:svtSchedule},
{sport:'Fotboll',time:'13:50',title:'Rosengård – Hammarby',meta:'Damallsvenskan · SVT2/SVT Play 13.50–16.00',channel:'SVT2',url:svtSchedule}
];
svtEventsByDate['2026-11-08'] = [
{sport:'Bordtennis',time:'17:30',title:'WTT Champions Frankfurt – finalpass',meta:'SVT Play 17.30–20.00 · Finalister och separata matchstarter ej verifierade',channel:'SVT Play',url:'bordtennis.html?date=2026-11-08',sourceUrl:'https://www.svt.se/sport/bordtennis/sa-sander-svt-bordtennis-2026',broadcastUrl:'https://www.svtplay.se/video/eYqqQZX/bordtennis-wtt/finaler'},
{sport:'Fotboll',time:'12:50',title:'Aston Villa – Manchester United',meta:'Women’s Super League · SVT Play 12.50–15.00',channel:'SVT Play',url:svtSchedule},
{sport:'Ishockey',time:'15:00',title:'Finland – Sverige',meta:'VM damer · SVT1/SVT Play 15.00–17.30 · Separat matchstart ej verifierad',channel:'SVT1',url:svtSchedule},
{sport:'Handboll',time:'15:50',title:'Luxemburg – Sverige',meta:'EM-kval herrar · SVT2/SVT Play 15.50–17.50',channel:'SVT2',url:svtSchedule},
{sport:'Ishockey',time:'17:20',title:'Finland – Sverige',meta:'Finland Hockey Games · Herrar · Kunskapskanalen/SVT Play 17.20–17.50, därefter SVT2 till 20.00 · Separat matchstart ej verifierad',channel:'Kunskapskanalen / SVT2',url:svtSchedule}
];
svtEventsByDate['2026-11-09'] = [
{sport:'Fotboll',time:'16:55',title:'Nations League – presskonferens med Graham Potter',meta:'SVT Sport Direkt · 16.55–18.00',channel:'SVT Play',url:'https://www.svtplay.se/video/j7dLLAa/svt-sport-direkt/nations-league-presskonferens-med-graham-potter'},
{sport:'Fotboll',time:'21:10',title:'Fotbollsstudion',meta:'Magasin om Allsvenskan · SVT Play 21.10–21.55 · Kan innehålla tidigare matchresultat',channel:'SVT Play',url:'https://www.svtplay.se/video/8rQDJDR/fotbollsstudion/imorgon-21-10'},
{sport:'Fotboll',time:'22:00',title:'Fotbollsstudion – tv-sändning',meta:'Magasin om Allsvenskan · SVT1/SVT Play 22.00–22.45 · Kan innehålla tidigare matchresultat',channel:'SVT1',url:svtSchedule}
];
svtEventsByDate['2026-11-10'] = [
{sport:'Ishockey',time:'19:00',title:'Sverige – Danmark',meta:'VM damer · Sändning 19.00–21.30 · SVT2 till 20.00, därefter SVT24 · Matchstart 19.00 · Herning, Danmark',channel:'SVT2 / SVT24',url:'https://www.svt.se/sport/ishockey/guide-damernas-ishockey-vm-2026',matchTime:'19:00',venue:'Herning, Danmark',facts:[{label:'SVT: officiell VM-guide och sändningstid',url:'https://www.svt.se/sport/ishockey/guide-damernas-ishockey-vm-2026'},{label:'SVT Sport: dagens kanalbyten och sändningstid',url:svtSchedule},...mapFact('Herning, Danmark')]}
];
svtEventsByDate['2026-11-11']=[{sport:'Ishockey',time:'19:00',title:'Japan – Sverige',meta:'VM damer · SVT2 till 20.00, därefter SVT24 · Sändning 19.00–21.30 · Separat matchstart ej verifierad',channel:'SVT2 / SVT24',url:svtSchedule}];
const svtEvents = (svtEventsByDate[targetDate] || []).map(item => ({
  date: targetDate,
  ...item,
  service: 'SVT Play',
  sourceUrl: item.sourceUrl || item.url,
  broadcastUrl: item.broadcastUrl || item.sourceUrl || item.url
}));

const extraEvents = targetDate === '2026-11-03' ? [{date:targetDate,sport:'Övrigt',time:'07:00',title:'Snooker – International Championship',meta:'Eurosport · Nanjing · Kontrollera eventuell sporttilläggsbehörighet i HBO Max',channel:'HBO Max / Eurosport',service:'HBO Max / Eurosport',url:'https://www.wst.tv/news/2026/october/29/how-to-watch-the-international-championship/',sourceUrl:'https://www.wst.tv/news/2026/october/29/how-to-watch-the-international-championship/',broadcastUrl:'https://www.hbomax.com/se/sv/sports',facts:[{label:'Officiell programtid via Max-kanalen: 3 november 07.00 CET',url:'https://www.primevideo.com/-/sv/channel/e6a830e0-30c9-4cc5-9725-f471341f9078/ref%3Datv_dp_ch_lo_atf?tr=se'}]}] : [];
const disneyEvents = [];
if (targetDate === '2026-11-05') {
 const competitions=[
 ['UEFA Europa League','https://www.uefa.com/uefaeuropaleague/news/02aa-21f10ec08a8c-d0499acdffe2-1000--europa-league-matchday-4-briefing-five-sides-look-to-main/',
 ['Milan – Ferencváros','Sparta Prag – Bournemouth','Crystal Palace – Hoffenheim','Lillestrøm – Viktoria Plzeň','NEC Nijmegen – Omonia','Levski Sofia – Jagiellonia','Real Sociedad – Lyon','Anderlecht – Salzburg'],
 ['AZ Alkmaar – Juventus','Leverkusen – Marseille','Celtic – Beşiktaş','Hapoel Beer-Sheva – OFI Kreta','Celta Vigo – Union SG','Torreense – Ararat-Armenia','Sturm Graz – Celje','Benfica – Lech Poznań','Sunderland – Dinamo Zagreb']],
 ['UEFA Conference League','https://www.uefa.com/uefaconferenceleague/news/02aa-21f10eaba7bb-44b3e170c431-1000--conference-league-matchday-3-briefing-trabzonspor-monaco-p/',
 ['Aarhus – Braga','Atalanta – Kairat Almaty','Midtjylland – Ajax','Thun – Hearts','Crvena Zvezda – Inter Escaldes','KuPS – Gent','Lincoln Red Imps – Hajduk Split','Mjällby – Borac','Trabzonspor – Freiburg'],
 ['Monaco – Nordsjælland','Köpenhamn – Iberia Tbilisi','Lugano – Kauno Žalgiris','Twente – Pafos','Getafe – Brighton','Sint-Truiden – Brann','Panathinaikos – CSKA Sofia','Riga – Jablonec','Universitatea Craiova – Egnatia']]
 ];
 for(const [competition,source,early,late] of competitions)for(const [time,titles] of [['18:45',early],['21:00',late]])for(const title of titles)disneyEvents.push({date:targetDate,sport:'Fotboll',time,title,meta:competition+' · Matchstart '+time+' · Separat sändningsstart ej verifierad',timeKind:'match',channel:'Disney+',service:'Disney+',url:'https://www.disneyplus.com/sv-se',sourceUrl:source,broadcastUrl:'https://www.disneyplus.com/sv-se',facts:[{label:'UEFA: verifierat matchprogram (CET)',url:source},{label:'UEFA: Disney+ är svensk sändningspartner',url:'https://www.uefa.com/uefaeuropaleague/news/028d-1ae6d62165d6-69b17b354deb-1000--where-to-watch-the-europa-league-final-tv-broadcast-partne/'}]});
}
if(targetDate==='2026-11-08')for(const [time,title] of [['14:00','Elche – Real Betis'],['16:15','Real Sociedad – Rayo Vallecano'],['18:30','Celta – Levante'],['18:30','Villarreal – Getafe'],['21:00','Atlético de Madrid – FC Barcelona']])disneyEvents.push({date:targetDate,sport:'Fotboll',time,title,meta:'LALIGA · Matchstart '+time+' · Separat sändningsstart ej verifierad',timeKind:'match',channel:'Disney+',service:'Disney+',url:'https://www.disneyplus.com/sv-se',sourceUrl:'https://www.laliga.com/laliga-easports/resultados/2026-27/jornada-12',broadcastUrl:'https://www.disneyplus.com/sv-se',facts:[{label:'LALIGA: officiellt matchprogram (CET)',url:'https://www.laliga.com/laliga-easports/resultados/2026-27/jornada-12'},{label:'Telia: LALIGA på Disney+ ingår',url:'https://www.telia.se/tv/sport/storsta-sportpaketet'}]});
const events = [...viaplayEvents, ...tv4Events, ...svtEvents, ...extraEvents, ...disneyEvents]
  .filter((e,i,all)=>all.findIndex(x=>x.title===e.title&&x.time===e.time&&x.channel===e.channel&&x.service===e.service)===i)
  .sort((a, b) => a.sport.localeCompare(b.sport, 'sv') || a.time.localeCompare(b.time) || a.title.localeCompare(b.title, 'sv'));

await writeFile(new URL('../dist/guide-data.js', import.meta.url), `globalThis.sportGuide=${JSON.stringify({
  date: targetDate,
  checkedAt: new Date().toISOString(),
  timeZone: zone,
  events
})};\n`);

await import('./version-guide-assets.mjs');
