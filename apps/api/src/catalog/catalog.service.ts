import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const sampleOutline = {
  id: 'sample-course',
  slug: 'english-starter',
  title: 'English Starter',
  level: { code: 'A1', title: 'Beginner' },
  units: [
    {
      id: 'sample-unit-1',
      title: 'Greetings',
      lessons: [
        {
          id: 'sample-lesson-1',
          slug: 'greetings-basics',
          title: 'Greeting Basics',
          type: 'MIXED',
          durationSec: 480,
        },
      ],
    },
  ],
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listLevels() {
    try {
      const levels = await this.prisma.level.findMany({
        where: {
          courses: {
            some: {
              isPublished: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
        },
      });

      return levels.length > 0 || !this.canReturnSampleCatalog()
        ? levels
        : [
            {
              id: 'sample-level',
              code: 'A1',
              title: 'Beginner',
              description: 'Sample level',
            },
          ];
    } catch (error) {
      if (!this.canReturnSampleCatalog()) {
        throw error;
      }

      return [
        {
          id: 'sample-level',
          code: 'A1',
          title: 'Beginner',
          description: 'Sample level',
        },
      ];
    }
  }

  async listCourses() {
    try {
      const courses = await this.prisma.course.findMany({
        where: { isPublished: true },
        orderBy: [{ level: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          level: {
            select: {
              code: true,
              title: true,
            },
          },
        },
      });

      return courses.length > 0 || !this.canReturnSampleCatalog()
        ? courses
        : [
            {
              id: sampleOutline.id,
              slug: sampleOutline.slug,
              title: sampleOutline.title,
              level: sampleOutline.level,
            },
          ];
    } catch (error) {
      if (!this.canReturnSampleCatalog()) {
        throw error;
      }

      return [
        {
          id: sampleOutline.id,
          slug: sampleOutline.slug,
          title: sampleOutline.title,
          level: sampleOutline.level,
        },
      ];
    }
  }

  async getCourseOutline(slug: string) {
    try {
      const course = await this.prisma.course.findFirst({
        where: { slug, isPublished: true },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          level: {
            select: {
              code: true,
              title: true,
            },
          },
          units: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              lessons: {
                where: { status: 'PUBLISHED' },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  type: true,
                  status: true,
                  durationSec: true,
                },
              },
            },
          },
        },
      });

      if (course) {
        return course;
      }
    } catch (error) {
      if (!this.canReturnSampleCatalog()) {
        throw error;
      }

      if (slug === sampleOutline.slug) {
        return sampleOutline;
      }
    }

    if (slug === sampleOutline.slug && this.canReturnSampleCatalog()) {
      return sampleOutline;
    }

    throw new NotFoundException('Course not found');
  }

  private canReturnSampleCatalog() {
    return process.env.NODE_ENV !== 'production';
  }
}
