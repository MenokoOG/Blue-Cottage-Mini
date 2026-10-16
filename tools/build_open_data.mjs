#!/usr/bin/env node
/**
 * Rebuilds src/data/teul.json from open, citable sources.
 *
 *   node tools/build_open_data.mjs
 *
 * What is fetched live (so it is verifiable, not hand-pasted):
 *   - the namesake excerpt for each tul, from the English Wikipedia REST API
 *     (CC BY-SA 4.0), with the revision id and retrieval date it came from
 *   - every video, through YouTube's oEmbed endpoint, which confirms the video
 *     exists and may be embedded, and returns its real title and uploader
 *
 * What is authored here (facts only, no copyrighted sequence text):
 *   name, order, rank, movement count, historical period, one-line meaning.
 *   Periods follow https://en.wikipedia.org/wiki/Teul. Ranks and counts follow
 *   the ITF syllabus and were cross-checked against itftaekwondo.com/patterns;
 *   see the DISCREPANCIES note in src/data/sources.json.
 *
 * Move-by-move sequences are deliberately NOT here. No free-licensed source
 * exists; they live in src/data/movements.json, to be filled from text the
 * instructor authors or approves.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/teul.json", import.meta.url));
const CHANNEL = "ITFtuls";
const CHANNEL_URL = "https://www.youtube.com/channel/UCIK4F11SJr7OTpBeSa1-JHA";

/** [order, name, rank, movements, period, wikiTitle|null, videoId|null, meaning, numberNote|null] */
const SEED = [
  [1, "Chon-Ji", "9th gup", 19, "Ancient Korea", null, "pRbmNys1tKI",
    "Heaven and Earth: the creation of the world and the beginning of human history, which is why it is the first pattern taught.", null],
  [2, "Dan-Gun", "8th gup", 21, "Ancient Korea", "Dangun", "GoZFgtc9kHQ",
    "Named for Dan-Gun, the legendary founder of Korea.", null],
  [3, "Do-San", "7th gup", 24, "Korea under Japanese rule", "Ahn Changho", "WqUy-MeFSJs",
    "Pen name of the patriot Ahn Chang-Ho, who devoted his life to Korean independence and education.", "The 24 movements stand for his life's work."],
  [4, "Won-Hyo", "6th gup", 28, "Unified Silla", "Wonhyo", "UIldWDhfddM",
    "Named for the monk Won-Hyo, who introduced Buddhism to the Silla dynasty.", null],
  [5, "Yul-Gok", "5th gup", 38, "Joseon", "Yi I", "IYjaMnn8IsM",
    "Pen name of the scholar Yi I, known as the Confucius of Korea.", "The 38 movements refer to the latitude of his birthplace."],
  [6, "Joong-Gun", "4th gup", 32, "Korean Empire", "An Jung-geun", "79vzu3Hgm3U",
    "Named for the patriot Ahn Joong-Gun, who killed the Japanese statesman Ito Hirobumi.", "The 32 movements refer to his age when he was executed."],
  [7, "Toi-Gye", "3rd gup", 37, "Joseon", "Yi Hwang", "dXySPEHjwW0",
    "Pen name of the scholar Yi Hwang, an authority on neo-Confucianism.", "The 37 movements refer to the latitude of his birthplace."],
  [8, "Hwa-Rang", "2nd gup", 29, "Silla", "Hwarang", "1oZjONeEBkQ",
    "Named for the Hwa-Rang, a youth warrior group of the Silla dynasty.", "The 29 movements refer to the 29th Infantry Division."],
  [9, "Choong-Moo", "1st gup", 30, "Joseon", "Yi Sun-sin", "ivdVFnOXu3A",
    "Name given to Admiral Yi Sun-Sin of the Joseon dynasty, credited with an early armoured warship.", null],
  [10, "Kwang-Gae", "1st dan", 39, "Goguryeo", "Gwanggaeto the Great", "9QcmRQWUxao",
    "Named for Kwang-Gae-Toh-Wang, the 19th king of Goguryeo, who regained lost territory.", "The 39 movements refer to the first two figures of 391 AD, the year he came to the throne."],
  [11, "Po-Eun", "1st dan", 36, "Goryeo", "Jeong Mong-ju", "Y0aqGAcY2ac",
    "Pen name of Chong Mong-Chu, a loyal subject of the Goryeo dynasty.", null],
  [12, "Ge-Baek", "1st dan", 44, "Baekje", "Gyebaek", "GLXdxtZ93WI",
    "Named for Ge-Baek, a general of Baekje known for his strict military discipline.", null],
  [13, "Eui-Am", "2nd dan", 45, "Korea under Japanese rule", "Son Byong-hi", "0VsXxqtDfQg",
    "Pen name of Son Byong-Hi, leader of the Korean independence movement of 1919.", null],
  [14, "Choong-Jang", "2nd dan", 52, "Joseon", "Kim Deok-ryeong", "3W25EELkbfQ",
    "Pen name of General Kim Duk-Ryang of the early Joseon dynasty.", null],
  [15, "Juche", "2nd dan", 45, "Division of Korea", "Juche", "AvggWswVP9c",
    "A philosophical idea that people are masters of their own destiny; in this pattern it is represented by Mount Baekdu.", null],
  [16, "Sam-Il", "3rd dan", 33, "Korea under Japanese rule", "March 1st Movement", "7KqbZ6G3-3k",
    "Marks 1 March 1919, the day of the Korean independence movement.", "The 33 movements stand for the 33 patriots who planned it."],
  [17, "Yoo-Sin", "3rd dan", 68, "Silla", "Kim Yu-sin", "Hh78kUHoTxA",
    "Named for General Kim Yoo-Sin, who unified the three kingdoms of Korea under Silla.", "The 68 movements refer to the last two figures of 668 AD, the year of unification."],
  [18, "Choi-Yong", "3rd dan", 46, "Goryeo", "Choe Yeong", "UGcbCeQyksY",
    "Named for General Choi Yong, Commander-in-Chief of Goryeo forces, respected for loyalty and humility.", null],
  [19, "Yon-Gae", "4th dan", 49, "Goguryeo", "Yeon Gaesomun", "9WaIlVkCWDM",
    "Named for Yon Gae Somoon, a general and statesman of Goguryeo.", "The 49 movements refer to the last two figures of 649 AD, when he drove back a Tang invasion."],
  [20, "Ul-Ji", "4th dan", 42, "Goguryeo", "Eulji Mundeok", "GKMhqmzG1y8",
    "Named for General Ul-Ji Moon-Dok, who defeated a large Sui invasion force.", "The 42 movements are said to refer to the age of the pattern's author when he created it."],
  [21, "Moon-Moo", "4th dan", 61, "Silla", "Munmu of Silla", "nnKNrv_sWRQ",
    "Honours King Moon-Moo, the 30th king of Silla, who is said to have been buried near the sea.", "The 61 movements refer to the last two figures of 661 AD, the year he came to the throne."],
  [22, "So-San", "5th dan", 72, "Joseon", "Hyujeong", "neev_YAAgDQ",
    "Pen name of the monk Choi Hyong-Ung, who organised monk soldiers against the Japanese invasion of 1592.", "The 72 movements refer to his age when he organised them."],
  [23, "Se-Jong", "5th dan", 24, "Joseon", "Sejong the Great", "KbLf1KELSzo",
    "Named for King Sejong, who created the Korean alphabet.", "The 24 movements stand for the 24 letters of the alphabet."],
  [24, "Tong-Il", "6th dan", 56, "Division of Korea", "Korean reunification", "yNmgJFwstMM",
    "Expresses the resolve to see Korea unified again after division.", null],
];

