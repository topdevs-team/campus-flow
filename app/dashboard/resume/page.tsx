'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileCheck, Download, Loader2, Plus, X } from 'lucide-react'
import jsPDF from 'jspdf'

interface Resume {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  summary: string
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    graduationDate: string
  }>
  skills: string[]
}

export default function ResumePage() {
  const { user } = useAuth()
  const [resume, setResume] = useState<Partial<Resume>>({
    experience: [],
    education: [],
    skills: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadResume()
    }
  }, [user])

  const loadResume = async () => {
    try {
      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setResume(data)
      } else {
        setResume({
          full_name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          experience: [],
          education: [],
          skills: [],
        })
      }
    } catch (error) {
      setResume({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        experience: [],
        education: [],
        skills: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const saveResume = async () => {
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (existing) {
        await supabase.from('resumes').update(resume).eq('user_id', user?.id)
      } else {
        await supabase
          .from('resumes')
          .insert({
            ...resume,
            user_id: user?.id,
          })
      }
    } catch (error) {
      console.error('Error saving resume:', error)
    } finally {
      setSaving(false)
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.text(resume.full_name || 'Your Name', 20, yPosition)
    yPosition += 10

    // Contact info
    doc.setFontSize(10)
    const contact = [resume.email, resume.phone, resume.location]
      .filter(Boolean)
      .join(' | ')
    doc.text(contact, 20, yPosition)
    yPosition += 10

    // Summary
    if (resume.summary) {
      doc.setFontSize(12)
      doc.text('SUMMARY', 20, yPosition)
      yPosition += 7
      doc.setFontSize(10)
      const splitSummary = doc.splitTextToSize(resume.summary, 170)
      doc.text(splitSummary, 20, yPosition)
      yPosition += splitSummary.length * 5 + 5
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      doc.setFontSize(12)
      doc.text('EXPERIENCE', 20, yPosition)
      yPosition += 7

      resume.experience.forEach((exp) => {
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(`${exp.position} at ${exp.company}`, 20, yPosition)
        yPosition += 5
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        doc.text(`${exp.startDate} - ${exp.endDate}`, 20, yPosition)
        yPosition += 4
        const splitDesc = doc.splitTextToSize(exp.description, 170)
        doc.text(splitDesc, 20, yPosition)
        yPosition += splitDesc.length * 4 + 3
      })
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      doc.setFontSize(12)
      doc.text('EDUCATION', 20, yPosition)
      yPosition += 7

      resume.education.forEach((edu) => {
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(`${edu.degree} in ${edu.field}`, 20, yPosition)
        yPosition += 5
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        doc.text(`${edu.school} - ${edu.graduationDate}`, 20, yPosition)
        yPosition += 5
      })
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      doc.setFontSize(12)
      doc.text('SKILLS', 20, yPosition)
      yPosition += 7
      doc.setFontSize(10)
      doc.text(resume.skills.join(', '), 20, yPosition)
    }

    doc.save('resume.pdf')
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Maker</h1>
        <p className="text-slate-600">Build and download your professional resume</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Editor */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  value={resume.full_name || ''}
                  onChange={(e) => setResume({ ...resume, full_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={resume.email || ''}
                    onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={resume.phone || ''}
                    onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  type="text"
                  value={resume.location || ''}
                  onChange={(e) => setResume({ ...resume, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Professional Summary</label>
                <textarea
                  value={resume.summary || ''}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {resume.skills?.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => {
                        setResume({
                          ...resume,
                          skills: resume.skills?.filter((_, i) => i !== idx),
                        })
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="skillInput"
                  placeholder="Add a skill..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim()
                      if (value) {
                        setResume({
                          ...resume,
                          skills: [...(resume.skills || []), value],
                        })
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.experience?.map((exp, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Position"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...(resume.experience || [])]
                            updated[idx].position = e.target.value
                            setResume({ ...resume, experience: updated })
                          }}
                        />
                        <Input
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...(resume.experience || [])]
                            updated[idx].company = e.target.value
                            setResume({ ...resume, experience: updated })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Start Date"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...(resume.experience || [])]
                            updated[idx].startDate = e.target.value
                            setResume({ ...resume, experience: updated })
                          }}
                        />
                        <Input
                          placeholder="End Date"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...(resume.experience || [])]
                            updated[idx].endDate = e.target.value
                            setResume({ ...resume, experience: updated })
                          }}
                        />
                      </div>
                      <textarea
                        placeholder="Description"
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...(resume.experience || [])]
                          updated[idx].description = e.target.value
                          setResume({ ...resume, experience: updated })
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setResume({
                          ...resume,
                          experience: resume.experience?.filter((_, i) => i !== idx),
                        })
                      }}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setResume({
                    ...resume,
                    experience: [
                      ...(resume.experience || []),
                      {
                        company: '',
                        position: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                      },
                    ],
                  })
                }}
                className="w-full"
              >
                <Plus size={18} className="mr-2" />
                Add Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.education?.map((edu, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="School/University"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...(resume.education || [])]
                          updated[idx].school = e.target.value
                          setResume({ ...resume, education: updated })
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...(resume.education || [])]
                            updated[idx].degree = e.target.value
                            setResume({ ...resume, education: updated })
                          }}
                        />
                        <Input
                          placeholder="Field of Study"
                          value={edu.field}
                          onChange={(e) => {
                            const updated = [...(resume.education || [])]
                            updated[idx].field = e.target.value
                            setResume({ ...resume, education: updated })
                          }}
                        />
                      </div>
                      <Input
                        placeholder="Graduation Date"
                        value={edu.graduationDate}
                        onChange={(e) => {
                          const updated = [...(resume.education || [])]
                          updated[idx].graduationDate = e.target.value
                          setResume({ ...resume, education: updated })
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setResume({
                          ...resume,
                          education: resume.education?.filter((_, i) => i !== idx),
                        })
                      }}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setResume({
                    ...resume,
                    education: [
                      ...(resume.education || []),
                      {
                        school: '',
                        degree: '',
                        field: '',
                        graduationDate: '',
                      },
                    ],
                  })
                }}
                className="w-full"
              >
                <Plus size={18} className="mr-2" />
                Add Education
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview/Actions Sidebar */}
        <div className="col-span-1">
          <div className="sticky top-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={saveResume} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Resume'}
                </Button>
                <Button onClick={downloadPDF} variant="secondary" className="w-full gap-2">
                  <Download size={18} />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck size={20} />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-semibold">{resume.full_name || 'Your Name'}</p>
                    <p className="text-slate-500">{resume.email}</p>
                  </div>
                  {resume.summary && (
                    <div>
                      <p className="font-semibold text-xs text-slate-600">SUMMARY</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{resume.summary}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-xs text-slate-600">SECTIONS</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>Experience: {resume.experience?.length || 0}</li>
                      <li>Education: {resume.education?.length || 0}</li>
                      <li>Skills: {resume.skills?.length || 0}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
