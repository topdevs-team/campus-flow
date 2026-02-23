import { z } from 'zod'
import { defaultResumeDraft, ResumeDraft, TemplateId } from '@/types/resume'

const educationItemSchema = z.object({
  school: z.string().trim().default(''),
  degree: z.string().trim().default(''),
  field: z.string().trim().default(''),
  graduationDate: z.string().trim().default(''),
})

const experienceItemSchema = z.object({
  company: z.string().trim().default(''),
  position: z.string().trim().default(''),
  startDate: z.string().trim().default(''),
  endDate: z.string().trim().default(''),
  description: z.string().trim().default(''),
})

const projectItemSchema = z.object({
  name: z.string().trim().default(''),
  role: z.string().trim().default(''),
  technologies: z.string().trim().default(''),
  description: z.string().trim().default(''),
  link: z.string().trim().default(''),
})

export const resumeDraftSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().default(''),
  location: z.string().trim().default(''),
  summary: z.string().trim().default(''),
  education: z.array(educationItemSchema).min(1, 'At least one education entry is required'),
  experience: z.array(experienceItemSchema).default([]),
  skills: z.array(z.string().trim().min(1)).min(1, 'At least one skill is required'),
  projects: z.array(projectItemSchema).default([]),
  template_id: z.enum(['classic', 'modern', 'compact']).default('classic'),
  profile_image_filename: z.string().trim().default(''),
  profile_image_base64: z.string().trim().default(''),
})

const resumeDraftLooseSchema = z.object({
  full_name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  education: z.array(educationItemSchema).optional().nullable(),
  experience: z.array(experienceItemSchema).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  projects: z.array(projectItemSchema).optional().nullable(),
  template_id: z.enum(['classic', 'modern', 'compact']).optional().nullable(),
  profile_image_filename: z.string().optional().nullable(),
  profile_image_base64: z.string().optional().nullable(),
})

export function normalizeResumeDraft(input: unknown): ResumeDraft {
  const defaults = defaultResumeDraft()
  const parsed = resumeDraftLooseSchema.safeParse(input)

  if (!parsed.success) {
    return defaults
  }

  return {
    full_name: (parsed.data.full_name ?? defaults.full_name).trim(),
    email: (parsed.data.email ?? defaults.email).trim(),
    phone: (parsed.data.phone ?? defaults.phone).trim(),
    location: (parsed.data.location ?? defaults.location).trim(),
    summary: (parsed.data.summary ?? defaults.summary).trim(),
    education: parsed.data.education ?? defaults.education,
    experience: parsed.data.experience ?? defaults.experience,
    skills: (parsed.data.skills ?? defaults.skills).map((skill) => skill.trim()).filter(Boolean),
    projects: parsed.data.projects ?? defaults.projects,
    template_id: (parsed.data.template_id ?? defaults.template_id) as TemplateId,
    profile_image_filename: (parsed.data.profile_image_filename ?? defaults.profile_image_filename).trim(),
    profile_image_base64: (parsed.data.profile_image_base64 ?? defaults.profile_image_base64).trim(),
  }
}
