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

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  const today = new Date()
  if (d.toDateString() === today.toDateString())
    return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function impStyle(imp) {
  if (imp === 'High') return { background: '#1f0d0d', color: '#F09595' }
  if (imp === 'Medium') return { background: '#201a08', color: '#EF9F27' }
  return { background: '#0d1a0d', color: '#97C459' }
}

const SRC_COLORS = {
  'Financial Times':      { background: '#1a1930', color: '#AFA9EC' },
  'Utility Dive':         { background: '#0d1d30', color: '#85B7EB' },
  'Latitude Media':       { background: '#0a1f18', color: '#5DCAA5' },
  'EIA':                  { background: '#201a08', color: '#EF9F27' },
  'Economist':            { background: '#1f0d10', color: '#F09595' },
  'Electrek':             { background: '#0a1f18', color: '#5DCAA5' },
  'Carbon Brief':         { background: '#0d1d30', color: '#85B7EB' },
  'OilPrice':             { background: '#201a08', color: '#EF9F27' },
  'PV Magazine':          { background: '#1a1930', color: '#AFA9EC' },
  'Power Magazine':       { background: '#1f0d0d', color: '#F09595' },
  'Canary Media':         { background: '#0a1f18', color: '#5DCAA5' },
  'Norton Rose Currents': { background: '#201a08', color: '#EF9F27' },
  'RTO Insider':          { background: '#0d1d30', color: '#85B7EB' },
}
function srcStyle(src) { return SRC_COLORS[src] || { background: '#1a1a1a', color: '#666' } }

