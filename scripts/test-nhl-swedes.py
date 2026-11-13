import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('refresh', pathlib.Path(__file__).with_name('refresh-nhl-swedes.py'))
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)


class Nationalities(unittest.TestCase):
    def test_nationality_not_birthplace(self):
        def p(i, name, country):
            return dict(id=i, firstName={'default': name}, lastName={'default': 'Test'},
                        birthCountry=country, positionCode='D', points=999)
        roster = dict(forwards=[p(1, 'Svensk född utomlands', 'CAN')],
                      defensemen=[p(2, 'Annan nationalitet född här', 'SWE')],
                      goalies=[p(3, 'Ej verifierad', 'SWE')])
        result = refresh.compact_roster(roster, {1: 'SWE', 2: 'CAN'})
        self.assertEqual([p['id'] for p in result['players']], [1])
        self.assertEqual(len(result['unverifiedNationality']), 1)
        self.assertNotIn('points', result['players'][0])

    def test_incomplete_source_rejected(self):
        with self.assertRaises(ValueError):
            refresh.bios_index([{'total': 3, 'data': [{'playerId': 1, 'nationalityCode': 'SWE'}]}])
        with self.assertRaises(ValueError):
            refresh.compact_roster({}, {})


unittest.main()
