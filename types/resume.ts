export type TemplateId = 'classic' | 'modern' | 'compact'

export interface EducationItem {
  school: string
  degree: string
  field: string
  graduationDate: string
}

export interface ExperienceItem {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

export interface ProjectItem {
  name: string
  role: string
  technologies: string
  description: string
  link: string
}

export interface ResumeDraft {
  full_name: string
  email: string
  phone: string
  location: string
  summary: string
  education: EducationItem[]
  experience: ExperienceItem[]
  skills: string[]
  projects: ProjectItem[]
  template_id: TemplateId
  profile_image_filename: string
  profile_image_base64: string
}

export function defaultResumeDraft(): ResumeDraft {
  return {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    template_id: 'classic',
    profile_image_filename: '',
    profile_image_base64: '',
  }
}
