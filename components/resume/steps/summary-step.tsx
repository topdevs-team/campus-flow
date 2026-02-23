import { Textarea } from '@/components/ui/textarea'
import { ResumeDraft } from '@/types/resume'

interface SummaryStepProps {
  draft: ResumeDraft
  onChange: (patch: Partial<ResumeDraft>) => void
}

export function SummaryStep({ draft, onChange }: SummaryStepProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Professional Summary (Optional)</label>
      <Textarea
        rows={6}
        value={draft.summary}
        onChange={(e) => onChange({ summary: e.target.value })}
        placeholder="2-4 lines about your strengths and goals"
      />
    </div>
  )
}
