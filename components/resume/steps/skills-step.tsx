import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResumeDraft } from '@/types/resume'
import { X } from 'lucide-react'
import { useState } from 'react'

interface SkillsStepProps {
  draft: ResumeDraft
  setSkills: (skills: string[]) => void
}

export function SkillsStep({ draft, setSkills }: SkillsStepProps) {
  const [skillInput, setSkillInput] = useState('')

  const addSkill = () => {
    const value = skillInput.trim()
    if (!value) return
    setSkills([...draft.skills, value])
    setSkillInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {draft.skills.map((skill, idx) => (
          <div key={`${skill}-${idx}`} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            {skill}
            <button
              type="button"
              onClick={() => setSkills(draft.skills.filter((_, i) => i !== idx))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={skillInput}
          placeholder="Add a skill"
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
      </div>
    </div>
  )
}
