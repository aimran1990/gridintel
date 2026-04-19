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

const S = {
  app: { background: '#0a0a0a', minHeight: '100vh' },
  topbar: { background: '#0f0f0f', borderBottom: '0.5px solid #2a2a2a', padding: '11px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: 15, fontWeight: 500, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' },
  topMeta: { fontSize: 11, color: '#888' },
  layout: { display: 'flex', maxWidth: 1200, margin: '0 auto' },
  sidebar: { width: 200, padding: '14px 10px', borderRight: '0.5px solid #2a2a2a', flexShrink: 0, position: 'sticky', top: 45, height: 'calc(100vh - 45px)', overflowY: 'auto' },
  statsRow: { display: 'flex', gap: 5, marginBottom: 16 },
  stat: { flex: 1, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 7, padding: '6px 4px', textAlign: 'center' },
  statN: { fontSize: 17, fontWeight: 500, color: '#ffffff' },
  statL: { fontSize: 9, color: '#666', marginTop: 1 },
  secLabel: { fontSize: 9, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 },
  chip: { fontSize: 11, color: '#aaa', padding: '4px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1, cursor: 'pointer', gap: 4, userSelect: 'none' },
  chipActive: { background: '#1e1e1e', color: '#fff' },
  chipCount: { fontSize: 10, color: '#666', flexShrink: 0 },
  feed: { flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9 },
  search: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', width: '100%', outline: 'none', marginBottom: 2 },
  empty: { color: '#555', fontSize: 13, textAlign: 'center', padding: '60px 0' },
  card: { background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', position: 'relative' },
  cardHover: { borderColor: '#3a3a3a' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, flexWrap: 'wrap' },
  date: { fontSize: 10, color: '#666', marginLeft: 'auto' },
  title: { fontSize: 13, fontWeight: 500, color: '#f0f0f0', lineHeight: 1.4, marginBottom: 5 },
  summary: { fontSize: 11, color: '#aaa', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  tags: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 },
  tag: { fontSize: 9, padding: '2px 7px', borderRadius: 20, background: '#1e1e1e', color: '#999', border: '0.5px solid #2a2a2a' },
  badge: { fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, whiteSpace: 'nowrap' },
  saveBtn: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: 2 },
  saveBtnActive: { opacity: 1 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 14, width: '100%', maxWidth: 660, maxHeight: '88vh', overflowY: 'auto', padding: '22px 26px' },
  mHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  mSrc: { fontSize: 11, color: '#888', marginBottom: 5 },
  mTitle: { fontSize: 16, fontWeight: 500, color: '#f0f0f0', lineHeight: 1.4, marginBottom: 10 },
  mBadges: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  closeBtn: { background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, cursor: 'pointer', padding: '4px 10px', flexShrink: 0, lineHeight: 1.4 },
  mSec: { borderTop: '0.5px solid #222', paddingTop: 13, marginBottom: 14 },
  mSecLabel: { fontSize: 9, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  mText: { fontSize: 12, color: '#bbb', lineHeight: 1.7 },
  insightRow: { display: 'flex', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: '0.5px solid #1e1e1e' },
  insightBullet: { color: '#1D9E75', fontWeight: 500, flexShrink: 0, fontSize: 13 },
  mFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '0.5px solid #222', paddingTop: 12, marginTop: 4 },
  readLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5DCAA5', textDecoration: 'none' },
  mSaveBtn: { background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 11, cursor: 'pointer', padding: '5px 12px' },
  mSaveBtnActive: { background: '#1a2a1a', border: '0.5px solid #1D9E75', color: '#1D9E75' },
  tabRow: { display: 'flex', gap: 2, marginBottom: 10 },
  tab: { fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', color: '#888', border: '0.5px solid transparent' },
  tabActive: { background: '#1e1e1e', color: '#fff', border: '0.5px solid #2a2a2a' },
}

function FilterChip({ label, active, count, onClick }) {
  return (
    <div style={{ ...S.chip, ...(active ? S.chipActive : {}) }} onClick={onClick}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{label}</span>
      {count !== undefined && <span style={S.chipCount}>{count}</span>}
    </div>
  )
}

function Modal({ record, onClose, onToggleSave }) {
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
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.mHead}>
          <div style={{ flex: 1 }}>
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

        <div style={S.mFooter}>
          {(f['Source URL'] || f['Original Link'])
            ? <a href={f['Source URL'] || f['Original Link']} target="_blank" rel="noopener noreferrer" style={S.readLink}>Read original article ↗</a>
            : <span />}
          <button
            style={{ ...S.mSaveBtn, ...(saved ? S.mSaveBtnActive : {}) }}
            onClick={() => onToggleSave(record.id, saved)}>
            {saved ? '★ Saved' : '☆ Save article'}
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
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetchAll()
      .then(r => { setRecords(r); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleToggleSave = async (id, current) => {
    await toggleSaved(id, current)
    setRecords(prev => prev.map(r =>
      r.id === id ? { ...r, fields: { ...r.fields, Saved: !current } } : r
    ))
    if (selected?.id === id)
      setSelected(prev => ({ ...prev, fields: { ...prev.fields, Saved: !current } }))
  }

  const sources = ['All', ...new Set(records.map(r => r.fields['Source']).filter(Boolean))]
  const allTopics = ['All', ...new Set(records.flatMap(r => r.fields['Topics'] || []))]

  const base = tab === 'saved' ? records.filter(r => r.fields['Saved']) : records

  const filtered = base.filter(r => {
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
  const savedCount = records.filter(r => r.fields['Saved']).length

  return (
    <div style={S.app}>
      <div style={S.topbar}>
        <div style={S.logo}><span style={S.dot} />GridIntel</div>
        <div style={S.topMeta}>{records.length} articles · {sources.length - 1} sources</div>
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

          <div style={S.tabRow}>
            <div style={{ ...S.tab, ...(tab === 'all' ? S.tabActive : {}) }} onClick={() => setTab('all')}>All articles</div>
            <div style={{ ...S.tab, ...(tab === 'saved' ? S.tabActive : {}) }} onClick={() => setTab('saved')}>
              Saved {savedCount > 0 && `(${savedCount})`}
            </div>
          </div>

          {loading ? (
            <div style={S.empty}>Loading articles…</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>{tab === 'saved' ? 'No saved articles yet.' : 'No articles match your filters.'}</div>
          ) : filtered.map(r => {
            const f = r.fields
            const saved = !!f['Saved']
            return (
              <div key={r.id} style={S.card} onClick={() => setSelected(r)}>
                <button
                  style={{ ...S.saveBtn, ...(saved ? S.saveBtnActive : {}) }}
                  onClick={e => { e.stopPropagation(); handleToggleSave(r.id, saved) }}
                  title={saved ? 'Unsave' : 'Save article'}>
                  {saved ? '★' : '☆'}
                </button>
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

      {selected && <Modal record={selected} onClose={() => setSelected(null)} onToggleSave={handleToggleSave} />}
    </div>
  )
}
