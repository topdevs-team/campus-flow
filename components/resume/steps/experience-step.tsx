import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ExperienceItem, ResumeDraft } from '@/types/resume'
import { Plus, X } from 'lucide-react'

interface ExperienceStepProps {
  draft: ResumeDraft
  setExperience: (value: ExperienceItem[]) => void
}

const newExperienceItem = (): ExperienceItem => ({
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
})

export function ExperienceStep({ draft, setExperience }: ExperienceStepProps) {
  return (
    <div className="space-y-4">
      {draft.experience.map((exp, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="text-red-600 hover:text-red-700"
              onClick={() => setExperience(draft.experience.filter((_, i) => i !== idx))}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Position"
              value={exp.position}
              onChange={(e) => {
                const next = [...draft.experience]
                next[idx].position = e.target.value
                setExperience(next)
              }}
            />
            <Input
              placeholder="Company"
              value={exp.company}
              onChange={(e) => {
                const next = [...draft.experience]
                next[idx].company = e.target.value
                setExperience(next)
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Start Date"
              value={exp.startDate}
              onChange={(e) => {
                const next = [...draft.experience]
                next[idx].startDate = e.target.value
                setExperience(next)
              }}
            />
            <Input
              placeholder="End Date"
              value={exp.endDate}
              onChange={(e) => {
                const next = [...draft.experience]
                next[idx].endDate = e.target.value
                setExperience(next)
              }}
            />
          </div>

          <Textarea
            placeholder="Description"
            rows={4}
            value={exp.description}
            onChange={(e) => {
              const next = [...draft.experience]
              next[idx].description = e.target.value
              setExperience(next)
            }}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setExperience([...draft.experience, newExperienceItem()])}
      >
        <Plus size={18} className="mr-2" />
        Add Experience
      </Button>
    </div>
  )
}