/** Listed for completeness, but not one of the 24 in the current curriculum. */
const FORMER = [
  [25, "Ko-Dang", "2nd dan", 39, "Korea under Japanese rule", "Cho Man-sik", null,
    "Pen name of the patriot Cho Man-Sik. Removed from the curriculum and replaced by Juche; still practised by some organisations.",
    "The 39 movements refer to his imprisonments and the latitude of his birthplace."],
];

const BELT_OF = (rank) => {
  const n = parseInt(rank, 10);
  if (rank.endsWith("dan")) return "Black";
  return { 10: "White", 9: "Yellow", 8: "Yellow", 7: "Green", 6: "Green", 5: "Blue", 4: "Blue", 3: "Red", 2: "Red", 1: "Red" }[n];
};

const retrieved = new Date().toISOString().slice(0, 10);

async function wiki(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`,
    { headers: { "User-Agent": "BlueCottageMini/0.2 (open-data build; jefftkddan@gmail.com)" } },
  );
  if (!res.ok) throw new Error(`wikipedia ${title}: HTTP ${res.status}`);
  const d = await res.json();
  if (d.type !== "standard") throw new Error(`wikipedia ${title}: type=${d.type} (disambiguation?)`);
  // First two sentences only; the full lead is one click away.
  const sentences = d.extract.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [d.extract];
  const excerpt = sentences.slice(0, 2).join("").trim();
  return {
    title: d.title,
    excerpt,
    url: d.content_urls.desktop.page,
    historyUrl: `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(d.titles.canonical)}&action=history`,
    revision: d.revision,
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    retrieved,
  };
}

async function video(id) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
  if (!res.ok) throw new Error(`oembed ${id}: HTTP ${res.status} (not embeddable?)`);
  const d = await res.json();
  return { id, title: d.title, channel: d.author_name, url, channelUrl: CHANNEL_URL, verified: retrieved };
}

const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const out = [];
for (const [order, name, rank, count, period, wikiTitle, vid, meaning, numberNote] of [...SEED, ...FORMER]) {
  const [namesake, vids] = await Promise.all([
    wikiTitle ? wiki(wikiTitle) : Promise.resolve(null),
    vid ? video(vid).then((v) => [v]) : Promise.resolve([]),
  ]);
  if (vids[0] && vids[0].channel !== CHANNEL) throw new Error(`${name}: unexpected channel ${vids[0].channel}`);
  out.push({
    id: slug(name),
    order,
    name,
    status: order <= 24 ? "current" : "former",
    rank,
    belt: BELT_OF(rank),
    movementCount: count,
    period,
    meaning,
    ...(numberNote ? { numberNote } : {}),
    namesake,
    videos: vids,
  });
  console.log(`${String(order).padStart(2)} ${name.padEnd(12)} wiki=${namesake?.title ?? "-"}  video=${vids[0]?.title ?? "-"}`);
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`\nwrote ${out.length} records to ${OUT}`);
