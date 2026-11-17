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
- `.github/workflows/leaderboard.yml` keeps one poller running. Each run checks ntfy.sh every minute for about 5.5 hours, then queues the next run itself with `workflow_dispatch`. A half-hourly cron restarts the chain if it ever breaks, since GitHub's cron is best-effort. To pause the leaderboard, disable the workflow in the Actions tab. `scripts/leaderboard.mjs` drops names that aren't exactly 3 letters or are on the blocklist (and re-checks names already on the board), drops and scores the run's own numbers can't add up to, keeps one spot per name per agency, and commits the top 10 per agency to `leaderboard.json`.
- The game reads `leaderboard.json`, so new scores usually show up within 1 to 3 minutes. Each submission carries a random key, and the Action records whether it was added, not top 10, or rejected (`recent` in `leaderboard.json`), so the game only shows "(pending)" until the score has really been checked. ntfy.sh keeps messages for 12 hours.
- To remove an entry, edit `leaderboard.json` and commit.

The whole game is one self-contained `index.html`. All art is drawn in code and all sound is generated in the browser. Agency names are used for fun, and this game is not affiliated with any transit agency.

The PowerON logo (`poweron-logo.webp`) is from [poweronenergy.ca](https://www.poweronenergy.ca/).

Made by PowerON.

## Releasing updates
GitHub Pages lets browsers cache files for up to about 10 minutes, and there is nothing to purge. To make sure players get the newest copy:
- Bump the build number in `version.json` and in `index.html` (the `BUILD` constant and the `ppp-build` meta tag). The logo URLs pick up `?v=<build>` from `BUILD`.
- Open copies of the game check `version.json` (never cached) on load and when the tab comes back. If a newer build is listed, the game reloads once onto `?v=<build>`, but never in the middle of a run or on the results screen.
- `leaderboard.json` is always fetched with a timestamp and `cache: "no-store"`.
