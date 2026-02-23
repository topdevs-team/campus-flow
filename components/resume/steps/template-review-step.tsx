import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResumeDraft, TemplateId } from '@/types/resume'
import { Input } from '@/components/ui/input'

interface TemplateReviewStepProps {
  draft: ResumeDraft
  setTemplate: (template: TemplateId) => void
  setProfileImage: (filename: string, base64: string) => void
}

const templates: Array<{ id: TemplateId; label: string; description: string }> = [
  { id: 'classic', label: 'Classic', description: 'ATS-safe standard format.' },
  { id: 'modern', label: 'Modern', description: 'Clean style with subtle accent.' },
  { id: 'compact', label: 'Compact', description: 'Dense one-page layout.' },
]

export function TemplateReviewStep({ draft, setTemplate, setProfileImage }: TemplateReviewStepProps) {
  const handleImageUpload = (file: File | undefined) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      setProfileImage(file.name, value)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button key={template.id} type="button" onClick={() => setTemplate(template.id)} className="text-left">
            <Card className={draft.template_id === template.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}>
              <CardHeader>
                <CardTitle className="text-base">{template.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{template.description}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Profile Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Upload a profile image for template preview/export. For modern and compact templates this replaces the default profile image.
          </p>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />
          {draft.profile_image_filename ? (
            <p className="text-xs text-slate-500">Selected: {draft.profile_image_filename}</p>
          ) : (
            <p className="text-xs text-slate-500">No custom image selected (default placeholder is used).</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resume Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><span className="font-semibold">Name:</span> {draft.full_name || 'Not set'}</p>
            <p><span className="font-semibold">Email:</span> {draft.email || 'Not set'}</p>
            <p><span className="font-semibold">Education:</span> {draft.education.length}</p>
            <p><span className="font-semibold">Skills:</span> {draft.skills.length}</p>
            <p><span className="font-semibold">Experience:</span> {draft.experience.length}</p>
            <p><span className="font-semibold">Projects:</span> {draft.projects.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
