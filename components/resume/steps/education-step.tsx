import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EducationItem, ResumeDraft } from '@/types/resume'
import { Plus, X } from 'lucide-react'

interface EducationStepProps {
  draft: ResumeDraft
  setEducation: (value: EducationItem[]) => void
}

const newEducationItem = (): EducationItem => ({
  school: '',
  degree: '',
  field: '',
  graduationDate: '',
})

export function EducationStep({ draft, setEducation }: EducationStepProps) {
  return (
    <div className="space-y-4">
      {draft.education.map((edu, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-end">
            <button
              className="text-red-600 hover:text-red-700"
              onClick={() => setEducation(draft.education.filter((_, i) => i !== idx))}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <Input
            placeholder="School/University"
            value={edu.school}
            onChange={(e) => {
              const next = [...draft.education]
              next[idx].school = e.target.value
              setEducation(next)
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => {
                const next = [...draft.education]
                next[idx].degree = e.target.value
                setEducation(next)
              }}
            />

            <Input
              placeholder="Field"
              value={edu.field}
              onChange={(e) => {
                const next = [...draft.education]
                next[idx].field = e.target.value
                setEducation(next)
              }}
            />
          </div>

          <Input
            placeholder="Graduation Date"
            value={edu.graduationDate}
            onChange={(e) => {
              const next = [...draft.education]
              next[idx].graduationDate = e.target.value
              setEducation(next)
            }}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setEducation([...draft.education, newEducationItem()])}
      >
        <Plus size={18} className="mr-2" />
        Add Education
      </Button>
    </div>
  )
}
