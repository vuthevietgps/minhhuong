/* Builds metadata-only recovery input for public playlists that the page parser
 * deliberately skipped. Requires yt-dlp but never requests media downloads. */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

throw new Error(
  'Đã vô hiệu hóa: không dùng yt-dlp để thu thập dữ liệu YouTube. Hãy thay bằng YouTube Data API chính thức và chỉ xử lý nguồn có hồ sơ quyền hợp lệ.',
);

const channelUrls = {
  'BookBox': 'https://www.youtube.com/@BookBoxInc/playlists',
  'British Council LearnEnglish Kids': 'https://www.youtube.com/@BritishCouncilLEKids/playlists',
  'Super Simple / Storytime': 'https://www.youtube.com/@SuperSimpleSongs/playlists',
  'Steve & Maggie / Wow English': 'https://www.youtube.com/@Steve_and_Maggie/playlists',
  'English Singsing': 'https://www.youtube.com/@EnglishSingsing/playlists',
  'Alphablocks': 'https://www.youtube.com/@officialalphablocks/playlists',
  'StoryBots (Netflix Jr.)': 'https://www.youtube.com/@NetflixJr/playlists',
  'Dream English Kids': 'https://www.youtube.com/@DreamEnglishKids/playlists',
  'Storyline Online': 'https://www.youtube.com/@StorylineOnline/playlists',
};
const sourceKeys = {
  'BookBox': 'bookbox', 'British Council LearnEnglish Kids': 'british-council', 'Super Simple / Storytime': 'super-simple',
  'Steve & Maggie / Wow English': 'steve-maggie', 'English Singsing': 'english-singsing', 'Alphablocks': 'alphablocks',
  'StoryBots (Netflix Jr.)': 'storybots', 'Dream English Kids': 'dream-english', 'Storyline Online': 'storyline',
};
const ytdlp = process.env.YT_DLP_BIN ?? 'yt-dlp';
const [reportPath, outputPath] = process.argv.slice(2);
if (!reportPath || !outputPath) throw new Error('Usage: node build-youtube-recovery-manifest.mjs REPORT_LOG OUTPUT_JSON');

const parseLines = (output) => output.split(/\r?\n/).filter(Boolean).map((line) => {
  const [id, ...title] = line.split('\t');
  return { id, title: title.join('\t') };
}).filter((item) => item.id && item.title);
const getEntries = (url) => parseLines(execFileSync(ytdlp, ['--flat-playlist', '--print', '%(id)s\t%(title)s', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 }));

const log = await readFile(reportPath, 'utf8');
const start = log.lastIndexOf('{\n  "selectedPlaylists"');
if (start < 0) throw new Error('Final import report was not found in the log');
const report = JSON.parse(log.slice(start));
const output = [];
const unresolved = [];
for (const [sourceName, url] of Object.entries(channelUrls)) {
  const required = report.skipped.filter((item) => item.source === sourceName);
  if (!required.length) continue;
  const idsByTitle = new Map(getEntries(url).map((item) => [item.title, item.id]));
  for (const skipped of required) {
    const playlistId = idsByTitle.get(skipped.playlist);
    if (!playlistId) { unresolved.push({ ...skipped, reason: 'playlist no longer public or title changed' }); continue; }
    const videos = getEntries(`https://www.youtube.com/playlist?list=${playlistId}`).map((item) => ({ videoId: item.id, title: item.title }));
    if (!videos.length) { unresolved.push({ ...skipped, reason: 'playlist has no accessible public videos' }); continue; }
    output.push({ sourceKey: sourceKeys[sourceName], playlistId, title: skipped.playlist, videos });
    process.stdout.write(`Recovered ${sourceName}: ${skipped.playlist} (${videos.length} metadata entries)\n`);
  }
}
await writeFile(outputPath, JSON.stringify(output));
console.log(JSON.stringify({ recoveredPlaylists: output.length, recoveredVideos: output.reduce((total, item) => total + item.videos.length, 0), unresolved }));
