'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2, FileText, Presentation, Mic, Video, Download, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PDFOption {
  id: string
  filename: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfs, setPdfs] = useState<PDFOption[]>([])
  const [selectedPdf, setSelectedPdf] = useState<string>('')
  const [loadingPdfs, setLoadingPdfs] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'studio'>('chat')
  const [studioPrompt, setStudioPrompt] = useState('')
  const [studioType, setStudioType] = useState<'slides' | 'voice' | 'video'>('slides')
  const [studioModel, setStudioModel] = useState('openai/gpt-4o-mini')
  const [studioLoading, setStudioLoading] = useState(false)
  const [studioError, setStudioError] = useState('')
  const [generatedMarkdown, setGeneratedMarkdown] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadPdfs()
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPdfs = async () => {
    try {
      const { data } = await supabase
        .from('pdfs')
        .select('id, filename')
        .eq('user_id', user?.id)

      setPdfs(data || [])
      if (data && data.length > 0) {
        setSelectedPdf(data[0].id)
      }
    } catch (error) {
      console.error('Error loading PDFs:', error)
    } finally {
      setLoadingPdfs(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedPdf) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message: input,
          pdfId: selectedPdf,
        }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response || 'I could not process that query. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const generateFromPdf = async () => {
    if (!selectedPdf) return

    setStudioError('')
    setStudioLoading(true)
    setGeneratedMarkdown('')
    setGeneratedScript('')
    if (generatedAudioUrl) {
      URL.revokeObjectURL(generatedAudioUrl)
      setGeneratedAudioUrl('')
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          pdfId: selectedPdf,
          type: studioType,
          prompt: studioPrompt || 'Generate study material from this PDF',
          model: studioModel,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Generation failed')
      }

      if (studioType === 'voice') {
        const b64 = result.audioBase64 as string
        const mime = (result.mimeType as string) || 'audio/mpeg'
        const binary = atob(b64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: mime })
        setGeneratedAudioUrl(URL.createObjectURL(blob))
        setGeneratedScript(result.script || '')
      } else {
        setGeneratedMarkdown(result.markdown || '')
      }
    } catch (error) {
      setStudioError(error instanceof Error ? error.message : 'Failed to generate output')
    } finally {
      setStudioLoading(false)
    }
  }

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loadingPdfs) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">PDF Chat</h1>
        <p className="text-slate-600">Ask questions about your PDF notes</p>
      </div>

      {pdfs.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4">No PDFs uploaded yet</p>
            <p className="text-sm text-slate-500">
              Upload notes from the{' '}
              <a href="/dashboard/notes" className="text-blue-600 hover:underline">
                Notes section
              </a>{' '}
              to start chatting
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium ${activeTab === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium ${activeTab === 'studio' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Create
            </button>
          </div>

          {/* PDF Selector */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium mb-2">Select Document</label>
              <select
                value={selectedPdf}
                onChange={(e) => setSelectedPdf(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                {pdfs.map((pdf) => (
                  <option key={pdf.id} value={pdf.id}>
                    {pdf.filename}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Chat Area */}
              <Card className="flex-1 flex flex-col mb-6 bg-gradient-to-b from-slate-50 to-white">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600">
                          Ask a question about your selected PDF to get started
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.role === 'user'
                                  ? 'text-blue-100'
                                  : 'text-slate-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-200 text-slate-900 rounded-lg px-4 py-2">
                            <Loader2 className="animate-spin w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your PDF..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()} className="gap-2">
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <Card className="border-slate-200">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStudioType('slides')}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${studioType === 'slides' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      <Presentation size={14} />
                      Slides
                    </button>
                    <button
                      onClick={() => setStudioType('voice')}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${studioType === 'voice' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      <Mic size={14} />
                      Voice
                    </button>
                    <button
                      onClick={() => setStudioType('video')}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${studioType === 'video' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      <Video size={14} />
                      Video Plan
                    </button>
                  </div>

                  <Input
                    value={studioPrompt}
                    onChange={(e) => setStudioPrompt(e.target.value)}
                    placeholder="Optional instruction (e.g. make it beginner-friendly, 10 slides, 3-minute narration)"
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Model (provider/model)</label>
                    <input
                      value={studioModel}
                      onChange={(e) => setStudioModel(e.target.value)}
                      placeholder="openai/gpt-4o-mini, anthropic/claude-3-5-sonnet-latest, ollama/qwen2.5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                  </div>

                  <Button onClick={generateFromPdf} disabled={studioLoading} className="gap-2">
                    {studioLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                    Generate from PDF
                  </Button>
                  {studioError ? <p className="text-sm text-red-600">{studioError}</p> : null}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-5">
                  {studioLoading ? (
                    <div className="py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin w-5 h-5 mx-auto mb-2" />
                      Generating {studioType}...
                    </div>
                  ) : null}

                  {!studioLoading && studioType === 'voice' && generatedAudioUrl ? (
                    <div className="space-y-4">
                      <audio controls src={generatedAudioUrl} className="w-full" />
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          const a = document.createElement('a')
                          a.href = generatedAudioUrl
                          a.download = 'podcast.mp3'
                          a.click()
                        }}
                      >
                        <Download size={14} />
                        Download Audio
                      </Button>
                      {generatedScript ? (
                        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs whitespace-pre-wrap max-h-72 overflow-auto">
                          {generatedScript}
                        </pre>
                      ) : null}
                    </div>
                  ) : null}

                  {!studioLoading && studioType !== 'voice' && generatedMarkdown ? (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                          downloadTextFile(
                            generatedMarkdown,
                            studioType === 'slides' ? 'slides.md' : 'video-storyboard.md',
                          )
                        }
                      >
                        <Download size={14} />
                        Download {studioType === 'slides' ? 'Slides' : 'Storyboard'}
                      </Button>
                      <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs whitespace-pre-wrap max-h-[32rem] overflow-auto">
                        {generatedMarkdown}
                      </pre>
                    </div>
                  ) : null}

                  {!studioLoading &&
                  !generatedMarkdown &&
                  !generatedAudioUrl &&
                  !studioError ? (
                    <p className="text-sm text-slate-500">Generate slides, podcast voice, or video storyboard from the selected PDF.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
