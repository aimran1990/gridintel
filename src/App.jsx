import { useState, useEffect, useRef } from 'react'

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

async function fetchEarnings() {
  let records = [], offset = null
  do {
    const url = `https://api.airtable.com/v0/${BASE}/Earnings?pageSize=100${offset ? `&offset=${offset}` : ''}&sort[0][field]=Filing%20Date&sort[0][direction]=desc`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    const data = await res.json()
    records = [...records, ...(data.records || [])]
    offset = data.offset
  } while (offset)
  return records
}

async function fetchEarningsCalendar() {
  let records = [], offset = null
  do {
    const url = `https://api.airtable.com/v0/${BASE}/Earnings%20Calendar?pageSize=100${offset ? `&offset=${offset}` : ''}&sort[0][field]=Earnings%20Date&sort[0][direction]=asc`
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

function formatEarningsDate(str) {
  if (!str) return ''
  // Parse as local date to avoid timezone shift
  const [y, m, d] = str.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^SUMMARY[:\s]*/m, '')
    .replace(/^KEY PERFORMANCE HIGHLIGHTS[:\s]*/m, '')
    .replace(/^OUTLOOK[:\s]*/m, '')
    .replace(/^WHY IT MATTERS[:\s]*/m, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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
  'Axios Energy':         { background: '#1e1a3a', color: '#c4bcf5' },
  'Bloomberg Green':      { background: '#0a2a1a', color: '#4dff9a' },
  'Energy Monitor':       { background: '#0d2a1f', color: '#4dffaa' },
  'PR Newswire M&A':      { background: '#1a0a2a', color: '#d4a8ff' },
}
function srcStyle(src) { return SRC_COLORS[src] || { background: '#1e1e1e', color: '#aaa' } }

const DATE_RANGES = ['Today', '7 days', '14 days', '1 month', 'All time', 'Custom']

function getDateCutoff(range, customFrom, customTo) {
  const now = new Date()
  if (range === 'Today') { const d = new Date(); d.setHours(0,0,0,0); return { from: d, to: null } }
  if (range === '7 days') return { from: new Date(now - 7*86400000), to: null }
  if (range === '14 days') return { from: new Date(now - 14*86400000), to: null }
  if (range === '1 month') return { from: new Date(now - 30*86400000), to: null }
  if (range === 'Custom') return {
    from: customFrom ? new Date(customFrom) : null,
    to: customTo ? new Date(customTo + 'T23:59:59') : null
  }
  return { from: null, to: null }
}

const isMobile = () => window.innerWidth < 700

function toggleArr(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function Chip({ label, active, count, onClick }) {
  return (
    <div onClick={onClick} style={{
      fontSize: 11,
      color: active ? '#fff' : '#aaa',
      padding: '4px 7px',
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 1,
      cursor: 'pointer',
      gap: 4,
      userSelect: 'none',
      background: active ? '#1e1e1e' : 'none',
      border: active ? '0.5px solid #444' : '0.5px solid transparent'
    }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: 10, color: '#555', flexShrink: 0 }}>{count}</span>}
    </div>
  )
}

function Section({ label, text }) {
  return (
    <div style={{ borderTop: '0.5px solid #222', paddingTop: 13, marginBottom: 14 }}>
      <div style={sl2}>{label}</div>
      <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{stripMarkdown(text)}</div>
    </div>
  )
}

function NewsModal({ record, onClose, onToggleSave, mobile }) {
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
                <span style={{ fontSize: 12, color: '#bbb', lineHeight: 1.65 }}>{stripMarkdown(ins)}</span>
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

function EarningsModal({ record, onClose, mobile }) {
  const f = record.fields

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 100, padding: mobile ? 0 : 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: mobile ? '14px 14px 0 0' : 14, width: '100%', maxWidth: mobile ? '100%' : 720, maxHeight: '88vh', overflowY: 'auto', padding: mobile ? '20px 16px' : '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{f['Filing Type']} · {f['Filing Date']}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.3, marginBottom: 6 }}>{f['Company']}</div>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#1e1a3a', color: '#c4bcf5', fontWeight: 500 }}>{f['Ticker']}</span>
          </div>
          <button onClick={onClose} style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, cursor: 'pointer', padding: '4px 10px', flexShrink: 0 }}>✕</button>
        </div>
        {f['Summary'] && <Section label="Summary" text={f['Summary']} />}
        {f['Key Performance Highlights'] && <Section label="Key Performance Highlights" text={f['Key Performance Highlights']} />}
        {f['Outlook'] && <Section label="Outlook & Q&A Insights" text={f['Outlook']} />}
        <div style={{ borderTop: '0.5px solid #222', paddingTop: 12, marginTop: 4 }}>
          {f['Filing URL']
            ? <a href={f['Filing URL']} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#5DCAA5', textDecoration: 'none' }}>View full transcript ↗</a>
            : <span />}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [records, setRecords] = useState([])
  const [earnings, setEarnings] = useState([])
  const [calendar, setCalendar] = useState([])
  const [loading, setLoading] = useState(true)
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedEarnings, setSelectedEarnings] = useState(null)
  const [search, setSearch] = useState('')
  const [earningsSearch, setEarningsSearch] = useState('')
  const [filterImps, setFilterImps] = useState([])
  const [filterSrcs, setFilterSrcs] = useState([])
  const [filterTopics, setFilterTopics] = useState([])
  const [dateRange, setDateRange] = useState('All time')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [tab, setTab] = useState('all')
  const [mainTab, setMainTab] = useState('news')
  const [showFilters, setShowFilters] = useState(false)
  const [mobile, setMobile] = useState(isMobile())

  // Local date string in YYYY-MM-DD — no timezone shift
  const todayStr = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    fetchAll().then(r => { setRecords(r); setLoading(false) }).catch(() => setLoading(false))
    fetchEarnings().then(r => { setEarnings(r); setEarningsLoading(false) }).catch(() => setEarningsLoading(false))
    fetchEarningsCalendar().then(r => setCalendar(r)).catch(() => setCalendar([]))
    const handleResize = () => setMobile(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggleSave = async (id, current) => {
    await toggleSaved(id, current)
    setRecords(prev => prev.map(r => r.id === id ? { ...r, fields: { ...r.fields, Saved: !current } } : r))
    if (selected?.id === id) setSelected(prev => ({ ...prev, fields: { ...prev.fields, Saved: !current } }))
  }

  const { from: cutoffFrom, to: cutoffTo } = getDateCutoff(dateRange, customFrom, customTo)

  const dateFiltered = records.filter(r => {
    const pub = r.fields['Published Date'] ? new Date(r.fields['Published Date']) : null
    if (!pub) return false
    if (cutoffFrom && pub < cutoffFrom) return false
    if (cutoffTo && pub > cutoffTo) return false
    return true
  })

  const savedCount = records.filter(r => r.fields['Saved']).length
  const highCount = dateFiltered.filter(r => r.fields['Importance'] === 'High').length
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayCount = dateFiltered.filter(r => r.fields['Published Date'] && new Date(r.fields['Published Date']) >= todayStart).length

  const sources = [...new Set(records.map(r => r.fields['Source']).filter(Boolean))]
  const allTopics = [...new Set(records.flatMap(r => r.fields['Topics'] || []))]

  const activeFilterCount = filterImps.length + filterSrcs.length + filterTopics.length +
    (dateRange !== 'All time' ? 1 : 0)

  const base = tab === 'saved' ? records.filter(r => r.fields['Saved']) : records
  const filtered = base.filter(r => {
    const f = r.fields
    const pub = f['Published Date'] ? new Date(f['Published Date']) : null
    const passDate = (!cutoffFrom || (pub && pub >= cutoffFrom)) && (!cutoffTo || (pub && pub <= cutoffTo))
    const passImp = filterImps.length === 0 || filterImps.includes(f['Importance'])
    const passSrc = filterSrcs.length === 0 || filterSrcs.includes(f['Source'])
    const passTopic = filterTopics.length === 0 || (f['Topics'] || []).some(t => filterTopics.includes(t))
    const passSearch = !search || (f['Title'] || '').toLowerCase().includes(search.toLowerCase()) ||
      (f['AI Summary'] || '').toLowerCase().includes(search.toLowerCase())
    return passDate && passImp && passSrc && passTopic && passSearch
  })

  const filteredEarnings = earnings.filter(r => {
    const f = r.fields
    return !earningsSearch ||
      (f['Company'] || '').toLowerCase().includes(earningsSearch.toLowerCase()) ||
      (f['Ticker'] || '').toLowerCase().includes(earningsSearch.toLowerCase()) ||
      (f['Filing Type'] || '').toLowerCase().includes(earningsSearch.toLowerCase())
  })

  // Compare date strings directly — no timezone issues
  const upcomingCalendar = calendar.filter(r => {
    const d = r.fields['Earnings Date']
    return d && d >= todayStr
  })

  const clearFilters = () => {
    setFilterImps([])
    setFilterSrcs([])
    setFilterTopics([])
    setDateRange('All time')
    setCustomFrom('')
    setCustomTo('')
  }

  const StatCards = () => (
    <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
      {[['Total', dateFiltered.length], ['High', highCount], ['Today', todayCount]].map(([l, n]) => (
        <div key={l} style={{ flex: 1, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 7, padding: '6px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: mobile ? 15 : 17, fontWeight: 500, color: '#fff' }}>{n}</div>
          <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{l}</div>
        </div>
      ))}
    </div>
  )

  const FilterPanel = ({ onClose }) => (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Filters</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={{ fontSize: 10, color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sl1}>Date range</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {DATE_RANGES.map(r => (
            <div key={r} onClick={() => setDateRange(r)}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: '0.5px solid', borderColor: dateRange === r ? '#1D9E75' : '#2a2a2a', background: dateRange === r ? '#0a2218' : '#161616', color: dateRange === r ? '#6ddbb0' : '#aaa' }}>
              {r}
            </div>
          ))}
        </div>
        {dateRange === 'Custom' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>FROM</div>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                style={{ width: '100%', background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#fff', outline: 'none', colorScheme: 'dark' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>TO</div>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                style={{ width: '100%', background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#fff', outline: 'none', colorScheme: 'dark' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sl1}>Importance {filterImps.length > 0 && <span style={{ color: '#1D9E75' }}>({filterImps.length})</span>}</div>
        {['High', 'Medium', 'Low'].map(imp => (
          <Chip key={imp} label={imp} active={filterImps.includes(imp)}
            count={dateFiltered.filter(r => r.fields['Importance'] === imp).length}
            onClick={() => setFilterImps(prev => toggleArr(prev, imp))} />
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sl1}>Source {filterSrcs.length > 0 && <span style={{ color: '#1D9E75' }}>({filterSrcs.length})</span>}</div>
        {sources.map(src => (
          <Chip key={src} label={src} active={filterSrcs.includes(src)}
            count={dateFiltered.filter(r => r.fields['Source'] === src).length}
            onClick={() => setFilterSrcs(prev => toggleArr(prev, src))} />
        ))}
      </div>

      <div>
        <div style={sl1}>Topic {filterTopics.length > 0 && <span style={{ color: '#1D9E75' }}>({filterTopics.length})</span>}</div>
        {allTopics.slice(0, 30).map(t => (
          <Chip key={t} label={t} active={filterTopics.includes(t)}
            onClick={() => setFilterTopics(prev => toggleArr(prev, t))} />
        ))}
      </div>
    </div>
  )

  const TabSwitcher = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: mobile ? '0 16px 10px' : '0' }}>
      <div style={{ display: 'flex', gap: 2, background: '#161616', borderRadius: 10, padding: '3px', border: '0.5px solid #2a2a2a' }}>
        {['news', 'earnings'].map(t => (
          <div key={t} onClick={() => setMainTab(t)}
            style={{
              fontSize: mobile ? 14 : 13,
              fontWeight: mainTab === t ? 700 : 400,
              padding: mobile ? '9px 32px' : '7px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              color: mainTab === t ? '#ff6b6b' : '#555',
              background: mainTab === t ? '#2a1515' : 'none',
              borderBottom: mainTab === t ? '2px solid #cc3333' : '2px solid transparent',
              letterSpacing: '0.01em',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
            {t === 'earnings'
              ? `Earnings${earnings.length > 0 ? ` (${earnings.length})` : ''}`
              : 'News'}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <div style={{ background: '#0f0f0f', borderBottom: '0.5px solid #2a2a2a', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
            GridIntel
          </div>
          {!mobile && <TabSwitcher />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mobile && mainTab === 'news' && (
              <button onClick={() => setShowFilters(!showFilters)}
                style={{ background: showFilters ? '#1e1e1e' : 'none', border: `0.5px solid ${activeFilterCount > 0 ? '#1D9E75' : '#2a2a2a'}`, borderRadius: 6, color: activeFilterCount > 0 ? '#6ddbb0' : '#aaa', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>
                {showFilters ? '✕ Close' : `⚙ Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
              </button>
            )}
            <div style={{ fontSize: 11, color: '#444' }}>
              {mainTab === 'news' ? `${filtered.length} articles` : `${earnings.length} filings`}
            </div>
          </div>
        </div>
        {mobile && <TabSwitcher />}
      </div>

      {mainTab === 'news' && mobile && showFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowFilters(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: '#0f0f0f', borderTop: '0.5px solid #2a2a2a', borderRadius: '14px 14px 0 0', maxHeight: '80vh', overflowY: 'auto' }}>
            <FilterPanel onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}

      {mainTab === 'news' && (
        <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
          {!mobile && (
            <div style={{ width: 220, borderRight: '0.5px solid #2a2a2a', flexShrink: 0, position: 'sticky', top: 77, height: 'calc(100vh - 77px)', overflowY: 'auto' }}>
              <FilterPanel />
            </div>
          )}
          <div style={{ flex: 1, padding: mobile ? '12px' : '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={{ background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', width: '100%', outline: 'none' }}
              placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
            {mobile && <StatCards />}
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {['all', 'saved'].map(t => (
                <div key={t} onClick={() => setTab(t)}
                  style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', color: tab === t ? '#fff' : '#888', background: tab === t ? '#1e1e1e' : 'none', border: `0.5px solid ${tab === t ? '#2a2a2a' : 'transparent'}` }}>
                  {t === 'all' ? `All (${filtered.length})` : `Saved${savedCount > 0 ? ` (${savedCount})` : ''}`}
                </div>
              ))}
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ marginLeft: 'auto', fontSize: 10, color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                  Clear filters ✕
                </button>
              )}
            </div>
            {loading ? (
              <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: 13 }}>Loading articles…</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: 13 }}>
                {tab === 'saved' ? 'No saved articles yet.' : 'No articles match your filters.'}
              </div>
            ) : filtered.map(r => {
              const f = r.fields
              const saved = !!f['Saved']
              return (
                <div key={r.id} onClick={() => setSelected(r)}
                  style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', position: 'relative' }}>
                  <button onClick={e => { e.stopPropagation(); handleToggleSave(r.id, saved) }}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: saved ? '#ffc04d' : '#444', padding: 2 }}>
                    {saved ? '★' : '☆'}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, flexWrap: 'wrap', paddingRight: 28 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, ...srcStyle(f['Source']) }}>{f['Source'] || 'Unknown'}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, ...impStyle(f['Importance']) }}>{f['Importance'] || '—'}</span>
                    <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>{formatDate(f['Published Date'])}</span>
                  </div>
                  <div style={{ fontSize: mobile ? 14 : 13, fontWeight: 500, color: '#f0f0f0', lineHeight: 1.4, marginBottom: 5 }}>{f['Title'] || 'Untitled'}</div>
                  <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stripMarkdown(f['AI Summary'] || '')}</div>
                  {(f['Topics'] || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {(f['Topics'] || []).slice(0, mobile ? 3 : 5).map(t => (
                        <span key={t} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: filterTopics.includes(t) ? '#0a2218' : '#1e1e1e', color: filterTopics.includes(t) ? '#6ddbb0' : '#999', border: `0.5px solid ${filterTopics.includes(t) ? '#1D9E75' : '#2a2a2a'}` }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mainTab === 'earnings' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: mobile ? '12px' : '20px 16px' }}>
          {upcomingCalendar.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={sl1}>Upcoming Earnings — {upcomingCalendar[0]?.fields['Quarter'] || 'Q1 2026'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {upcomingCalendar.map(r => {
                  const f = r.fields
                  const isToday = f['Earnings Date'] === todayStr
                  return (
                    <div key={r.id} style={{
                      background: isToday ? '#0a2218' : '#111',
                      border: `0.5px solid ${isToday ? '#1D9E75' : '#2a2a2a'}`,
                      borderRadius: 6,
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#f0f0f0' }}>{f['Ticker']}</span>
                      <span style={{ fontSize: 10, color: isToday ? '#6ddbb0' : '#555' }}>
                        {isToday ? 'Today' : formatEarningsDate(f['Earnings Date'])}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={sl1}>Earnings Analysis</div>
          <input style={{ background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', width: '100%', outline: 'none', marginBottom: 16, marginTop: 8 }}
            placeholder="Search by company, ticker or quarter…" value={earningsSearch} onChange={e => setEarningsSearch(e.target.value)} />

          {earningsLoading ? (
            <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: 13 }}>Loading earnings…</div>
          ) : filteredEarnings.length === 0 ? (
            <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: 13 }}>No earnings filings yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredEarnings.map(r => {
                const f = r.fields
                return (
                  <div key={r.id} onClick={() => setSelectedEarnings(r)}
                    style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginBottom: 5 }}>{f['Company']}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#1e1a3a', color: '#c4bcf5', fontWeight: 500 }}>{f['Ticker']}</span>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#0a2218', color: '#6ddbb0', fontWeight: 500 }}>{f['Filing Type']}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>{f['Filing Date']}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {stripMarkdown(f['Summary'] || f['Key Performance Highlights'] || '')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {selected && <NewsModal record={selected} onClose={() => setSelected(null)} onToggleSave={handleToggleSave} mobile={mobile} />}
      {selectedEarnings && <EarningsModal record={selectedEarnings} onClose={() => setSelectedEarnings(null)} mobile={mobile} />}
    </div>
  )
}

const sl1 = { fontSize: 9, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }
const sl2 = { fontSize: 9, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }
