import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';

const endpoint = process.env.OBJECT_STORAGE_SMOKE_ENDPOINT;
const bucket = process.env.UPLOAD_S3_BUCKET;
const accessKeyId = process.env.UPLOAD_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.UPLOAD_S3_SECRET_ACCESS_KEY;
if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error('OBJECT_STORAGE_SMOKE_CONFIGURATION_REQUIRED');
}

const createClient = () =>
  new S3Client({
    endpoint,
    region: process.env.UPLOAD_S3_REGION || 'us-east-1',
    forcePathStyle: true,
    maxAttempts: 3,
    credentials: { accessKeyId, secretAccessKey },
  });

const firstInstance = createClient();

const fixtures = [
  {
    key: 'smoke/videos/synthetic-video.mp4',
    contentType: 'video/mp4',
    body: Buffer.from('synthetic-video-object-v1'),
  },
  {
    key: 'smoke/invoices/synthetic-invoice.pdf',
    contentType: 'application/pdf',
    body: Buffer.from('synthetic-invoice-object-v1'),
  },
];

for (const fixture of fixtures) {
  const digest = createHash('sha256').update(fixture.body).digest('hex');
  await firstInstance.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fixture.key,
      Body: fixture.body,
      ContentType: fixture.contentType,
      IfNoneMatch: '*',
      Metadata: { sha256: digest },
    }),
  );
}
firstInstance.destroy();

const independentInstance = createClient();
for (const fixture of fixtures) {
  const head = await independentInstance.send(
    new HeadObjectCommand({ Bucket: bucket, Key: fixture.key }),
  );
  const read = await independentInstance.send(
    new GetObjectCommand({ Bucket: bucket, Key: fixture.key }),
  );
  const body = Buffer.from(await read.Body.transformToByteArray());
  const digest = createHash('sha256').update(body).digest('hex');
  if (
    !body.equals(fixture.body) ||
    head.ContentType !== fixture.contentType ||
    head.Metadata?.sha256 !== digest
  ) {
    throw new Error(`OBJECT_STORAGE_SMOKE_CHECKSUM_FAILED:${fixture.key}`);
  }
  await independentInstance.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: fixture.key }),
  );
  await independentInstance
    .send(new HeadObjectCommand({ Bucket: bucket, Key: fixture.key }))
    .then(() => {
      throw new Error(`OBJECT_STORAGE_SMOKE_DELETE_FAILED:${fixture.key}`);
    })
    .catch((error) => {
      if (error?.message?.startsWith('OBJECT_STORAGE_SMOKE_DELETE_FAILED')) {
        throw error;
      }
      if (error?.$metadata?.httpStatusCode !== 404) throw error;
    });
}
independentInstance.destroy();

process.stdout.write(
  `${JSON.stringify({
    status: 'PASS',
    syntheticObjectCount: fixtures.length,
    independentClientRead: true,
    checksumVerified: true,
    immutablePutUsed: true,
    exactObjectCleanup: true,
    providerApiUsed: false,
    productionReady: false,
  })}\n`,
);
