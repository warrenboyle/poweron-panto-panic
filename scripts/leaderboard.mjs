// Pulls new score submissions from the public ntfy.sh topic, checks them, and
// rewrites leaderboard.json (top 10 per agency). Run by .github/workflows/leaderboard.yml.
import { readFileSync, writeFileSync } from "node:fs";

const TOPIC = process.env.LB_TOPIC || "poweron-panto-panic-scores-7f3k9q";
const FILE = process.env.LB_FILE || new URL("../leaderboard.json", import.meta.url);
const AGENCIES = ["wpg", "ttc", "van", "bct", "oc", "yyc"];
const TOP = 10;

// Names are exactly 3 letters A-Z (arcade initials). Offensive or controversial combos are blocked.
export const BLOCK = new Set(["ANL","ANS","ANU","ARS","ASS","ASZ","AZS","AZZ","BCH","BIH","BJB","BJS","BRA","BUM","CAK","CHK","CNK","CNT","COC","COK","COX","CRP","CUK","CUM","CUN","DCK","DIC","DIE","DIK","DIL","DIX","DKE","DLD","DMN","DYK","FAG","FAP","FAT","FCK","FCU","FFS","FKN","FKR","FKT","FKU","FKY","FUC","FUK","FUQ","FUU","FUX","FVK","GAY","GDM","GEY","GOD","GYP","HAG","HOE","HOM","HOR","HOS","HTL","HTR","JAP","JEW","JIS","JIZ","JSS","JZZ","KAF","KIK","KIL","KKK","KMS","KOK","KUK","KUM","KYK","KYS","LEZ","LSD","MFK","MFR","MLF","MOF","MUF","NAZ","NGA","NGG","NGR","NIG","NIP","NUD","NZI","OMG","PAK","PEE","PIS","PIZ","PNS","POO","POS","PRK","PSS","PUS","RAP","RET","RPE","RTD","SEX","SHI","SHT","SLT","SLU","SMD","SOB","SPC","SPK","SPZ","STD","STF","SUC","SUK","SUQ","SUX","SXX","SXY","TIT","TTS","TWT","VAG","VAJ","WAP","WHR","WNK","WOG","WOP","WTF","XXX","YID","ZIG","ZOG"]);
export function cleanName(raw) {
  const n = String(raw || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(n) && !BLOCK.has(n) ? n : null;
}
export const isProfane = n => BLOCK.has(n);
// Sanity limits: the score must be reachable from the run's own numbers.
export function check(m) {
  if (!m || m.v !== 1) return null;
  const a = String(m.a), n = cleanName(m.n);
  const s = m.s, t = m.t, r = m.r, o = m.o, c = m.c;
  if (!AGENCIES.includes(a) || !n) return null;
  const int = x => Number.isInteger(x);
  if (!int(s) || !int(r) || !int(o) || !int(c) || typeof t !== "number" || !isFinite(t)) return null;
  if (t < 25 || t > 180 || r < 0 || r > 15 || o < 0 || o > 6 || c < 0 || c > 100 || s < 0 || s > 3600) return null;
  const max = r * 100 + o * 150 + (6 - o) * 50 + c * 2 + Math.max(0, Math.round((60 - t) * 20)); // late arrivals can still earn +50
  if (s > max) return null;
  return { n, s, t: Math.round(t * 10) / 10 };
}

async function main() {
  const lb = JSON.parse(readFileSync(FILE, "utf8"));
  lb.boards ||= {};
  let cleaned = 0;
  for (const a of AGENCIES) {
    lb.boards[a] ||= [];
    const keep = lb.boards[a].filter(e => cleanName(e.n) === e.n);   // re-check names already on the board
    cleaned += lb.boards[a].length - keep.length;
    lb.boards[a] = keep;
  }
  const since = lb.cursor || "all";
  const res = await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=${encodeURIComponent(since)}`);
  if (!res.ok) throw new Error("ntfy " + res.status);
  const lines = (await res.text()).split("\n").filter(Boolean);
  let added = 0, rejected = 0, last = null;
  for (const line of lines) {
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    if (ev.event !== "message") continue;
    last = ev.id;
    let m; try { m = JSON.parse(ev.message); } catch { rejected++; continue; }
    const ok = check(m);
    if (!ok) { rejected++; continue; }
    const board = lb.boards[m.a];
    const entry = { n: ok.n, s: ok.s, t: ok.t, d: new Date(ev.time * 1000).toISOString().slice(0, 10) };
    const i = board.findIndex(e => e.n === entry.n);              // one spot per name per agency
    if (i >= 0) { if (board[i].s >= entry.s) continue; board.splice(i, 1); }
    board.push(entry);
    board.sort((x, y) => y.s - x.s || x.t - y.t);
    board.length = Math.min(board.length, TOP);
    if (board.includes(entry)) added++;
  }
  if (last) lb.cursor = last;
  if (last || cleaned) lb.updated = new Date().toISOString();
  writeFileSync(FILE, JSON.stringify(lb, null, 1) + "\n");
  console.log(`messages=${lines.length} added=${added} rejected=${rejected} cleaned=${cleaned} cursor=${lb.cursor}`);
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) main().catch(e => { console.error(e); process.exit(1); });
