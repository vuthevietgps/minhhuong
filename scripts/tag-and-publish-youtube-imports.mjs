/*
 * Adds deterministic discovery tags to imported public YouTube lessons, then
 * publishes those imported courses at the owner's request. Run inside the API
 * container, with DATABASE_URL and IMPORT_ACTOR_EMAIL set.
 */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';

const require = createRequire(import.meta.url);
const { Client } = require('pg');

throw new Error(
  'Đã vô hiệu hóa: không tự động xuất bản các nguồn YouTube cũ chưa qua quy trình xác nhận quyền mới.',
);

const TAGS = [
  ['pre-beginner-a0', 'Pre-beginner (A0)', 'LEVEL', '#0f766e', 0],
  ['beginner-a1', 'Beginner (A1)', 'LEVEL', '#0f766e', 10],
  ['elementary-a2', 'Elementary (A2)', 'LEVEL', '#0f766e', 20],
  ['pre-intermediate-b1', 'Pre-intermediate (B1)', 'LEVEL', '#0f766e', 30],
  ['phonics', 'Phonics', 'SKILL', '#7c3aed', 10],
  ['vocabulary', 'Từ vựng', 'SKILL', '#7c3aed', 20],
  ['listening', 'Nghe', 'SKILL', '#7c3aed', 30],
  ['speaking', 'Nói', 'SKILL', '#7c3aed', 40],
  ['reading', 'Đọc', 'SKILL', '#7c3aed', 50],
  ['grammar', 'Ngữ pháp', 'SKILL', '#7c3aed', 60],
  ['video', 'Video', 'FORMAT', '#2563eb', 10],
  ['song', 'Bài hát', 'FORMAT', '#2563eb', 20],
  ['story', 'Truyện', 'FORMAT', '#2563eb', 30],
  ['alphabet', 'Chữ cái', 'TOPIC', '#ea580c', 10],
  ['numbers-math', 'Số & Toán', 'TOPIC', '#ea580c', 20],
  ['animals', 'Động vật', 'TOPIC', '#ea580c', 30],
  ['colours', 'Màu sắc', 'TOPIC', '#ea580c', 40],
  ['food', 'Thức ăn', 'TOPIC', '#ea580c', 50],
  ['daily-routines', 'Thói quen hằng ngày', 'TOPIC', '#ea580c', 60],
  ['family-friends', 'Gia đình & Bạn bè', 'TOPIC', '#ea580c', 70],
  ['vehicles', 'Phương tiện', 'TOPIC', '#ea580c', 80],
  ['festivals', 'Lễ hội', 'TOPIC', '#ea580c', 90],
  ['feelings', 'Cảm xúc', 'TOPIC', '#ea580c', 100],
  ['science-nature', 'Khoa học & Thiên nhiên', 'TOPIC', '#ea580c', 110],
  ['preschool', 'Mầm non', 'AUDIENCE', '#db2777', 10],
  ['public-youtube', 'YouTube công khai', 'CUSTOM', '#475569', 10],
];

const levelTags = {
  PRE_BEGINNER: 'pre-beginner-a0', BEGINNER: 'beginner-a1', ELEMENTARY: 'elementary-a2', PRE_INTERMEDIATE: 'pre-intermediate-b1',
};
const matches = (value, expression) => expression.test(value);

