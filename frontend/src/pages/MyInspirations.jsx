import { useState, useEffect } from 'react'
import { localInspirations } from '../api/local'
import InspirationCard from '../components/InspirationCard'
import CreateInspiration from '../components/CreateInspiration'
import { Plus, Search } from 'lucide-react'

export default function MyInspirations() {
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const loadData = () => {
    setLoading(true)
    try {
      const res = localInspirations.getMyList(page)
      setInspirations(res.data.items)
    } catch (err) {
      console.error('加载失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [page])

  const filtered = search
    ? inspirations.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : inspirations

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的灵感</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={18} /> 记录
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索灵感或标签..." className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin text-3xl">💡</div></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">{search ? '没有匹配的灵感' : '还没有灵感，记录第一个吧'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map(insp => <InspirationCard key={insp.id} inspiration={insp} showUser={false} />)}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm disabled:opacity-30">上一页</button>
            <span className="flex items-center px-3 text-sm text-gray-500">第 {page} 页</span>
            <button disabled={inspirations.length < 20} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm disabled:opacity-30">下一页</button>
          </div>
        </>
      )}

      {showCreate && (
        <CreateInspiration onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData() }} />
      )}
    </main>
  )
}
