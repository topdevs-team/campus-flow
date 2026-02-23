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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  { id: 'contact', title: 'Contact', icon: UserRound },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'skills', title: 'Skills', icon: Wrench },
  { id: 'summary', title: 'Summary', icon: Sparkles },
  { id: 'experience', title: 'Experience', icon: BriefcaseBusiness },
  { id: 'projects', title: 'Projects', icon: FileCheck2 },
  { id: 'template', title: 'Template & Review', icon: Palette },
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

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Loading resume workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
      <div className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-widest text-slate-300">
              <Sparkles size={12} />
              Resume Studio
            </p>
            <h1 className="text-2xl font-bold text-white md:text-3xl">LaTeX Resume Builder</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Build your resume in guided steps, preview it live, and export high-quality PDFs.
            </p>
          </div>
          <div className="hidden md:block rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-400">Completion</p>
            <p className="text-xl font-semibold text-white">{progressPercent}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="h-fit border-slate-800 bg-slate-950/60 lg:col-span-1 lg:sticky lg:top-24">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-100">Steps</CardTitle>
            <CardDescription className="text-slate-400">{completion}/{steps.length} sections ready</CardDescription>
            <div className="h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-1.5 rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  idx === stepIndex
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                    idx === stepIndex ? 'bg-emerald-300/20 text-emerald-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <step.icon size={14} />
                </span>
                <span>{idx + 1}. {step.title}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card className="border-slate-800 bg-slate-950/60">
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-100">{currentStep.title}</CardTitle>
                  <CardDescription className="text-slate-400">Step {stepIndex + 1} of {steps.length}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={previousStep} disabled={stepIndex === 0} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  <Button onClick={nextStep} disabled={stepIndex === steps.length - 1} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardHeader className="pb-2 pt-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={saveDraft} disabled={saving} className="bg-slate-200 text-slate-900 hover:bg-white">
                  <Save size={16} className="mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button onClick={downloadPdf} disabled={downloading} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
                  <Download size={16} className="mr-2" />
                  {downloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8 overflow-hidden border-slate-800 bg-slate-950/60">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <FileCheck2 size={18} />
            Live Template Preview
          </CardTitle>
          <CardDescription className="text-slate-400">Updates automatically as you edit your resume.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {previewLoading && (
            <div className="flex h-[520px] items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mr-2" size={16} />
              Rendering preview...
            </div>
          )}

          {!previewLoading && previewError && (
            <div className="flex h-[520px] items-center justify-center px-6 text-center text-sm text-red-400">
              {previewError}
            </div>
          )}

          {!previewLoading && !previewError && previewUrl && (
            <iframe
              title="Resume Preview"
              src={previewUrl}
              className="h-[520px] w-full bg-white"
            />
          )}

          {!previewLoading && !previewError && !previewUrl && (
            <div className="flex h-[520px] items-center justify-center text-slate-400">
              Preview will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
