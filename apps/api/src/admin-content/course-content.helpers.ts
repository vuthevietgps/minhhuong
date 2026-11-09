import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type LessonForPublish = Prisma.LessonGetPayload<{
  include: {
    videos: true;
    unit: true;
    activities: {
      include: {
        questions: {
          include: {
            answers: true;
          };
        };
      };
    };
  };
}>;

export function validatePublishReadiness(lesson: LessonForPublish) {
  if (lesson.status !== 'IN_REVIEW') {
    throw new BadRequestException('Lesson must be in review before publish');
  }

  if (lesson.videos.length === 0 && lesson.activities.length === 0) {
    throw new BadRequestException('Lesson needs content before publish');
  }

  const notReadyVideo = lesson.videos.find(
    (video) => video.processingStatus !== 'READY',
  );
  if (notReadyVideo) {
    throw new BadRequestException('All lesson videos must be ready');
  }

  for (const activity of lesson.activities) {
    if (activity.questions.length === 0) {
      throw new BadRequestException(
        `Activity "${activity.title}" needs at least one question`,
      );
    }

    for (const question of activity.questions) {
      validatePublishedQuestion(question);
    }
  }
}

export function validatePublishedQuestion(
  question: LessonForPublish['activities'][number]['questions'][number],
) {
  if (question.type === 'SPEAKING') {
    throw new BadRequestException(
      'Speaking questions cannot be published until grading is supported',
    );
  }

  const correctAnswers = question.answers.filter((answer) => answer.isCorrect);

  if (question.type === 'SINGLE_CHOICE' && correctAnswers.length !== 1) {
    throw new BadRequestException(
      'Single choice questions need exactly one correct answer',
    );
  }

  if (question.type === 'MULTIPLE_CHOICE' && correctAnswers.length < 1) {
    throw new BadRequestException(
      'Multiple choice questions need at least one correct answer',
    );
  }

  if (question.type === 'TEXT_INPUT' && correctAnswers.length < 1) {
    throw new BadRequestException(
      'Text input questions need at least one accepted answer',
    );
  }

  if (question.type === 'ORDERING' && question.answers.length < 2) {
    throw new BadRequestException('Ordering questions need at least two items');
  }
}
