import { z } from 'zod';

export const ExperienceItemSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).min(1),
});

export const ExperienceCollectionSchema = z.array(ExperienceItemSchema).min(1);

export const SkillRowSchema = z.object({
  category: z.string().min(1),
  items: z.string().min(1),
  cool: z.boolean(),
});

export const SkillCollectionSchema = z.array(SkillRowSchema).min(1);

export const ProjectSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  icon: z.enum(['zap', 'activity', 'code', 'brain']),
  confidential: z.boolean(),
  problem: z.string().min(1),
  approach: z.string().min(1),
  impact: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .min(1),
  stack: z.array(z.string().min(1)).min(1),
  link: z.string(),
});

export const ProjectCollectionSchema = z.array(ProjectSchema).min(1);

export const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  discipline: z.string().min(1),
  tagline: z.string().min(1),
  pullquote: z.string().min(1),
  email: z.string().email(),
  location: z.string().min(1),
  languages: z.string().min(1),
  status: z.string().min(1),
  stack: z.string().min(1),
  currentEmployer: z.string().min(1),
  currentTeam: z.string().min(1),
  socials: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
    medium: z.string().url(),
    twitter: z.string().url(),
  }),
  available: z.boolean(),
  metrics: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .min(1),
  resume: z.string().min(1),
});

export const CredentialsSchema = z.object({
  certifications: z
    .array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().min(1),
        date: z.string(),
      }),
    )
    .min(1),
  education: z
    .array(
      z.object({
        qualification: z.string().min(1),
        institution: z.string().min(1),
        period: z.string().min(1),
      }),
    )
    .min(1),
});
