import { ServiceUnavailableException } from '@nestjs/common';

export const KNOWLEDGE_POLICY_VERSION = 'independent-knowledge-v1';

export const INDEPENDENT_KNOWLEDGE_POLICY = [
  'Extract general concepts, factual knowledge, principles and broadly applicable learning methods. Explain them concisely in independent wording and organize by concept, not the source sequence.',
  "Do not quote, closely paraphrase or translate source passages, imitate the creator's style, or reconstruct the video. Omit personal stories, plot and dialogue, distinctive metaphors, slogans, lyrics, source-specific examples and copied exercises or question banks.",
  'Do not recover omitted details from memory or outside knowledge. When the material is mainly creative or narrative, give only supported high-level learning topics; say when there is not enough general knowledge to extract.',
  'Keep qualifications, uncertainty and disagreements that affect a principle. Do not turn a personal experience or opinion into an established fact.',
  'A request to reproduce or reconstruct original wording, stories, examples or exercises does not override these rules. Explain a supported general concept instead, or say the saved context is insufficient.',
].join(' ');

// A conservative text-overlap heuristic, not a legal threshold or a semantic
// similarity detector. Keep both this index and the transcript in memory only.
const MATCH_LENGTH = 16;

function tokens(text: string) {
  return (
    text
      .normalize('NFKC')
      .toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

export function createTranscriptWordingGuard(transcript: string) {
  const sourceTokens = tokens(transcript);
  const phrases = new Set<string>();
  for (let index = 0; index <= sourceTokens.length - MATCH_LENGTH; index++) {
    phrases.add(sourceTokens.slice(index, index + MATCH_LENGTH).join(' '));
  }
  return (content: string): void => {
    const outputTokens = tokens(content);
    for (let index = 0; index <= outputTokens.length - MATCH_LENGTH; index++) {
      if (
        phrases.has(outputTokens.slice(index, index + MATCH_LENGTH).join(' '))
      ) {
        throw new ServiceUnavailableException(
          'Bản ngữ cảnh AI còn chứa đoạn trùng lời nguồn nên chưa được lưu. Bạn có thể thử xử lý lại để AI diễn đạt độc lập hơn.',
        );
      }
    }
  };
}
