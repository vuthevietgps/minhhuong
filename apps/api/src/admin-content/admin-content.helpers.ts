import { BadRequestException } from '@nestjs/common';
import { CreateQuestionDto, QuestionTypeDto } from './dto/create-question.dto';

export async function uniqueSlug(
  input: string,
  exists: (slug: string) => Promise<boolean>,
) {
  const base = slugify(input);
  let slug = base;
  let counter = 2;

  while (await exists(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : `item-${Date.now()}`;
}

export function validateQuestion(dto: CreateQuestionDto) {
  const correctAnswers = dto.answers.filter((answer) => answer.isCorrect);

  if (
    dto.type === QuestionTypeDto.SINGLE_CHOICE &&
    correctAnswers.length !== 1
  ) {
    throw new BadRequestException(
      'Single choice questions need exactly one correct answer',
    );
  }

  if (
    dto.type === QuestionTypeDto.MULTIPLE_CHOICE &&
    correctAnswers.length < 1
  ) {
    throw new BadRequestException(
      'Multiple choice questions need at least one correct answer',
    );
  }

  if (dto.type === QuestionTypeDto.TEXT_INPUT && correctAnswers.length < 1) {
    throw new BadRequestException(
      'Text input questions need at least one accepted answer',
    );
  }

  if (dto.type === QuestionTypeDto.ORDERING && dto.answers.length < 2) {
    throw new BadRequestException('Ordering questions need at least two items');
  }
}
