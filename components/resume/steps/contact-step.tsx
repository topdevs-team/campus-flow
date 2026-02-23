import { Input } from '@/components/ui/input'
import { ResumeDraft } from '@/types/resume'

interface ContactStepProps {
  draft: ResumeDraft
  onChange: (patch: Partial<ResumeDraft>) => void
}

export function ContactStep({ draft, onChange }: ContactStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <Input
          value={draft.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          placeholder="Jane Doe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <Input
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          value={draft.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Boston, MA"
        />
      </div>
    </div>
  )
}
