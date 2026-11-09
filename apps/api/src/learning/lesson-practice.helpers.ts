import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { SubmitQuestionResponseDto } from './dto/submit-activity-attempt.dto';

export function createStableSortKey(input: string) {
  return createHash('sha1').update(input).digest('hex');
}

export function validateResponsesBelongToActivity(
  responses: SubmitQuestionResponseDto[],
  questionIds: string[],
) {
  const allowedQuestionIds = new Set(questionIds);
  const seenQuestionIds = new Set<string>();

  for (const response of responses) {
    if (!allowedQuestionIds.has(response.questionId)) {
      throw new BadRequestException(
        'Response contains a question outside this activity',
      );
    }

    if (seenQuestionIds.has(response.questionId)) {
      throw new BadRequestException(
        'Response contains duplicate question answers',
      );
    }

    seenQuestionIds.add(response.questionId);
  }
}

export function toPublicAnswers(question: {
  id: string;
  type: string;
  answers: Array<{ id: string; text: string; sortOrder: number }>;
}) {
  const answers =
    question.type === 'ORDERING'
      ? seededShuffle(question.answers, question.id)
      : question.answers;

  return answers.map((answer) => ({
    id: answer.id,
    text: answer.text,
  }));
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  return items
    .map((item, index) => ({
      item,
      key: createStableSortKey(`${seed}:${index}`),
    }))
    .sort((left, right) => left.key.localeCompare(right.key))
    .map(({ item }) => item);
}

export function gradeQuestion(
  question: Prisma.QuestionGetPayload<{ include: { answers: true } }>,
  response: SubmitQuestionResponseDto | undefined,
) {
  if (!response) {
    return {
      questionId: question.id,
      selectedAnswerIds: undefined,
      textAnswer: undefined,
      orderedAnswer: undefined,
      isCorrect: false,
      score: 0,
      feedback: 'No answer submitted.',
    };
  }

  if (
    question.type === 'SINGLE_CHOICE' ||
    question.type === 'MULTIPLE_CHOICE'
  ) {
    const selected = [...(response.selectedAnswerIds ?? [])].sort();
    const correct = question.answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.id)
      .sort();
    const isCorrect =
      selected.length === correct.length &&
      selected.every((answerId, index) => answerId === correct[index]);

    return {
      questionId: question.id,
      selectedAnswerIds: selected,
      textAnswer: undefined,
      orderedAnswer: undefined,
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: isCorrect
        ? 'Correct.'
        : (question.explanation ?? 'Review the explanation.'),
    };
  }

  if (question.type === 'TEXT_INPUT') {
    const submitted = normalizeText(response.textAnswer ?? '');
    const accepted = question.answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => normalizeText(answer.text));
    const isCorrect = accepted.includes(submitted);

    return {
      questionId: question.id,
      selectedAnswerIds: undefined,
      textAnswer: response.textAnswer,
      orderedAnswer: undefined,
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: isCorrect
        ? 'Correct.'
        : (question.explanation ?? 'Accepted answer differs.'),
    };
  }

  if (question.type === 'ORDERING') {
    const submitted = response.orderedAnswerIds ?? [];
    const correct = question.answers
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((answer) => answer.id);
    const isCorrect =
      submitted.length === correct.length &&
      submitted.every((answerId, index) => answerId === correct[index]);

    return {
      questionId: question.id,
      selectedAnswerIds: undefined,
      textAnswer: undefined,
      orderedAnswer: submitted,
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: isCorrect
        ? 'Correct.'
        : (question.explanation ?? 'Check the correct order.'),
    };
  }

  throw new BadRequestException('This question type is not auto-graded yet');
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
