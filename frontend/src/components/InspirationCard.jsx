import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Pin, PinOff, Image as ImageIcon, Mic, Bot, Archive, ArchiveRestore } from 'lucide-react'
import { localInspirations } from '../api/local'

export default function InspirationCard({ inspiration, onLike, showUser = true, onUpdate, showArchive = false }) {
  const {
    id, title, content, tags, ai_summary, content_type,
    image_data, voice_data, voice_duration,
    created_at, username, like_count, comment_count, is_pinned,
    is_ai_generated, is_archived,
  } = inspiration

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  const handlePin = (e) => {
    e.preventDefault()
    e.stopPropagation()
    localInspirations.togglePin(id)
    onUpdate?.()
  }

  const handleArchive = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const res = localInspirations.toggleArchive(id)
    onUpdate?.()
  }

  return (
    <Link to={`/inspiration/${id}`} className="card block group relative">
      {/* AI 生成标识 */}
      {is_ai_generated && (
        <div className="flex items-center gap-1 text-xs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full w-fit mb-2">
          <Bot size={12} /> AI生成
        </div>
      )}

      {/* 置顶标识 */}
      {is_pinned && (
        <div className="flex items-center gap-1 text-spark-500 text-xs mb-2">
          <Pin size={12} /> 已置顶
        </div>
      )}

      {/* 操作按钮组 */}
      <div className="absolute top-4 right-4 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
        {showArchive && (
          <button
            onClick={handleArchive}
            className={`p-1.5 rounded-lg transition-all ${
              is_archived
                ? 'bg-primary-50 text-primary-500 opacity-100'
                : 'hover:bg-beige-100 text-gray-300 hover:text-gray-500'
            }`}
            title={is_archived ? '取消存档' : '存档'}
          >
            {is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
        )}
        <button
          onClick={handlePin}
          className={`p-1.5 rounded-lg transition-all ${
            is_pinned
              ? 'bg-spark-50 text-spark-500'
              : 'hover:bg-beige-100 text-gray-300 hover:text-gray-500'
          } ${is_pinned ? 'opacity-100' : ''}`}
          title={is_pinned ? '取消置顶' : '置顶'}
        >
          {is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
      </div>

      {/* 已置顶时的可见按钮 */}
      {is_pinned && (
        <div className="absolute top-4 right-4 flex gap-0.5">
          {showArchive && (
            <button
              onClick={handleArchive}
              className={`p-1.5 rounded-lg transition-all ${
                is_archived
                  ? 'bg-primary-50 text-primary-500'
                  : 'hover:bg-beige-100 text-gray-300 hover:text-gray-500'
              }`}
              title={is_archived ? '取消存档' : '存档'}
            >
              {is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>
          )}
        </div>
      )}

      {/* 内容类型标识 */}
      <div className="flex items-center gap-2 mb-2">
        {content_type === 'image' && (
          <span className="flex items-center gap-1 text-xs text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
            <ImageIcon size={12} /> 图片
          </span>
        )}
        {content_type === 'voice' && (
          <span className="flex items-center gap-1 text-xs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
            <Mic size={12} /> 语音 {voice_duration > 0 && `${Math.floor(voice_duration / 60)}'${(voice_duration % 60).toString().padStart(2, '0')}"`}
          </span>
        )}
      </div>

      {/* 图片缩略图 */}
      {image_data && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={image_data} alt={title} className="w-full h-32 object-cover" loading="lazy" />
        </div>
      )}

      {/* 标题 */}
      <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">{title}</h3>

      {/* AI 摘要 */}
      {ai_summary && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">🤖 {ai_summary}</p>
      )}

      {/* 内容预览 */}
      {content && !image_data && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content}</p>
      )}

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {showUser && username && (
            <span className="flex items-center gap-1">
              {is_ai_generated && <Bot size={12} className="text-primary-400" />}
              @{username}
            </span>
          )}
          <span>{timeAgo(created_at)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart size={14} /> {like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} /> {comment_count || 0}
          </span>
        </div>
      </div>
    </Link>
  )
}
