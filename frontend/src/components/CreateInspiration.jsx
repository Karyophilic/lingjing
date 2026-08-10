import { useState, useRef, useCallback } from 'react'
import { X, Send, Mic, MicOff, Image as ImageIcon, Trash2 } from 'lucide-react'
import { localInspirations } from '../api/local'

export default function CreateInspiration({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('text')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 图片
  const [imageData, setImageData] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // 语音
  const [isRecording, setIsRecording] = useState(false)
  const [voiceData, setVoiceData] = useState(null)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // --- 图片处理 ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageData(reader.result)
      setImagePreview(reader.result)
      setContentType('image')
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageData(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (contentType === 'image') setContentType('text')
  }

  // --- 语音录制 ---
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          setVoiceData(reader.result)
          setVoiceDuration(recordingTime)
        }
        reader.readAsDataURL(blob)
        // 停止所有音轨
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setVoiceData(null)
      setRecordingTime(0)

      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 120) {
            stopRecording()
            return t
          }
          return t + 1
        })
      }, 1000)
    } catch (err) {
      alert('无法访问麦克风: ' + err.message)
    }
  }, [recordingTime])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setContentType('voice')
  }, [])

  const removeVoice = () => {
    setVoiceData(null)
    setVoiceDuration(0)
    setRecordingTime(0)
    if (contentType === 'voice') setContentType('text')
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // --- 提交 ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    // 模拟 AI 分析延迟
    await new Promise(r => setTimeout(r, 800))
    try {
      const res = localInspirations.create({
        title: title.trim(),
        content: content.trim(),
        content_type: contentType,
        is_public: isPublic,
        image_data: imageData,
        voice_data: voiceData,
        voice_duration: voiceDuration,
      })
      onCreated?.(res.data)
      onClose?.()
    } catch (err) {
      alert('创建失败: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">💡 记录灵感</h2>
          <button onClick={onClose} className="p-2 hover:bg-beige-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="给你的灵感起个名字..."
            className="input mb-3 text-lg font-medium"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            maxLength={200}
          />

          {/* 图片预览 */}
          {imagePreview && (
            <div className="relative mb-3 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="预览" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* 语音预览 */}
          {voiceData && (
            <div className="mb-3 p-3 bg-primary-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <span className="text-sm font-medium text-primary-700">
                  语音记录 ({formatTime(voiceDuration)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <audio src={voiceData} controls className="h-8 w-32" />
                <button
                  type="button"
                  onClick={removeVoice}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          )}

          {/* 文字输入（非语音模式下显示） */}
          {contentType !== 'voice' && (
            <textarea
              placeholder="展开说说你的想法..."
              className="input mb-3 min-h-[100px] resize-none"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          )}

          {/* 内容类型切换 */}
          <div className="flex items-center gap-2 mb-4">
            {[
              { type: 'text', label: '文字', icon: '📝' },
              { type: 'voice', label: '语音', icon: '🎙️' },
              { type: 'image', label: '图片', icon: '🖼️' },
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (type === 'image') {
                    fileInputRef.current?.click()
                    return
                  }
                  if (type === 'voice') {
                    if (isRecording) {
                      stopRecording()
                    } else {
                      startRecording()
                    }
                    return
                  }
                  setContentType(type)
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === 'voice' && isRecording
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : contentType === type && !isRecording
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}
              >
                {type === 'voice' && isRecording ? (
                  <><MicOff size={14} /> 录制中 {formatTime(recordingTime)}</>
                ) : (
                  <>{icon} {label}</>
                )}
              </button>
            ))}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* 公开/私密 — 更显眼的开关 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">{isPublic ? '🌍' : '🔒'}</span>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {isPublic ? '公开到灵感广场' : '仅自己可见'}
                </span>
                <p className="text-[11px] text-gray-400">
                  {isPublic ? '所有人能在广场看到这条灵感' : '这条灵感不会出现在广场'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
                isPublic ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isPublic ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>

            <button
              type="submit"
              disabled={!title.trim() || submitting || isRecording}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? 'AI 分析中...' : '记录灵感'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
