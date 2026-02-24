'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { FileText, Loader2, Plus, Users, User, Trash2, ExternalLink, X, Upload } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Note {
  id: string
  title: string
  course: string
  pdf_name?: string
  pdf_url?: string
  user_id: string
  created_at: string
  uploader_name?: string
}

const COURSE_CODES = [
  'BACSE101','BAEEE101','BAENG101','BAMAT101','BAPHY105','BCHY101L',
  'BCLE214L','BCLE215L','BCLE216L','BCSE202L','BCSE202P','BCSE203L',
  'BCSE204L','BCSE204P','BCSE205L','BCSE209L','BCSE301L','BCSE301P',
  'BCSE302L','BCSE302P','BCSE303L','BCSE303P','BCSE304L','BCSE305L',
  'BCSE306L','BCSE307L','BCSE307P','BCSE308L','BCSE308P','BCSE309L',
  'BCSE313L','BCSE315L','BCSE316L','BCSE324L','BCSE332L','BCSE355L',
  'BCSE401L','BCSE403L','BCSE404L','BCSE409L','BCSE412L','BCSE414L',
  'BCSE415L','BCSE416L','BCSE417L','BCSE418L','BCSE420L','BCSE420P',
  'BCSE421L','BCSE422L','BCSE424L','BCSE425L','BCSE427L','BCSE428L',
  'BECE102L','BECE102P','BECE201L','BECE202L','BECE203E','BECE204L',
  'BECE204P','BECE205L','BECE206L','BECE207L','BECE301L','BECE301P',
  'BECE302L','BECE303L','BECE304L','BECE304P','BECE305L','BECE305P',
  'BECE306L','BECE306P','BECE312L','BECE317L','BECE318L','BECE320E',
  'BECE351E','BECE355L','BECE401L','BECE403E','BECE406E','BECE409E',
  'BECE409P','BECE411L','BECM301L','BECM301P','BECM304L','BEEE102L',
  'BEEE412L','BENG101L','BHUM104L','BHUM107L','BHUM109L','BMAT101L',
  'BMAT102L','BMAT201L','BMAT202L','BMAT202P','BMAT205L','BMGT101',
  'BMGT103L','BSTS301P',
]

