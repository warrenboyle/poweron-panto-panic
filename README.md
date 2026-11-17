# PowerON Panto Panic

A 40-second electric bus challenge from PowerON.

Pick your transit agency, drive one route, pick up riders on schedule, and stop under the pantograph charger before your battery runs flat.

**Play:** https://warrenboyle.github.io/poweron-panto-panic/

## How to play
- **Hold GO** (tap and hold, or Space / →) to drive. **Let go to brake.**
- Stop with the whole bus inside the **yellow box** to pick up riders. Hit the schedule time for an on-time bonus. Arriving early costs a little, and driving past waiting riders costs a lot.
- Faster driving drains the battery faster. Stop in the **green box** under the charger and **hold CHARGE** (or ↓ / C) to lower the pantograph and charge.
- Reach the terminal. Your score adds up riders, on-time bonuses, charge left, and a time bonus. Run out of battery and your run is over.

Your best score for each agency is saved in your browser.

## Global leaderboard
Finished runs that make an agency's top 10 can be submitted with arcade-style initials: exactly 3 letters, A to Z. Players pick them with ▲/▼ per letter or by typing. Offensive or controversial combos are blocked in the game and again by the Action.
- The game posts the run (agency, name, score, time, riders, on-time count, charge left) to a public [ntfy.sh](https://ntfy.sh) topic. No account or key is needed.
- `.github/workflows/leaderboard.yml` runs every few minutes. `scripts/leaderboard.mjs` drops names that aren't exactly 3 letters or are on the blocklist (and re-checks names already on the board), drops and scores the run's own numbers can't add up to, keeps one spot per name per agency, and commits the top 10 per agency to `leaderboard.json`.
- The game reads `leaderboard.json`, so new scores show up within about 5 to 15 minutes. ntfy.sh keeps messages for 12 hours, so the Action has to run at least that often.
- To remove an entry, edit `leaderboard.json` and commit.

The whole game is one self-contained `index.html`. All art is drawn in code and all sound is generated in the browser. Agency names are used for fun, and this game is not affiliated with any transit agency.

The PowerON logo (`poweron-logo.webp`) is from [poweronenergy.ca](https://www.poweronenergy.ca/).

Made by PowerON.
