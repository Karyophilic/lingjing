import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { localInspirations, localAI } from '../api/local'
import {
  Heart, MessageCircle, Send, Trash2, Lightbulb,
  Edit3, Pin, PinOff, Check, X, Mic, Image as ImageIcon
} from 'lucide-react'

export default function InspirationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspiration, setInspiration] = useState(null)
  const [comments, setComments] = useState([])
  const [related, setRelated] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)

  // 编辑模式
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    try {
      const inspRes = localInspirations.getDetail(id)
      const commentsRes = localInspirations.getComments(id)
      const relatedRes = localAI.getRelated(id)
      setInspiration(inspRes.data)
      setComments(commentsRes.data.items)
      setRelated(relatedRes.data.items)
    } catch (err) {
      console.error('加载失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleLike = () => {
    localInspirations.like(id)
    loadData()
  }

  const handleDelete = () => {
    if (!confirm('确定删除这条灵感吗？')) return
    localInspirations.delete(id)
    navigate('/profile')
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    localInspirations.createComment(id, commentText.trim())
    setCommentText('')
    loadData()
  }

  const handlePin = () => {
    localInspirations.togglePin(id)
    loadData()
  }

  // 进入编辑模式
  const startEditing = () => {
    setEditTitle(inspiration.title)
    setEditContent(inspiration.content || '')
    setEditIsPublic(inspiration.is_public)
    setEditing(true)
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditing(false)
  }

  // 保存编辑
  const saveEdit = async () => {
    if (!editTitle.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    localInspirations.update(id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      is_public: editIsPublic,
    })
    setEditing(false)
    setSaving(false)
    loadData()
  }

  if (loading) {
    return <main className="max-w-lg mx-auto px-4 pt-6 flex justify-center py-12"><div className="animate-spin text-3xl">💡</div></main>
  }

  if (!inspiration) {
    return <main className="max-w-lg mx-auto px-4 pt-6 text-center py-12"><p className="text-gray-500">灵感不存在</p></main>
  }

  const timeStr = new Date(inspiration.created_at).toLocaleString('zh-CN')

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">← 返回</button>
        <div className="flex items-center gap-2">
          {/* 置顶 */}
          <button
            onClick={handlePin}
            className={`p-2 rounded-lg transition-colors ${
              inspiration.is_pinned
                ? 'bg-spark-50 text-spark-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={inspiration.is_pinned ? '取消置顶' : '置顶'}
          >
            {inspiration.is_pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>
          {/* 编辑 */}
          <button
            onClick={startEditing}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 transition-colors"
            title="编辑"
          >
            <Edit3 size={18} />
          </button>
          {/* 删除 */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
            title="删除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 编辑模式 */}
      {editing ? (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">✏️ 编辑灵感</h2>
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="input mb-3 text-lg font-medium"
            maxLength={200}
            autoFocus
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="input mb-3 min-h-[100px] resize-none"
            placeholder="补充内容..."
          />
          <label className="flex items-center gap-2 text-sm text-gray-500 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={editIsPublic}
              onChange={e => setEditIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-300"
            />
            公开到灵感广场
          </label>
          <div className="flex items-center gap-2 justify-end">
            <button onClick={cancelEditing} className="btn-ghost flex items-center gap-1 text-sm">
              <X size={16} /> 取消
            </button>
            <button
              onClick={saveEdit}
              disabled={!editTitle.trim() || saving}
              className="btn-primary flex items-center gap-1 text-sm"
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              保存
            </button>
          </div>
        </div>
      ) : (
        /* 查看模式 */
        <article className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💡</span>
            <h1 className="text-2xl font-bold text-gray-900">{inspiration.title}</h1>
          </div>

          {/* 内容类型标签 */}
          <div className="flex items-center gap-2 mb-3">
            {inspiration.content_type === 'image' && (
              <span className="flex items-center gap-1 text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                <ImageIcon size={12} /> 图片
              </span>
            )}
            {inspiration.content_type === 'voice' && (
              <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                <Mic size={12} /> 语音
              </span>
            )}
          </div>

          {/* AI 摘要 */}
          {inspiration.ai_summary && (
            <div className="bg-primary-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-primary-700">🤖 AI 摘要：{inspiration.ai_summary}</p>
            </div>
          )}

          {/* 图片展示 */}
          {inspiration.image_data && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img src={inspiration.image_data} alt={inspiration.title} className="w-full object-cover max-h-80" />
            </div>
          )}

          {/* 语音展示 */}
          {inspiration.voice_data && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎙️</span>
                <span className="text-sm font-medium text-gray-700">
                  语音记录
                  {inspiration.voice_duration > 0 && ` (${Math.floor(inspiration.voice_duration / 60)}分${(inspiration.voice_duration % 60)}秒)`}
                </span>
              </div>
              <audio src={inspiration.voice_data} controls className="w-full h-10" />
            </div>
          )}

          {/* 文字内容 */}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
            {inspiration.content || '(无额外内容)'}
          </p>

          {/* 标签 */}
          {inspiration.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {inspiration.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span>@{inspiration.username}</span>
              <span>·</span>
              <span>{timeStr}</span>
              {inspiration.updated_at !== inspiration.created_at && (
                <span className="text-xs">(已编辑)</span>
              )}
            </div>
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart size={18} fill={inspiration.like_count > 0 ? '#ef4444' : 'none'} />
              <span>{inspiration.like_count || 0}</span>
            </button>
          </div>
        </article>
      )}

      {/* AI 关联灵感 */}
      {related.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb size={18} className="text-spark-500" /> AI 发现关联灵感
          </h2>
          <div className="space-y-2">
            {related.map(r => (
              <button key={r.inspiration_id} onClick={() => navigate(`/inspiration/${r.inspiration_id}`)}
                className="card block w-full text-left hover:border-primary-200">
                <p className="font-medium text-gray-900">{r.title}</p>
                <p className="text-xs text-primary-500 mt-1">🔗 {r.connection}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 评论 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle size={18} /> 评论 ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">暂无评论，来说两句吧</p>
        ) : (
          <div className="space-y-3 mb-6">
            {comments.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">@{c.username}</span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm text-gray-600">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComment} className="flex gap-2">
          <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="写下你的想法..." className="input flex-1" maxLength={1000} />
          <button type="submit" disabled={!commentText.trim()}
            className="btn-primary flex items-center gap-1 disabled:opacity-40">
            <Send size={18} />
          </button>
        </form>
      </div>
    </main>
  )
}
