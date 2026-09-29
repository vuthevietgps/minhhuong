/*
 * Imports only public YouTube playlists from approved children's English sources.
 * It creates draft courses/lessons and YouTube privacy-enhanced embeds; no media is
 * downloaded or copied. Run this file inside the API container so it can use pg.
 */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { Client } = require('pg');

throw new Error(
  'Đã vô hiệu hóa: script này đọc trang và endpoint youtubei không chính thức. Hãy nhập manifest từ YouTube Data API chính thức sau khi hoàn tất rà soát quyền.',
);

const SOURCES = [
  { key: 'bookbox', name: 'BookBox', handle: '@BookBoxInc', filter: (title) => /\benglish\b/i.test(title) },
  { key: 'british-council', name: 'British Council LearnEnglish Kids', handle: '@BritishCouncilLEKids' },
  { key: 'super-simple', name: 'Super Simple / Storytime', handle: '@SuperSimpleSongs' },
  { key: 'steve-maggie', name: 'Steve & Maggie / Wow English', handle: '@Steve_and_Maggie' },
  { key: 'english-singsing', name: 'English Singsing', handle: '@EnglishSingsing' },
  { key: 'alphablocks', name: 'Alphablocks', handle: '@officialalphablocks' },
  { key: 'storybots', name: 'StoryBots (Netflix Jr.)', handle: '@NetflixJr', filter: (title) => /\bstorybots?\b/i.test(title) },
  { key: 'dream-english', name: 'Dream English Kids', handle: '@DreamEnglishKids' },
  { key: 'storyline', name: 'Storyline Online', handle: '@StorylineOnline', filter: (title) => /^Storyline Online Stories$/i.test(title) },
];

const levelDefinitions = {
  PRE_BEGINNER: ['Pre-beginner', 0],
  BEGINNER: ['Beginner', 10],
  ELEMENTARY: ['Elementary', 20],
  PRE_INTERMEDIATE: ['Pre-intermediate', 30],
};

const compactText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const textOf = (node) => compactText(node?.content ?? node?.simpleText ?? node?.runs?.map((part) => part.text).join(''));
const slugify = (value) => compactText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120) || 'playlist';
const videoUrl = (id, playlistId) => `https://www.youtube.com/watch?v=${id}&list=${playlistId}`;
const embedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}`;

function levelFor(source, title) {
  const value = title.toLowerCase();
  if (source.key === 'bookbox') {
    if (/level\s*3|upper|advanced/.test(value)) return 'PRE_INTERMEDIATE';
    if (/level\s*2|intermediate/.test(value)) return 'ELEMENTARY';
    return 'BEGINNER';
  }
  if (source.key === 'british-council') return /nursery|song|phonics/.test(value) ? 'PRE_BEGINNER' : 'BEGINNER';
  if (source.key === 'super-simple') return /story|storytime/.test(value) ? 'BEGINNER' : 'PRE_BEGINNER';
  if (source.key === 'steve-maggie') return /shorts|phonics|alphabet/.test(value) ? 'PRE_BEGINNER' : 'BEGINNER';
  if (source.key === 'english-singsing') return /grammar|biography|culture|country|history/.test(value) ? 'ELEMENTARY' : 'BEGINNER';
  if (source.key === 'alphablocks') return 'PRE_BEGINNER';
  if (source.key === 'storybots') return /alphabet|phonics/.test(value) ? 'PRE_BEGINNER' : 'BEGINNER';
  if (source.key === 'dream-english') return /conversation|sentence|story/.test(value) ? 'BEGINNER' : 'PRE_BEGINNER';
  return 'ELEMENTARY';
}

async function getInitialPage(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s) ?? html.match(/ytInitialData\s*=\s*(\{.*?\});/s);
  if (!match) throw new Error(`YouTube initial data was not found for ${url}`);
  const apiKey = html.match(/\"INNERTUBE_API_KEY\":\"([^\"]+)\"/)?.[1];
  const clientVersion = html.match(/\"INNERTUBE_CLIENT_VERSION\":\"([^\"]+)\"/)?.[1];
  if (!apiKey || !clientVersion) throw new Error(`YouTube continuation settings were not found for ${url}`);
  return { data: JSON.parse(match[1]), apiKey, clientVersion };
}

function findValues(node, property, result = []) {
  if (!node || typeof node !== 'object') return result;
  if (Object.hasOwn(node, property)) result.push(node[property]);
  for (const value of Object.values(node)) findValues(value, property, result);
  return result;
}

function channelPlaylists(data) {
  const results = [];
  const seen = new Set();
  for (const renderer of findValues(data, 'lockupViewModel')) {
    const playlistId = renderer?.contentId;
    const title = textOf(renderer?.metadata?.lockupMetadataViewModel?.title);
    if (playlistId?.startsWith('PL') && title && !seen.has(playlistId)) {
      seen.add(playlistId);
      results.push({ playlistId, title });
    }
  }
  return results;
}

function playlistVideos(data) {
  const results = [];
  const seen = new Set();
  for (const renderer of findValues(data, 'playlistVideoRenderer')) {
    const videoId = renderer?.videoId;
    const title = textOf(renderer?.title);
    if (videoId && title && !seen.has(videoId)) {
      seen.add(videoId);
      results.push({ videoId, title });
    }
  }
  for (const model of findValues(data, 'lockupViewModel')) {
    const videoId = model?.contentId;
    const title = textOf(model?.metadata?.lockupMetadataViewModel?.title);
    if (videoId?.length === 11 && title && !seen.has(videoId)) {
      seen.add(videoId);
      results.push({ videoId, title });
    }
  }
  return results;
}

function advertisedVideoCount(data) {
  const values = findValues(data, 'simpleText').concat(findValues(data, 'runs').map((runs) => textOf({ runs })));
  for (const raw of values) {
    const match = compactText(raw).match(/([\d,.]+)\s+videos?\b/i);
    if (match) return Number(match[1].replace(/[^\d]/g, ''));
  }
  return null;
}

function continuations(data) {
  const result = [];
  const seen = new Set();
  for (const endpoint of findValues(data, 'continuationEndpoint')) {
    const token = endpoint?.continuationCommand?.token;
    const apiUrl = endpoint?.commandMetadata?.webCommandMetadata?.apiUrl ?? '/youtubei/v1/browse';
    if (token && !seen.has(token)) {
      seen.add(token);
      result.push({ token, apiUrl });
    }
  }
  return result;
}

async function fetchContinuation(settings, continuation) {
  const apiUrl = continuation.apiUrl.replace(/^\//, '');
  const response = await fetch(`https://www.youtube.com/${apiUrl}?key=${settings.apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: settings.clientVersion } }, continuation: continuation.token }),
  });
  if (!response.ok) throw new Error(`YouTube continuation returned HTTP ${response.status}`);
  return response.json();
}

