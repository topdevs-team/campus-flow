'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  GraduationCap,
  Loader2,
  Palette,
  Save,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { ContactStep } from '@/components/resume/steps/contact-step'
import { EducationStep } from '@/components/resume/steps/education-step'
import { SkillsStep } from '@/components/resume/steps/skills-step'
import { SummaryStep } from '@/components/resume/steps/summary-step'
import { ExperienceStep } from '@/components/resume/steps/experience-step'
import { ProjectsStep } from '@/components/resume/steps/projects-step'
import { TemplateReviewStep } from '@/components/resume/steps/template-review-step'
import { defaultResumeDraft, ResumeDraft, TemplateId } from '@/types/resume'

const steps = [
  { id: 'template',   title: 'Template',   icon: Palette },
  { id: 'contact',    title: 'Contact',    icon: UserRound },
  { id: 'education',  title: 'Education',  icon: GraduationCap },
  { id: 'skills',     title: 'Skills',     icon: Wrench },
  { id: 'summary',    title: 'Summary',    icon: Sparkles },
  { id: 'experience', title: 'Experience', icon: BriefcaseBusiness },
  { id: 'projects',   title: 'Projects',   icon: FileCheck2 },
] as const

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hasResumeContent(draft: ResumeDraft) {
  return Boolean(
    draft.full_name.trim() ||
      draft.email.trim() ||
      draft.phone.trim() ||
      draft.location.trim() ||
      draft.summary.trim() ||
      draft.education.length ||
      draft.experience.length ||
      draft.skills.length ||
      draft.projects.length
  )
}