function tagsFor(title, courseTitle, levelCode) {
  const text = `${title} ${courseTitle}`.toLowerCase();
  const tags = new Set(['video', 'public-youtube', levelTags[levelCode] ?? 'beginner-a1']);
  const sourcePreschool = /super simple|dream english|alphablocks|steve & maggie/.test(courseTitle.toLowerCase());
  if (sourcePreschool) tags.add('preschool');
  if (matches(text, /phonics|alphabet|\babc\b|letter|spell/)) { tags.add('phonics'); tags.add('alphabet'); }
  if (matches(text, /song|sing|nursery rhyme|rhyme|chant/)) { tags.add('song'); tags.add('listening'); }
  if (matches(text, /story|storytime|fairy tale|fairytale|tale|read aloud|book/)) { tags.add('story'); tags.add('reading'); tags.add('listening'); }
  if (matches(text, /vocabulary|\bwords?\b|picture dictionary/)) tags.add('vocabulary');
  if (matches(text, /conversation|dialogue|speaking|sentence|question|repeat after/)) { tags.add('speaking'); tags.add('listening'); }
  if (matches(text, /\breading\b|learn to read|read and write/)) tags.add('reading');
  if (matches(text, /grammar/)) tags.add('grammar');
  if (matches(text, /animal|farm|bug|insect|dinosaur|shark/)) tags.add('animals');
  if (matches(text, /colour|color/)) tags.add('colours');
  if (matches(text, /number|count|math|addition|subtraction|one two three|ten in the bed/)) tags.add('numbers-math');
  if (matches(text, /food|fruit|vegetable|hungry|pizza|popcorn|eat/)) tags.add('food');
  if (matches(text, /routine|morning|bedtime|bath|clean up|wash|brush teeth|nice & clean/)) tags.add('daily-routines');
  if (matches(text, /family|mother|mom|mum|father|dad|sister|brother|friend/)) tags.add('family-friends');
  if (matches(text, /car|train|bus|airplane|aeroplane|vehicle|transport/)) tags.add('vehicles');
  if (matches(text, /christmas|halloween|easter|holiday|valentine/)) tags.add('festivals');
  if (matches(text, /feeling|emotion|happy|sad|angry|scared|fear/)) tags.add('feelings');
  if (matches(text, /science|weather|earth|nature|environment|ocean|space/)) tags.add('science-nature');
  return [...tags].filter(Boolean);
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.IMPORT_ACTOR_EMAIL) throw new Error('DATABASE_URL and IMPORT_ACTOR_EMAIL are required');
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const actor = await db.query(
      'SELECT u.id FROM "User" u JOIN "UserRole" ur ON ur."userId"=u.id JOIN "Role" r ON r.id=ur."roleId" WHERE u.email=$1 AND r.name=\'ADMIN\' LIMIT 1',
      [process.env.IMPORT_ACTOR_EMAIL.toLowerCase()],
    );
    if (!actor.rowCount) throw new Error('Administrator actor not found');
    const actorId = actor.rows[0].id;
    await db.query('BEGIN');
    try {
      for (const [slug, name, kind, color, sortOrder] of TAGS) {
        await db.query(
          'INSERT INTO "ContentTag" (id,slug,name,kind,color,"sortOrder","isActive","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,TRUE,NOW(),NOW()) ON CONFLICT (slug) DO UPDATE SET "isActive"=TRUE, "updatedAt"=NOW()',
          [randomUUID(), slug, name, kind, color, sortOrder],
        );
      }
      const tagRows = await db.query('SELECT id,slug FROM "ContentTag" WHERE slug = ANY($1)', [TAGS.map(([slug]) => slug)]);
      const tagIds = new Map(tagRows.rows.map((tag) => [tag.slug, tag.id]));
      const lessons = await db.query(
        `SELECT l.id, l.title, c.title AS "courseTitle", lvl.code AS "levelCode", c.id AS "courseId"
         FROM "Lesson" l
         JOIN "Unit" u ON u.id=l."unitId"
         JOIN "Course" c ON c.id=u."courseId"
         JOIN "Level" lvl ON lvl.id=c."levelId"
         WHERE EXISTS (SELECT 1 FROM "AuditLog" a WHERE a."entityId"=c.id AND a.action='content.youtube_public_playlist_import')`,
      );
      const assignmentsToCreate = [];
      for (const lesson of lessons.rows) {
        for (const slug of tagsFor(lesson.title, lesson.courseTitle, lesson.levelCode)) {
          assignmentsToCreate.push([lesson.id, tagIds.get(slug)]);
        }
      }
      let assignments = 0;
      for (let index = 0; index < assignmentsToCreate.length; index += 1000) {
        const chunk = assignmentsToCreate.slice(index, index + 1000);
        const values = [];
        const placeholders = chunk.map(([lessonId, tagId], itemIndex) => {
          const offset = itemIndex * 2;
          values.push(lessonId, tagId);
          return `($${offset + 1},$${offset + 2},NOW())`;
        });
        const result = await db.query(`INSERT INTO "LessonTag" ("lessonId","tagId","assignedAt") VALUES ${placeholders.join(',')} ON CONFLICT DO NOTHING`, values);
        assignments += result.rowCount;
      }
      const courses = await db.query(
        `UPDATE "Course" c SET "isPublished"=TRUE, "updatedAt"=NOW()
         WHERE EXISTS (SELECT 1 FROM "AuditLog" a WHERE a."entityId"=c.id AND a.action='content.youtube_public_playlist_import')
         RETURNING id`,
      );
      const publishedLessons = await db.query(
        `UPDATE "Lesson" l SET status='PUBLISHED', "publishedAt"=COALESCE("publishedAt",NOW()), "updatedAt"=NOW()
         WHERE l."unitId" IN (SELECT u.id FROM "Unit" u WHERE u."courseId" = ANY($1)) AND l.status <> 'PUBLISHED'
         RETURNING id`,
        [courses.rows.map((course) => course.id)],
      );
      await db.query(
        'INSERT INTO "AuditLog" (id,"userId",action,"entityType",metadata,"createdAt") VALUES ($1,$2,$3,$4,$5::jsonb,NOW())',
        [randomUUID(), actorId, 'content.youtube_auto_tag_and_publish', 'Course', JSON.stringify({ coursesPublished: courses.rowCount, lessonsPublished: publishedLessons.rowCount, tagsCreatedOrActivated: TAGS.length, tagAssignmentsAdded: assignments, automatedBy: 'title-source-level-rules' })],
      );
      await db.query('COMMIT');
      console.log(JSON.stringify({ coursesPublished: courses.rowCount, lessonsPublished: publishedLessons.rowCount, tagsCreatedOrActivated: TAGS.length, tagAssignmentsAdded: assignments }));
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } finally {
    await db.end();
  }
}

main().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
