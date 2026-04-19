import { useState, useEffect } from 'react'

const TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN
const BASE = 'appku5LeL41UMhCJe'

async function fetchAll() {
  let records = [], offset = null
  do {
    const url = `https://api.airtable.com/v0/${BASE}/Feed%20Items?pageSize=100${offset ? `&offset=${offset}` : ''}&sort[0][field]=Published%20Date&sort[0][direction]=desc`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    const data = await res.json()
    records = [...records, ...(data.records || [])]
    offset = data.offset
  } while (offset)
  return records
}

async function toggleSaved(id, current) {
  await fetch(`https://api.airtable.com/v0/${BASE}/Feed%20Items/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { Saved: !current } })
  })
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  const today = new Date()
  if (d.toDateString() === today.toDateString())
    return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function impStyle(imp) {
  if (imp === 'High') return { background: '#2a0f0f', color: '#ff9a9a' }
  if (imp === 'Medium') return { background: '#2a1f00', color: '#ffc04d' }
  return { background: '#0f2a0f', color: '#7ed87e' }
}

const SRC_COLORS = {
  'Financial Times':      { background: '#1e1a3a', color: '#c4bcf5' },
  'Utility Dive':         { background: '#0d1f35', color: '#90c8ff' },
  'Latitude Media':       { background: '#0a2218', color: '#6ddbb0' },
  'EIA':                  { background: '#2a1f00', color: '#ffc04d' },
  'Economist':            { background: '#2a0f14', color: '#ff9ab0' },
  'Electrek':             { background: '#0a2218', color: '#6ddbb0' },
  'Carbon Brief':         { background: '#0d1f35', color: '#90c8ff' },
  'OilPrice':             { background: '#2a1f00', color: '#ffc04d' },
  'PV Magazine':          { background: '#1e1a3a', color: '#c4bcf5' },
  'Power Magazine':       { background: '#2a0f0f', color: '#ff9a9a' },
  'Canary Media':         { background: '#0a2218', color: '#6ddbb0' },
  'Norton Rose Currents': { background: '#2a1f00', color: '#ffc04d' },
  'RTO Insider':          { background: '#0d1f35', color: '#90c8ff' },
  'Brattle Group':        { background: '#1e1a3a', color: '#c4bcf5' },
}
function srcStyle(src) { return SRC_COLORS[src] || { background: '#1e1e1e', color: '#aaa' } }

const DATE_RANGES = ['Today', '7 days', '14 days', '1 month', 'All time']

function getDateCutoff(range) {
  const now = new Date()
  if (range === 'Today') { const d = new Date(); d.setHours(0,0,0,0); return d }
  if (range === '7 days') return new Date(now - 7*86400000)
  if (range === '14 days') return new Date(now - 14*86400000)
  if (range === '1 month') return new Date(now - 30*86400000)
  return null
}

const isMobile = () => window.innerWidth < 700

function Chip({ label, active, count, onClick }) {
  return (
    <div onClick={onClick} style={{ fontSize: 11, color: active ? '#fff' : '#aaa', padding: '4px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1, cursor: 'pointer', gap: 4, userSelect: 'none', background: active ? '#1e1e1e' : 'none' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: 10, color: '#555', flexShrink: 0 }}>{count}</span>}
    </div>
  )
}

function Section({ label, text }) {
  return (
    <div style={{ borderTop: '0.5px solid #222', paddingTop: 13, marginBottom: 14 }}>
      <div style={sl2}>{label}</div>
      <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

function Modal({ record, onClose, onToggleSave, mobile }) {
  const f = record.fields
  const rawInsights = f['Key Insights / Arguments'] || f['Key Insights'] || ''
  const insights = typeof rawInsights === 'string' ? rawInsights.split('\n\n').filter(Boolean) : []
  const saved = !!f['Saved']

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 100, padding: mobile ? 0 : 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: mobile ? '14px 14px 0 0' : 14, width: '100%', maxWidth: mobile ? '100%' : 660, maxHeight: '88vh', overflowY: 'auto', padding: mobile ? '20px 16px' : '22px 26px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{f['Source']} · {formatDate(f['Published Date'])}</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#f0f0f0', lineHeight: 1.4, marginBottom: 10 }}>{f['Title']}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, ...impStyle(f['Importance']) }}>{f['Importance']}</span>
              {(f['Topics'] || []).slice(0, 5).map(t => (
                <span key={t} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: '#1e1e1e', color: '#999', border: '0.5px solid #2a2a2a' }}>{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, cursor: 'pointer', padding: '4px 10px', flexShrink: 0 }}>✕</button>
        </div>

        {f['AI Summary'] && <Section label="Summary" text={f['AI Summary']} />}
        {f['Why It Matters'] && <Section label="Why it matters" text={f['Why It Matters']} />}

        {insights.length > 0 && (
          <div style={{ borderTop: '0.5px solid #222', paddingTop: 13, marginBottom: 14 }}>
            <div style={sl2}>Key insights</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: i < insights.length - 1 ? '0.5px solid #1e1e1e' : 'none' }}>
                <span style={{ color: '#1D9E75', fontWeight: 500, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 12, color: '#bbb', lineHeight: 1.65 }}>{ins}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '0.5px solid #222', paddingTop: 12 }}>
          {(f['Source URL'] || f['Original Link'])
            ? <a href={f['Source URL'] || f['Original Link']} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#5DCAA5', textDecoration: 'none' }}>Read original ↗</a>
            : <span />}
          <button onClick={() => onToggleSave(record.id, saved)}
            style={{ background: saved ? '#0a2218' : '#1e1e1e', border: `0.5px solid ${saved ? '#1D9E75' : '#2a2a2a'}`, borderRadius: 6, color: saved ? '#6ddbb0' : '#aaa', fontSize: 11, cursor: 'pointer', padding: '5px 12px' }}>
            {saved ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterImp, setFilterImp] = useState('All')
  const [filterSrc, setFilterSrc] = useState('All')
  const [filterTopic, setFilterTopic] = useState('All')
  const [dateRange, setDateRange] = useState('All time')
  const [tab, setTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [mobile, setMobile] = useState(isMobile())

  useEffect(() => {
    fetchAll().then(r => { setRecords(r); setLoading(false) }).catch(() => setLoading(false))
    const handleResize = () => setMobile(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggleSave = async (id, current) => {
    await toggleSaved(id, current)
    setRecords(prev => prev.map(r => r.id === id ? { ...r, fields: { ...r.fields, Saved: !current } } : r))
    if (selected?.id === id) setSelected(prev => ({ ...prev, fields: { ...prev.fields, Saved: !current } }))
  }

  const cutoff = getDateCutoff(dateRange)

  // All records filtered by date only — used for counts
  const dateFiltered = records.filter(r => {
    const pub = r.fields['Published Date'] ? new Date(r.fields['Published Date']) : null
    return !cutoff || (pub && pub >= cutoff)
  })

  // Stats — all update with date filter
  const savedCount = records.filter(r => r.fields['Saved']).length
  const highCount = dateFiltered.filter(r => r.fields['Importance'] === 'High').length
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayCount = dateFiltered.filter(r => r.fields['Published Date'] && new Date(r.fields['Published Date']) >= todayStart).length

  const sources = ['All', ...new Set(records.map(r => r.fields['Source']).filter(Boolean))]
  const allTopics = ['All', ...new Set(records.flatMap(r => r.fields['Topics'] || []))]

  // Full filtered feed
  const base = tab === 'saved' ? records.filter(r => r.fields['Saved']) : records
  const filtered = base.filter(r => {
    const f = r.fields
    const pub = f['Published Date'] ? new Date(f['Published Date']) : null
    return (
      (filterImp === 'All' || f['Importance'] === filterImp) &&
      (filterSrc === 'All' || f['Source'] === filterSrc) &&
      (filterTopic === 'All' || (f['Topics'] || []).includes(filterTopic)) &&
      (!cutoff || (pub && pub >= cutoff)) &&
      (!search || (f['Title'] || '').toLowerCase().includes(search.toLowerCase()) ||
        (f['AI Summary'] || '').toLowerCase().includes(search.toLowerCase()))
    )
  })

  const StatCards = () => (
    <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
      {[['Total', dateFiltered.length], ['High', highCount], ['Today', todayCount]].map(([l, n]) => (
        
