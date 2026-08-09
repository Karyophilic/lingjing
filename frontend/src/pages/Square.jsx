import { useState, useEffect } from 'react'
import { localInspirations } from '../api/local'
import InspirationCard from '../components/InspirationCard'
import { Search } from 'lucide-react'

const POPULAR_TAGS = ['创意', '科技', '艺术', '生活', '商业', '设计', '写作', '音乐']

export default function Square() {
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const loadSquare = (tag) => {
    setLoading(true)
    try {
      const res = localInspirations.getSquare(tag || undefined)
      setInspirations(res.data.items)
      setSearchResults(null)
    } catch (err) {
      console.error('加载广场失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSquare(activeTag) }, [activeTag])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = localInspirations.search(searchQuery.trim())
      setSearchResults(res.data.items)
    } catch (err) {
      console.error('搜索失败', err)
    } finally {
      setLoading(false)
    }
  }

  const displayItems = searchResults !== null ? searchResults : inspirations

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">灵感广场</h1>

      <form onSubmit={handleSearch} className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索灵感..." className="input pl-10" />
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setActiveTag(''); setSearchQuery(''); setSearchResults(null) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!activeTag && searchResults === null ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          全部
        </button>
        {POPULAR_TAGS.map(tag => (
          <button key={tag} onClick={() => { setActiveTag(tag); setSearchQuery(''); setSearchResults(null) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTag === tag ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tag}
          </button>
        ))}
      </div>

      {searchResults !== null && (
        <p className="text-sm text-gray-500 mb-4">"{searchQuery}" 的搜索结果 ({displayItems.length} 条)</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin text-3xl">💡</div></div>
      ) : displayItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">{searchResults !== null ? '没有找到相关灵感' : '这个标签下还没有公开灵感'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map(insp => <InspirationCard key={insp.id} inspiration={insp} onUpdate={() => loadSquare(activeTag)} />)}
        </div>
      )}
    </main>
  )
}
