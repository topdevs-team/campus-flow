'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { FileText, Upload, Trash2, Loader2, Plus, Users, User } from 'lucide-react'

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
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const renderNoteCard = (note: Note) => (
    <Card key={note.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{note.title}</CardTitle>
            <CardDescription>{note.course}</CardDescription>
          </div>
          <FileText className="text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        {note.uploader_name && (
          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <User size={11} /> Shared by: {note.uploader_name}
          </p>
        )}
        <p className="text-xs text-slate-500 mb-4">
          {new Date(note.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          {note.pdf_url ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(note.pdf_url, '_blank')}
            >
              View PDF
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`/dashboard/notes/${note.id}`, '_blank')}
            >
              View
            </Button>
          )}
          {note.user_id === user?.id && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteNote(note.id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const filteredCommunityNotes = communityNotes

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Notes</h1>
        <p className="text-slate-600">Upload, organize, and discover class notes shared by others</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={18} />
          Upload Note
        </Button>

        {/* Filter by Course Code */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Filter by Course code</span>
          <Select value={filterCode} onValueChange={setFilterCode}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Codes</SelectItem>
              {COURSE_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter by Course Name */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Filter by course name</span>
          <Select value={filterName} onValueChange={setFilterName}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select course name..." />
            </SelectTrigger>
            <SelectContent>
              {COURSE_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset filters */}
        {(filterCode !== 'all' || filterName !== 'All') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setFilterCode('all'); setFilterName('All') }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="my-notes" className="gap-2">
            <User size={15} /> My Notes
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Users size={15} /> Community Notes
          </TabsTrigger>
        </TabsList>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload a Note</CardTitle>
            <CardDescription>Add a new PDF note to your collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Name</label>
                <Select value={title} onValueChange={setTitle} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course name..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_NAMES.filter((n) => n !== 'All').map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Code</label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CODES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

        {/* My Notes Tab */}
        <TabsContent value="my-notes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => renderNoteCard(note))}
          </div>
          {filteredNotes.length === 0 && (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">
                  {notes.length === 0
                    ? 'No notes yet. Upload your first note to get started!'
                    : 'No notes match the selected filters.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Community Notes Tab */}
        <TabsContent value="community">
          {communityLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunityNotes.map((note) => renderNoteCard(note))}
              </div>
              {filteredCommunityNotes.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <Users size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">
                      {communityNotes.length === 0
                        ? 'No notes shared by other students yet.'
                        : 'No community notes match the selected filters.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