const S = {
  app: { background: '#0a0a0a', minHeight: '100vh' },
  topbar: { background: '#0f0f0f', borderBottom: '0.5px solid #1e1e1e', padding: '11px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: 15, fontWeight: 500, color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' },
  layout: { display: 'flex', maxWidth: 1200, margin: '0 auto' },
  sidebar: { width: 195, padding: '14px 10px', borderRight: '0.5px solid #1e1e1e', flexShrink: 0, position: 'sticky', top: 45, height: 'calc(100vh - 45px)', overflowY: 'auto' },
  statsRow: { display: 'flex', gap: 5, marginBottom: 14 },
  stat: { flex: 1, background: '#111', border: '0.5px solid #1e1e1e', borderRadius: 7, padding: '6px 4px', textAlign: 'center' },
  statN: { fontSize: 17, fontWeight: 500, color: '#e0e0e0' },
  statL: { fontSize: 9, color: '#444', marginTop: 1 },
  secLabel: { fontSize: 9, fontWeight: 500, color: '#444', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 },
  chip: { fontSize: 11, color: '#666', padding: '4px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1, cursor: 'pointer', gap: 4, userSelect: 'none' },
  chipActive: { background: '#1a1a1a', color: '#ccc' },
  chipCount: { fontSize: 10, color: '#444', flexShrink: 0 },
  feed: { flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9 },
  search: { background: '#111', border: '0.5px solid #222', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ccc', width: '100%', outline: 'none', marginBottom: 2 },
  empty: { color: '#333', fontSize: 13, textAlign: 'center', padding: '60px 0' },
  card: { background: '#111', border: '0.5px solid #1e1e1e', borderRadius: 10, padding: '12px 14px', cursor: 'pointer' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, flexWrap: 'wrap' },
  date: { fontSize: 10, color: '#444', marginLeft: 'auto' },
  title: { fontSize: 13, fontWeight: 500, color: '#d0d0d0', lineHeight: 1.4, marginBottom: 5 },
  summary: { fontSize: 11, color: '#555', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  tags: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 },
  tag: { fontSize: 9, padding: '2px 7px', borderRadius: 20, background: '#161616', color: '#555', border: '0.5px solid #1e1e1e' },
  badge: { fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, whiteSpace: 'nowrap' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', padding: '22px 26px' },
  mHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  mSrc: { fontSize: 11, color: '#555', marginBottom: 5 },
  mTitle: { fontSize: 16, fontWeight: 500, color: '#e0e0e0', lineHeight: 1.4, marginBottom: 10 },
  mBadges: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  closeBtn: { background: '#1a1a1a', border: '0.5px solid #222', borderRadius: 6, color: '#555', fontSize: 12, cursor: 'pointer', padding: '4px 10px', flexShrink: 0, lineHeight: 1.4 },
  mSec: { borderTop: '0.5px solid #1e1e1e', paddingTop: 13, marginBottom: 14 },
  mSecLabel: { fontSize: 9, fontWeight: 500, color: '#444', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  mText: { fontSize: 12, color: '#888', lineHeight: 1.65 },
  insightRow: { display: 'flex', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: '0.5px solid #1a1a1a' },
  insightBullet: { color: '#1D9E75', fontWeight: 500, flexShrink: 0, fontSize: 13 },
  readLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5DCAA5', textDecoration: 'none', marginTop: 10 },
}

function FilterChip({ label, active, count, onClick }) {
  return (
    <div style={{ ...S.chip, ...(active ? S.chipActive : {}) }} onClick={onClick}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{label}</span>
      {count !== undefined && <span style={S.chipCount}>{count}</span>}
    </div>
  )
}

function Modal({ record, onClose }) {
  const f = record.fields
  const rawInsights = f['Key Insights / Arguments'] || f['Key Insights'] || ''
  const insights = typeof rawInsights === 'string' ? rawInsights.split('\n\n').filter(Boolean) : []
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.mHead}>
          <div>
            <div style={S.mSrc}>{f['Source']} · {formatDate(f['Published Date'])}</div>
            <div style={S.mTitle}>{f['Title']}</div>
            <div style={S.mBadges}>
              <span style={{ ...S.badge, ...impStyle(f['Importance']) }}>{f['Importance']}</span>
              {(f['Topics'] || []).slice(0, 6).map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        {f['AI Summary'] && (
          <div style={S.mSec}>
            <div style={S.mSecLabel}>Summary</div>
            <div style={S.mText}>{f['AI Summary']}</div>
          </div>
        )}
        {f['Why It Matters'] && (
          <div style={S.mSec}>
            <div style={S.mSecLabel}>Why it matters</div>
            <div style={S.mText}>{f['Why It Matters']}</div>
          </div>
        )}
        {insights.length > 0 && (
          <div style={S.mSec}>
            <div style={S.mSecLabel}>Key insights</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ ...S.insightRow, ...(i === insights.length - 1 ? { borderBottom: 'none', marginBottom: 0 } : {}) }}>
                <span style={S.insightBullet}>→</span>
                <span style={S.mText}>{ins}</span>
              </div>
            ))}
          </div>
        )}
        {(f['Source URL'] || f['Original Link']) && (
          <a href={f['Source URL'] || f['Original Link']} target="_blank" rel="noopener noreferrer" style={S.readLink}>
            Read original article ↗
          </a>
        )}
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

  useEffect(() => {
    fetchAll()
      .then(r => { setRecords(r); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sources = ['All', ...new Set(records.map(r => r.fields['Source']).filter(Boolean))]
  const allTopics = ['All', ...new Set(records.flatMap(r => r.fields['Topics'] || []))]

  const filtered = records.filter(r => {
    const f = r.fields
    return (
      (filterImp === 'All' || f['Importance'] === filterImp) &&
      (filterSrc === 'All' || f['Source'] === filterSrc) &&
      (filterTopic === 'All' || (f['Topics'] || []).includes(filterTopic)) &&
      (!search || (f['Title'] || '').toLowerCase().includes(search.toLowerCase()) ||
        (f['AI Summary'] || '').toLowerCase().includes(search.toLowerCase()))
    )
  })

  const highCount = records.filter(r => r.fields['Importance'] === 'High').length
  const today = new Date().toDateString()
  const todayCount = records.filter(r =>
    r.fields['Published Date'] && new Date(r.fields['Published Date']).toDateString() === today
  ).length

  return (
    <div style={S.app}>
      <div style={S.topbar}>
        <div style={S.logo}><span style={S.dot} />GridIntel</div>
        <div style={{ fontSize: 11, color: '#444' }}>{records.length} articles · {sources.length - 1} sources</div>
      </div>
      <div style={S.layout}>
        <div style={S.sidebar}>
          <div style={S.statsRow}>
            <div style={S.stat}><div style={S.statN}>{records.length}</div><div style={S.statL}>Total</div></div>
            <div style={S.stat}><div style={S.statN}>{highCount}</div><div style={S.statL}>High</div></div>
            <div style={S.stat}><div style={S.statN}>{todayCount}</div><div style={S.statL}>Today</div></div>
          </div>
          <div style={S.secLabel}>Importance</div>
          {['All', 'High', 'Medium', 'Low'].map(imp => (
            <FilterChip key={imp} label={imp} active={filterImp === imp}
              count={imp === 'All' ? records.length : records.filter(r => r.fields['Importance'] === imp).length}
              onClick={() => setFilterImp(imp)} />
          ))}
          <div style={{ ...S.secLabel, marginTop: 14 }}>Source</div>
          {sources.map(src => (
            <FilterChip key={src} label={src} active={filterSrc === src}
              count={src === 'All' ? records.length : records.filter(r => r.fields['Source'] === src).length}
              onClick={() => setFilterSrc(src)} />
          ))}
          <div style={{ ...S.secLabel, marginTop: 14 }}>Topic</div>
          {allTopics.slice(0, 20).map(t => (
            <FilterChip key={t} label={t} active={filterTopic === t}
              onClick={() => setFilterTopic(t)} />
          ))}
        </div>
        <div style={S.feed}>
          <input style={S.search} placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
          {loading ? (
            <div style={S.empty}>Loading articles…</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>No articles match your filters.</div>
          ) : filtered.map(r => {
            const f = r.fields
            return (
              <div key={r.id} style={S.card} onClick={() => setSelected(r)}>
                <div style={S.cardMeta}>
                  <span style={{ ...S.badge, ...srcStyle(f['Source']) }}>{f['Source'] || 'Unknown'}</span>
                  <span style={{ ...S.badge, ...impStyle(f['Importance']) }}>{f['Importance'] || '—'}</span>
                  <span style={S.date}>{formatDate(f['Published Date'])}</span>
                </div>
                <div style={S.title}>{f['Title'] || 'Untitled'}</div>
                <div style={S.summary}>{f['AI Summary'] || ''}</div>
                {(f['Topics'] || []).length > 0 && (
                  <div style={S.tags}>
                    {(f['Topics'] || []).slice(0, 5).map(t => <span key={t} style={S.tag}>{t}</span>)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {selected && <Modal record={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