const COURSE_NAMES = [
  'All',
  'AWS Solutions Architect',
  'AWS for Cloud Computing',
  'Advanced Competitive Coding',
  'Analog Circuits',
  'Analog Communications',
  'Analog Communications Lab',
  'Antenna & Microwave Engineering',
  'Antenna & Microwave Engineering (Lab)',
  'Artificial Intelligence',
  'Autonomous Drones',
  'Basic Electrical and Electronics Engineering',
  'Basic Engineering',
  'Calculas',
  'Circuit Theory',
  'Cognitive Robotics',
  'Compiler Design',
  'Compiler Design Lab',
  'Complex Variables and Linear Algebra',
  'Computer Architecture and Organization',
  'Computer Communications and Networks',
  'Computer Networks',
  'Computer Networks Lab',
  'Control Systems',
  'Cryptography and Network Security',
  'Cryptography and Network Security (Lab)',
  'DSA',
  'DSA Lab',
  'DSD',
  'DSD Lab',
  'DSP',
  'DSP Lab',
  'Database Systems',
  'Database Systems (Lab)',
  'Deep Learning',
  'Design and Analysis of Algorithms',
  'Design and Analysis of Algorithms (Lab)',
  'Design of Smart Cities',
  'Differential Equation and Transformations',
  'Digital Communication Systems',
  'Digital Communication Systems (Lab)',
  'Digital Image Processing',
  'Digital System Design',
  'Discrete Maths and Graph Theory',
  'EMT',
  'Electronic Materials & Devices',
  'Embedded C Programming',
  'Embedded Systems',
  'Embedded Systems Design',
  'Engineering Chemistry',
  'Engineering Physics',
  'Explainable AI',
  'FPGA Based System Design',
  'Foundations of Blockchain Technology',
  'Foundations of Data Science',
  'Fundamentals of Fog Edge and Computing',
  'Game Programming',
  'Global Warming',
  'High Performance Computing',
  'Human Computer Interaction',
  'Internet and Web Programming',
  'Internet of Things',
  'ML for Robotics',
  'MPMC',
  'MPMC Lab',
  'Machine Learning',
  'Machine Vision',
  'Macro Economics',
  'Management and Principles of Leadership',
  'Multivariable Calculus and Differential Equation',
  'Natural Language Processing',
  'Operating Systems',
  'Operating Systems Lab',
  'Optical Fiber Communications',
  'Organizational Behavior',
  'Parallel Computing',
  'Principles of Communication Systems',
  'Probability and Statistics',
  'Probability and Statistics Lab',
  'Random Processes',
  'Robot Modeling and Simulation',
  'Robotic Perception',
  'Robotics and Automation',
  'Robotics: Kinematics, Dynamics and Motion Control',
  'Sensor Technology',
  'Sensor Technology Lab',
  'Sensors and Actuators',
  'Sensors, Actuators and Signal Conditioning',
  'Signal Processing',
  'Signal Processing Lab',
  'Signals and Systems',
  'Social Work and Sustainability',
  'Software Engineering',
  'Software Engineering Lab',
  'Sustainability and Society',
  'Technical English Communication',
  'Technical Communication',
  'Technical Report Writing',
  'Theory of Computation',
  'VLSI System Design',
  'Waste Management',
  'Water Resource Management',
  'Wearable Computing',
  'Web Programming',
  'Wireless and Mobile C',
]

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filterCode, setFilterCode] = useState('all')
  const [filterName, setFilterName] = useState('All')
  const [activeTab, setActiveTab] = useState('my-notes')
  const [communityNotes, setCommunityNotes] = useState<Note[]>([])
  const [communityLoading, setCommunityLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user, filterCode, filterName])

  useEffect(() => {
    if (activeTab === 'community') {
      loadCommunityNotes()
    }
  }, [activeTab, filterCode, filterName])

  const loadNotes = async () => {
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (filterCode !== 'all') query = query.ilike('course', `%${filterCode}%`)
      if (filterName !== 'All') query = query.ilike('title', `%${filterName}%`)

      const { data } = await query
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCommunityNotes = async () => {
    setCommunityLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .neq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (filterCode !== 'all') query = query.ilike('course', `%${filterCode}%`)
      if (filterName !== 'All') query = query.ilike('title', `%${filterName}%`)

      const { data } = await query
      setCommunityNotes(data || [])
    } catch (error) {
      console.error('Error loading community notes:', error)
    } finally {
      setCommunityLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)
    try {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('notes')
        .getPublicUrl(fileName)

      const { error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title,
          course: course || 'Uncategorized',
          pdf_url: publicUrlData.publicUrl,
          pdf_name: file.name,
        })
        .select()

      if (noteError) throw noteError

      toast.success('Note uploaded successfully!')
      setTitle('')
      setCourse('')
      setFile(null)
      setShowForm(false)
      await loadNotes()
    } catch (error) {
      console.error('Error uploading note:', error)
      toast.error('Failed to upload note. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    toast('Are you sure you want to delete this note?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await supabase.from('notes').delete().eq('id', noteId)
            await loadNotes()
            if (activeTab === 'community') {
              await loadCommunityNotes()
            }
            toast.success('Note deleted successfully.')
          } catch (error) {
            console.error('Error deleting note:', error)
            toast.error('Failed to delete note. Please try again.')
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  const filteredNotes = notes

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">Loading notesâ€¦</span>
        </div>
      </div>
    )
  }

  const renderNoteCard = (note: Note) => (
    <div key={note.id} className="group flex flex-col gap-3 border border-zinc-200 rounded-xl p-5 bg-white hover:border-zinc-400 hover:shadow-sm transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={15} className="text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-black leading-tight">{note.title}</p>
            {note.course && (
              <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                {note.course}
              </span>
            )}
          </div>
        </div>
        {note.user_id === user?.id && (
          <button
            onClick={() => deleteNote(note.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
        {note.uploader_name && (
          <span className="flex items-center gap-1">
            <User size={10} /> {note.uploader_name}
          </span>
        )}
        <span>{new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* View button */}
      <button
        onClick={() => window.open(note.pdf_url || `/dashboard/notes/${note.id}`, '_blank')}
        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold border border-zinc-200 rounded-lg text-zinc-600 hover:bg-black hover:text-white hover:border-black transition-all"
      >
        <ExternalLink size={11} /> View PDF
      </button>
    </div>
  )

  const filteredCommunityNotes = communityNotes

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black">Notes</h1>
            <p className="text-sm text-zinc-400 mt-1">Upload, organise, and discover class notes shared by others.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
              showForm ? 'bg-zinc-100 text-zinc-600' : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Upload Note'}
          </button>
        </div>

        {/* â”€â”€ Upload form (inline slide-in) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {showForm && (
          <div className="mb-8 border border-zinc-200 rounded-2xl p-6 bg-zinc-50">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-5">New Note</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Course Name</label>
                  <Select value={title} onValueChange={setTitle} required>
                    <SelectTrigger className="bg-white border-zinc-200 text-sm">
                      <SelectValue placeholder="Select courseâ€¦" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_NAMES.filter((n) => n !== 'All').map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Course Code</label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger className="bg-white border-zinc-200 text-sm">
                      <SelectValue placeholder="Select codeâ€¦" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_CODES.map((code) => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">PDF File</label>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-zinc-200 rounded-xl px-4 py-4 bg-white hover:border-zinc-400 transition-colors">
                  <Upload size={16} className="text-zinc-400 shrink-0" />
                  <span className="text-sm text-zinc-500 truncate">
                    {file ? file.name : 'Click to select a PDFâ€¦'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploadingâ€¦</> : <><Upload size={13} /> Upload</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-bold border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Course Code</label>
            <Select value={filterCode} onValueChange={setFilterCode}>
              <SelectTrigger className="w-40 h-9 text-xs font-semibold bg-white border-zinc-200">
                <SelectValue placeholder="All Codes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Codes</SelectItem>
                {COURSE_CODES.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Course Name</label>
            <Select value={filterName} onValueChange={setFilterName}>
              <SelectTrigger className="w-52 h-9 text-xs font-semibold bg-white border-zinc-200">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filterCode !== 'all' || filterName !== 'All') && (
            <button
              onClick={() => { setFilterCode('all'); setFilterName('All') }}
              className="h-9 mt-auto px-3 text-xs font-bold border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-black transition-all"
            >
              Reset
            </button>
          )}
        </div>

        {/* â”€â”€ Tab switcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex gap-0 border-b border-zinc-200 mb-8">
          {[
            { id: 'my-notes', label: 'My Notes', icon: User },
            { id: 'community', label: 'Community Notes', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === id
                  ? 'border-black text-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* â”€â”€ My Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'my-notes' && (
          <>
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => renderNoteCard(note))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 rounded-2xl">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                  <Upload size={20} className="text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-500">
                  {notes.length === 0 ? 'No notes yet' : 'No notes match filters'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {notes.length === 0 ? 'Upload your first note to get started.' : 'Try adjusting the filters above.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* â”€â”€ Community Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'community' && (
          <>
            {communityLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={16} className="animate-spin text-zinc-400" />
              </div>
            ) : filteredCommunityNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunityNotes.map((note) => renderNoteCard(note))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 rounded-2xl">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                  <Users size={20} className="text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-500">
                  {communityNotes.length === 0 ? 'No community notes yet' : 'No notes match filters'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {communityNotes.length === 0 ? 'Be the first to share notes with the community.' : 'Try adjusting the filters above.'}
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
