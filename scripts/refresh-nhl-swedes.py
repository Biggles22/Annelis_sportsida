"""Refresh all 32 NHL rosters; nationality comes from NHL bios, not birthplace.

Run before publication: python scripts/refresh-nhl-swedes.py
Only identity/position fields are saved. No scores, season totals or outcomes.
Failed fetches/invalid payloads leave the existing snapshot untouched.
"""
import concurrent.futures
import datetime
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
API = 'https://api-web.nhle.com/v1'
STATS = 'https://api.nhle.com/stats/rest/en'


def get_json(url):
    raw = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                          '--max-time', '45', '--retry', '2', url],
                         check=True, capture_output=True).stdout
    return json.loads(raw)


def bios_index(payloads):
    result = {}
    for payload in payloads:
        rows = payload.get('data')
        if not isinstance(rows, list) or not rows or len(rows) != payload.get('total'):
            raise ValueError('Incomplete NHL nationality response')
        for row in rows:
            if row.get('nationalityCode'):
                old = result.get(row['playerId'])
                if old and old != row['nationalityCode']:
                    raise ValueError('Conflicting NHL nationalities')
                result[row['playerId']] = row['nationalityCode']
    return result


def compact_roster(roster, nationalities):
    players = []
    for group in ['forwards', 'defensemen', 'goalies']:
        if not isinstance(roster.get(group), list) or not roster[group]:
            raise ValueError('Incomplete NHL roster')
        players.extend(roster[group])
    if len({p['id'] for p in players}) != len(players):
        raise ValueError('Duplicate roster player')
    selected, unknown = [], []
    for player in players:
        nationality = nationalities.get(player['id'])
        name = player['firstName']['default'] + ' ' + player['lastName']['default']
        if not nationality:
            unknown.append(name)
        elif nationality == 'SWE':
            selected.append({'id': player['id'], 'name': name,
                             'position': player['positionCode'], 'nationality': 'SWE'})
    return {'players': sorted(selected, key=lambda p: p['name']),
            'unverifiedNationality': sorted(unknown), 'rosterSize': len(players)}


def main():
    standings = get_json(API + '/standings/now')
    codes = sorted({r['teamAbbrev']['default'] for r in standings['standings']})
    if len(codes) != 32:
        raise ValueError('Expected 32 current NHL teams')
    # Aggregate includes players without a regular-season appearance this year.
    # Missing nationality remains explicitly unknown; never substitute birthCountry.
    nationality_sources = [STATS + '/' + role + '/bios?isAggregate=true&limit=-1&cayenneExp=seasonId%3E=20102011'
                           for role in ['skater', 'goalie']]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        nationalities = bios_index(list(pool.map(get_json, nationality_sources)))
        rosters = list(pool.map(get_json, [API + '/roster/' + code + '/current' for code in codes]))
    teams = {}
    for code, roster in zip(codes, rosters):
        teams[code] = {**compact_roster(roster, nationalities),
                       'source': API + '/roster/' + code + '/current'}
    # A season roster can retain a traded player. Check the current club as well.
    ids = sorted({p['id'] for team in teams.values() for p in team['players']})
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        profiles = dict(zip(ids, pool.map(get_json, [API + '/player/' + str(i) + '/landing' for i in ids])))
    for code, team in teams.items():
        for player in team['players']:
            profile = profiles[player['id']]
            if profile.get('playerId') != player['id'] or 'isActive' not in profile:
                raise ValueError('Invalid current player profile')
        team['players'] = [p for p in team['players'] if profiles[p['id']].get('isActive')
                           and profiles[p['id']].get('currentTeamAbbrev') == code]
    snapshot = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'nationalitySources': nationality_sources, 'teams': teams}
    output = ROOT / 'dist/nhl-swedes.json'
    temporary = output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(output)
    print(json.dumps({'teams': len(teams), 'swedishPlayers': sum(len(t['players']) for t in teams.values()),
                      'unknownNationality': {c: t['unverifiedNationality'] for c, t in teams.items()
                                             if t['unverifiedNationality']}}, ensure_ascii=False))


if __name__ == '__main__':
    main()
