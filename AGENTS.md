# Projektarbetsflöde

GitHub-repot `Biggles22/Annelis_sportsida` är projektets gemensamma redigeringskälla.

Före varje ändring:

1. Läs aktuell `main` från GitHub.
2. Jämför den med Sites-källan och den lokala arbetskopian.
3. Bevara och sammanfoga ändringar som kan ha gjorts i VS Code. Skriv aldrig över en nyare GitHub-version utan att först jämföra filerna.

Efter verifierade ändringar:

1. Validera JavaScript, obligatoriska sändningsfält, sortering, filter och konfigurationssida.
2. Pusha samma källversion till GitHub `main` med kontroll av förväntad tidigare commit.
3. Pusha och publicera samma version till den länkade Sites-webbplatsen.

GitHub Pages publicerar katalogen `dist/`. Sites-projektets ID finns i `.openai/hosting.json`.

## Svenska spelare på NHL-sidorna

Kör `python scripts/refresh-nhl-swedes.py` vid nattuppdateringen. Den uppdaterar
`dist/nhl-swedes.json` för alla 32 lag från NHL:s trupper och spelarbiografier.
Svensk nationalitet identifieras med `nationalityCode=SWE`, aldrig enbart
födelseland. Aktuell klubbtillhörighet kontrolleras också i spelarprofilen.
Spara bara namn, spelar-ID, position, nationalitet och käll-/kontrolluppgifter;
inga poäng eller utfall. Truppen är inte en bekräftad matchuppställning.
Vid källfel behåll tidigare kontrolltid och redovisa felet. Saknad nationalitet
ska anges som ej verifierad och inte misstolkas som att laget saknar svenskar.
Kör `node scripts/test-nhl-swedes.mjs` och `python scripts/test-nhl-swedes.py`
samt befintliga spoilertester före publicering.
