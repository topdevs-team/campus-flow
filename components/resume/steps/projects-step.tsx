import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ProjectItem, ResumeDraft } from '@/types/resume'
import { Plus, X } from 'lucide-react'

interface ProjectsStepProps {
  draft: ResumeDraft
  setProjects: (value: ProjectItem[]) => void
}

const newProjectItem = (): ProjectItem => ({
  name: '',
  role: '',
  technologies: '',
  description: '',
  link: '',
})

export function ProjectsStep({ draft, setProjects }: ProjectsStepProps) {
  return (
    <div className="space-y-4">
      {draft.projects.map((project, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="text-red-600 hover:text-red-700"
              onClick={() => setProjects(draft.projects.filter((_, i) => i !== idx))}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Project Name"
              value={project.name}
              onChange={(e) => {
                const next = [...draft.projects]
                next[idx].name = e.target.value
                setProjects(next)
              }}
            />
            <Input
              placeholder="Role"
              value={project.role}
              onChange={(e) => {
                const next = [...draft.projects]
                next[idx].role = e.target.value
                setProjects(next)
              }}
            />
          </div>

          <Input
            placeholder="Technologies (comma separated)"
            value={project.technologies}
            onChange={(e) => {
              const next = [...draft.projects]
              next[idx].technologies = e.target.value
              setProjects(next)
            }}
          />

          <Textarea
            placeholder="Project Description"
            rows={4}
            value={project.description}
            onChange={(e) => {
              const next = [...draft.projects]
              next[idx].description = e.target.value
              setProjects(next)
            }}
          />

          <Input
            placeholder="Link (optional)"
            value={project.link}
            onChange={(e) => {
              const next = [...draft.projects]
              next[idx].link = e.target.value
              setProjects(next)
            }}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setProjects([...draft.projects, newProjectItem()])}
      >
        <Plus size={18} className="mr-2" />
        Add Project
      </Button>
    </div>
  )
}
