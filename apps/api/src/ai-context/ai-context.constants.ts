export const CONTEXT_VERSION = 'context-v4-independent-knowledge';
export const TRUSTED_CONTEXT_VERSIONS = [
  'context-v2-rights-attested',
  'context-v3-video-workspace',
  CONTEXT_VERSION,
];
export const MAX_TRANSCRIPT_CHARACTERS = 100000;
export const DOCUMENT_LABELS = {
  REPORT: 'Báo cáo tổng hợp theo chủ đề',
  NOTES: 'Ghi chú học tập',
  OUTLINE: 'Dàn ý',
  ARTICLE: 'Bài tổng hợp',
  ACTION_ITEMS: 'Danh sách việc cần làm',
} as const;
