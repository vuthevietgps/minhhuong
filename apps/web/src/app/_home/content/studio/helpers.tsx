"use client";

import type { ContentTag, ContentTagKind } from "../../types";

export type AdminVideo = {
  id: string;
  title?: string;
  provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
  processingStatus: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  sourceUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
};

export type AdminLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  videos: AdminVideo[];
  activities: AdminActivity[];
  tags?: Array<{
    tag: ContentTag;
  }>;
  unit?: {
    title: string;
    course?: {
      title: string;
      level?: {
        code: string;
      };
    };
  };
};

export type AdminAnswer = {
  id: string;
  text: string;
  isCorrect?: boolean;
  sortOrder: number;
};

export type AdminQuestion = {
  id: string;
  type:
    | "SINGLE_CHOICE"
    | "MULTIPLE_CHOICE"
    | "TEXT_INPUT"
    | "ORDERING"
    | "SPEAKING";
  prompt: string;
  explanation?: string;
  points: number;
  answers: AdminAnswer[];
};

export type AdminActivity = {
  id: string;
  title: string;
  description?: string;
  type:
    "QUIZ" | "VOCAB_GAME" | "LISTENING" | "SPEAKING" | "WRITING" | "AI_CHAT";
  questions: AdminQuestion[];
};

export type AdminUnit = {
  id: string;
  title: string;
  lessons: AdminLesson[];
};

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  level: {
    code: string;
    title: string;
  };
  units: AdminUnit[];
};

export type ContentOverview = {
  courses: number;
  lessons: number;
  videos: number;
  status: {
    drafts: number;
    inReview: number;
    published: number;
  };
};

export const tagKindLabels: Record<ContentTagKind, string> = {
  TOPIC: "Chủ đề",
  AUDIENCE: "Đối tượng",
  LEVEL: "Trình độ",
  SKILL: "Kỹ năng",
  FORMAT: "Định dạng",
  INTENT: "Mục tiêu",
  CUSTOM: "Tùy chỉnh",
};