export default function ResumePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [draft, setDraft] = useState<ResumeDraft>(defaultResumeDraft())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const previewObjectUrlRef = useRef<string | null>(null)

  const currentStep = steps[stepIndex]

  const completion = useMemo(() => {
    let done = 0
    if (draft.full_name.trim() && isValidEmail(draft.email.trim())) done += 1
    if (draft.education.length > 0) done += 1
    if (draft.skills.length > 0) done += 1
    if (draft.summary.trim()) done += 1
    if (draft.experience.length > 0) done += 1
    if (draft.projects.length > 0) done += 1
    if (draft.template_id) done += 1
    return done
  }, [draft])
  const progressPercent = Math.round((completion / steps.length) * 100)

  useEffect(() => {
    if (user?.id && loadedUserId !== user.id) {
      setLoadedUserId(user.id)
      void loadResume()
    }
  }, [user?.id, loadedUserId])

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
    }
  }, [])

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token
  }

  const loadResume = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load resume')
      }

      const payload = await response.json()
      setDraft(payload.resume)
    } catch (error) {
      console.error('Failed to load resume:', error)
      setDraft((prev) => {
        if (hasResumeContent(prev)) {
          return prev
        }

        return {
          ...defaultResumeDraft(),
          full_name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch('/api/resume', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error || 'Save failed')
      }

      const payload = await response.json()
      setDraft(payload.resume)
      toast({
        title: 'Draft saved',
        description: 'Your resume draft has been updated.',
      })
    } catch (error) {
      console.error('Save draft failed:', error)
      toast({
        title: 'Save failed',
        description: 'Could not save your draft. Try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async () => {
    setDownloading(true)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch('/api/resume/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)

        if (response.status === 400 && errorPayload?.code === 'VALIDATION_ERROR') {
          const fieldErrors = errorPayload?.details?.fieldErrors as Record<string, string[] | undefined> | undefined
          const messages = [
            ...(fieldErrors?.full_name ?? []),
            ...(fieldErrors?.email ?? []),
            ...(fieldErrors?.education ?? []),
            ...(fieldErrors?.skills ?? []),
          ].filter(Boolean)

          throw new Error(messages[0] || 'Validation failed: complete required sections (Contact, Education, Skills).')
        }

        throw new Error(errorPayload?.detail || errorPayload?.error || 'PDF generation failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Download started',
        description: 'Your PDF resume is downloading.',
      })
    } catch (error) {
      console.error('Download PDF failed:', error)
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unable to generate PDF.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (!user || loading) return

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setPreviewLoading(true)
        setPreviewError(null)

        const token = await getAccessToken()
        if (!token) throw new Error('No auth token')

        const response = await fetch('/api/resume/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(draft),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null)
          throw new Error(errorPayload?.error || 'Live preview failed')
        }

        const blob = await response.blob()
        const nextUrl = URL.createObjectURL(blob)

        if (previewObjectUrlRef.current) {
          URL.revokeObjectURL(previewObjectUrlRef.current)
        }

        previewObjectUrlRef.current = nextUrl
        setPreviewUrl(nextUrl)
      } catch (error) {
        if (controller.signal.aborted) return
        setPreviewError(error instanceof Error ? error.message : 'Preview failed')
      } finally {
        if (!controller.signal.aborted) {
          setPreviewLoading(false)
        }
      }
    }, 900)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [draft, user, loading])

  const validateStep = (index: number) => {
    const step = steps[index]?.id

    if (step === 'template') {
      if (!draft.template_id) {
        toast({
          title: 'Pick a template',
          description: 'Choose a template to continue.',
          variant: 'destructive',
        })
        return false
      }
    }

    if (step === 'contact') {
      if (!draft.full_name.trim() || !isValidEmail(draft.email.trim())) {
        toast({
          title: 'Contact details required',
          description: 'Enter full name and a valid email to continue.',
          variant: 'destructive',
        })
        return false
      }
    }

    if (step === 'education' && draft.education.length < 1) {
      toast({
        title: 'Education required',
        description: 'Add at least one education entry.',
        variant: 'destructive',
      })
      return false
    }

    if (step === 'skills' && draft.skills.length < 1) {
      toast({
        title: 'Skills required',
        description: 'Add at least one skill.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const nextStep = () => {
    if (!validateStep(stepIndex)) return
    setStepIndex((idx) => Math.min(idx + 1, steps.length - 1))
  }

  const previousStep = () => {
    setStepIndex((idx) => Math.max(idx - 1, 0))
  }

  const templates: { id: TemplateId; label: string; desc: string; img: string }[] = [
    { id: 'classic', label: 'Classic', desc: 'Clean single-column layout. Timeless and ATS-friendly.', img: '/templates/classic.png' },
    { id: 'modern', label: 'Modern', desc: 'Bold header with accent colours. Stands out visually.', img: '/templates/compact.png' },
    { id: 'compact', label: 'Compact', desc: 'Two-column design with photo. Great for dense content.', img: '/templates/modern.png' },
  ]

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm font-medium">Loading resume workspaceâ€¦</span>
        </div>
      </div>
    )
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     STEP 0 â€” Full-page template picker
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (stepIndex === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 bg-white">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Step 1 of {steps.length}</p>
        <h1 className="text-4xl font-black tracking-tight text-black mb-2">Choose your template</h1>
        <p className="text-sm text-zinc-400 mb-12">Pick a style to get started. You can change it later.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          {templates.map((t) => {
            const selected = draft.template_id === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, template_id: t.id }))}
                className={`group flex flex-col rounded-2xl border-2 overflow-hidden transition-all text-left ${
                  selected ? 'border-black shadow-lg' : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-full aspect-3/4 bg-zinc-100 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt={t.label}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                      const fb = e.currentTarget.nextElementSibling as HTMLElement | null
                      if (fb) fb.style.display = 'flex'
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-zinc-300 text-xs font-bold uppercase tracking-widest absolute inset-0">
                    {t.label}
                  </div>
                  {selected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className={`px-4 py-3 border-t ${selected ? 'border-black bg-black' : 'border-zinc-200 bg-white'}`}>
                  <p className={`text-sm font-black ${selected ? 'text-white' : 'text-black'}`}>{t.label}</p>
                  <p className={`text-xs mt-0.5 leading-snug ${selected ? 'text-zinc-300' : 'text-zinc-400'}`}>{t.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={nextStep}
          disabled={!draft.template_id}
          className="mt-12 flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue with {draft.template_id ? templates.find(t => t.id === draft.template_id)?.label : 'â€¦'}
          <ChevronRight size={15} />
        </button>
      </div>
    )
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     STEPS 1-6 â€” Two-column form + live preview
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const formSteps = steps.slice(1)           // contact â€¦ projects
  const formIndex = stepIndex - 1            // 0-based within formSteps

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* â”€â”€ Top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-3">
          {/* Back to template */}
          <button
            onClick={() => setStepIndex(0)}
            className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-black transition-colors"
          >
            <ChevronLeft size={13} />
            <span className="capitalize">{draft.template_id}</span>
          </button>
          <span className="text-zinc-200">|</span>
          <div>
            <h1 className="text-sm font-black tracking-tight text-black">Resume Builder</h1>
            <p className="text-[11px] text-zinc-400">{completion}/{steps.length} sections complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg bg-white text-zinc-700 hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Save size={12} />
            {saving ? 'Savingâ€¦' : 'Save'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-black text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <Download size={12} />
            {downloading ? 'Generatingâ€¦' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* â”€â”€ Progress bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="h-0.5 bg-zinc-100">
        <div className="h-0.5 bg-black transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* â”€â”€ Two-column body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT â€” form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col w-full lg:w-[55%] overflow-y-auto border-r border-zinc-200">

          {/* Step tabs */}
          <div className="flex gap-0 overflow-x-auto border-b border-zinc-200">
            {formSteps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(idx + 1)}
                className={`flex items-center gap-1.5 shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  idx === formIndex
                    ? 'border-black text-black'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <step.icon size={11} />
                {step.title}
              </button>
            ))}
          </div>

          {/* Step heading */}
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-black text-black">{currentStep.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Step {stepIndex} of {steps.length - 1}</p>
          </div>

          {/* Step form */}
          <div className="flex-1 px-6 py-4">
            {currentStep.id === 'contact' && (
              <ContactStep draft={draft} onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))} />
            )}
            {currentStep.id === 'education' && (
              <EducationStep draft={draft} setEducation={(education) => setDraft((prev) => ({ ...prev, education }))} />
            )}
            {currentStep.id === 'skills' && (
              <SkillsStep draft={draft} setSkills={(skills) => setDraft((prev) => ({ ...prev, skills }))} />
            )}
            {currentStep.id === 'summary' && (
              <SummaryStep draft={draft} onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))} />
            )}
            {currentStep.id === 'experience' && (
              <ExperienceStep draft={draft} setExperience={(experience) => setDraft((prev) => ({ ...prev, experience }))} />
            )}
            {currentStep.id === 'projects' && (
              <ProjectsStep draft={draft} setProjects={(projects) => setDraft((prev) => ({ ...prev, projects }))} />
            )}
            {currentStep.id === 'template' && (
              <TemplateReviewStep
                draft={draft}
                setTemplate={(template_id: TemplateId) => setDraft((prev) => ({ ...prev, template_id }))}
                setProfileImage={(profile_image_filename, profile_image_base64) =>
                  setDraft((prev) => ({ ...prev, profile_image_filename, profile_image_base64 }))
                }
              />
            )}
          </div>

          {/* Step nav footer */}
          <div className="sticky bottom-0 flex items-center justify-between px-6 py-3 border-t border-zinc-200 bg-white">
            <button
              type="button"
              onClick={previousStep}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-all"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span className="text-xs text-zinc-400 font-medium">{formIndex + 1} / {formSteps.length}</span>
            <button
              type="button"
              onClick={nextStep}
              disabled={stepIndex === steps.length - 1}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-black text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-30"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* RIGHT â€” live preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="hidden lg:flex flex-col flex-1 bg-zinc-50">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-white">
            <div className="flex items-center gap-2">
              <FileCheck2 size={13} className="text-zinc-400" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Live Preview</span>
            </div>
            {previewLoading && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <Loader2 size={11} className="animate-spin" /> Renderingâ€¦
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {previewLoading && !previewUrl && (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Loader2 size={15} className="animate-spin" /> Rendering previewâ€¦
                </div>
              </div>
            )}
            {!previewLoading && previewError && (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <div>
                  <p className="text-sm font-bold text-zinc-700 mb-1">Preview unavailable</p>
                  <p className="text-xs text-zinc-400">{previewError}</p>
                </div>
              </div>
            )}
            {previewUrl && (
              <iframe
                title="Resume Preview"
                src={previewUrl}
                className="w-full h-full bg-white"
                style={{ opacity: previewLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}
              />
            )}
            {!previewLoading && !previewError && !previewUrl && (
              <div className="flex h-full items-center justify-center text-zinc-300 text-sm">
                Fill in your details to see the preview.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