async function collectAll(initial, extractor) {
  const collected = [];
  const ids = new Set();
  const queued = continuations(initial.data);
  const seenTokens = new Set(queued.map((item) => item.token));
  const append = (data) => {
    for (const item of extractor(data)) {
      const id = item.playlistId ?? item.videoId;
      if (!ids.has(id)) { ids.add(id); collected.push(item); }
    }
  };
  append(initial.data);
  while (queued.length) {
    const next = queued.shift();
    const data = await fetchContinuation(initial, next);
    append(data);
    for (const item of continuations(data)) {
      if (!seenTokens.has(item.token)) { seenTokens.add(item.token); queued.push(item); }
    }
  }
  return collected;
}

async function publicPlaylists(source) {
  const initial = await getInitialPage(`https://www.youtube.com/${source.handle}/playlists`);
  const playlists = await collectAll(initial, channelPlaylists);
  return playlists.filter(({ title }) => !source.filter || source.filter(title));
}

async function readPlaylist(source, playlist) {
  const initial = await getInitialPage(`https://www.youtube.com/playlist?list=${playlist.playlistId}`);
  const videos = await collectAll(initial, playlistVideos);
  const advertised = advertisedVideoCount(initial.data);
  // We deliberately refuse a partial playlist, instead of silently importing only its first page.
  if (advertised !== null && advertised !== videos.length) {
    return { ...playlist, videos: [], error: `loaded ${videos.length} of ${advertised} advertised public videos` };
  }
  return { ...playlist, videos };
}

async function ensureLevels(db) {
  for (const [code, [title, sortOrder]] of Object.entries(levelDefinitions)) {
    await db.query(
      'INSERT INTO "Level" (id, code, title, "sortOrder") VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
      [randomUUID(), code, title, sortOrder],
    );
  }
}

async function importPlaylist(db, actorId, source, playlist) {
  const levelCode = levelFor(source, playlist.title);
  const courseSlug = `${source.key}-${slugify(playlist.title)}-${playlist.playlistId.toLowerCase()}`.slice(0, 180);
  const courseTitle = `${source.name} — ${playlist.title}`;
  await db.query('BEGIN');
  try {
    const level = await db.query('SELECT id FROM "Level" WHERE code = $1', [levelCode]);
    const existingCourse = await db.query('SELECT id FROM "Course" WHERE slug = $1', [courseSlug]);
    let courseId = existingCourse.rows[0]?.id;
    if (!courseId) {
      courseId = randomUUID();
      await db.query(
        'INSERT INTO "Course" (id, "levelId", slug, title, description, "isPublished", "sortOrder", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,FALSE,0,NOW(),NOW())',
        [courseId, level.rows[0].id, courseSlug, courseTitle, `Public YouTube playlist embedded from the verified ${source.name} channel. Draft content: review before publishing.`],
      );
    }
    const existingUnit = await db.query('SELECT id FROM "Unit" WHERE "courseId" = $1 ORDER BY "sortOrder", id LIMIT 1', [courseId]);
    let unitId = existingUnit.rows[0]?.id;
    if (!unitId) {
      unitId = randomUUID();
      await db.query('INSERT INTO "Unit" (id, "courseId", title, description, "sortOrder") VALUES ($1,$2,$3,$4,0)', [unitId, courseId, playlist.title, 'Public YouTube videos.']);
    }
    const existing = await db.query('SELECT "playbackId" FROM "VideoAsset" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "unitId" = $1)', [unitId]);
    const existingIds = new Set(existing.rows.map((row) => row.playbackId));
    let inserted = 0;
    for (const [index, video] of playlist.videos.entries()) {
      if (existingIds.has(video.videoId)) continue;
      const lessonId = randomUUID();
      const lessonSlug = `${source.key}-${playlist.playlistId.toLowerCase()}-${video.videoId}`.slice(0, 180);
      await db.query(
        'INSERT INTO "Lesson" (id, "unitId", slug, title, type, status, "sortOrder", "createdById", "updatedById", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,\'VIDEO\',\'DRAFT\',$5,$6,$6,NOW(),NOW())',
        [lessonId, unitId, lessonSlug, video.title, index, actorId],
      );
      await db.query(
        'INSERT INTO "VideoAsset" (id, "lessonId", title, provider, "processingStatus", "playbackId", "sourceUrl", "embedUrl", "sortOrder", "uploadedById", "createdAt", "updatedAt") VALUES ($1,$2,$3,\'YOUTUBE\',\'READY\',$4,$5,$6,$7,$8,NOW(),NOW())',
        [randomUUID(), lessonId, video.title, video.videoId, videoUrl(video.videoId, playlist.playlistId), embedUrl(video.videoId), index, actorId],
      );
      existingIds.add(video.videoId);
      inserted += 1;
    }
    await db.query(
      'INSERT INTO "AuditLog" (id, "userId", action, "entityType", "entityId", metadata, "createdAt") VALUES ($1,$2,$3,\'Course\',$4,$5::jsonb,NOW())',
      [randomUUID(), actorId, 'content.youtube_public_playlist_import', courseId, JSON.stringify({ source: source.name, playlistId: playlist.playlistId, importedVideos: inserted, publicEmbedOnly: true, draft: true })],
    );
    await db.query('COMMIT');
    return { imported: inserted, courseId };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.IMPORT_ACTOR_EMAIL) throw new Error('DATABASE_URL and IMPORT_ACTOR_EMAIL are required');
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const actor = await db.query(
      'SELECT u.id FROM "User" u JOIN "UserRole" ur ON ur."userId" = u.id JOIN "Role" r ON r.id = ur."roleId" WHERE u.email = $1 AND r.name = \'ADMIN\' LIMIT 1',
      [process.env.IMPORT_ACTOR_EMAIL.toLowerCase()],
    );
    if (!actor.rowCount) throw new Error('An administrator matching IMPORT_ACTOR_EMAIL was not found');
    await ensureLevels(db);
    const report = { selectedPlaylists: 0, importedVideos: 0, skipped: [], sources: {} };
    if (process.env.IMPORT_MANIFEST_FILE) {
      const manifest = JSON.parse(await readFile(process.env.IMPORT_MANIFEST_FILE, 'utf8'));
      for (const content of manifest) {
        const source = SOURCES.find((item) => item.key === content.sourceKey);
        if (!source || !content.playlistId || !content.title || !Array.isArray(content.videos)) {
          report.skipped.push({ playlist: content?.title ?? 'unknown', reason: 'invalid manifest entry' });
          continue;
        }
        const result = await importPlaylist(db, actor.rows[0].id, source, content);
        report.selectedPlaylists += 1;
        report.importedVideos += result.imported;
        report.sources[source.name] ??= { playlists: 0, videos: 0 };
        report.sources[source.name].playlists += 1;
        report.sources[source.name].videos += result.imported;
        process.stdout.write(`Imported ${source.name}: ${content.title} (${result.imported} videos)\n`);
      }
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    for (const source of SOURCES) {
      const playlists = await publicPlaylists(source);
      report.sources[source.name] = { playlists: playlists.length, videos: 0 };
      for (const playlist of playlists) {
        const content = await readPlaylist(source, playlist);
        if (content.error) {
          report.skipped.push({ source: source.name, playlist: playlist.title, reason: content.error });
          continue;
        }
        if (!content.videos.length) continue;
        const result = await importPlaylist(db, actor.rows[0].id, source, content);
        report.selectedPlaylists += 1;
        report.importedVideos += result.imported;
        report.sources[source.name].videos += result.imported;
        process.stdout.write(`Imported ${source.name}: ${playlist.title} (${result.imported} videos)\n`);
      }
    }
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await db.end();
  }
}

main().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
