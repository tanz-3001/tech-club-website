import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const EVENT_TIME = new Date('2026-10-01T09:00:00+04:00').getTime()
const INTRO_SESSION_KEY = 'into-the-void-intro-v3'

function useCountdown() {
  const [time, setTime] = useState(() => Math.max(0, EVENT_TIME - Date.now()))
  useEffect(() => {
    const tick = () => setTime(Math.max(0, EVENT_TIME - Date.now()))
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  const parts = { days: 0, hours: 0, mins: 0, secs: 0 }
  let remaining = Math.floor(time / 1000)
  parts.days = Math.floor(remaining / 86400); remaining %= 86400
  parts.hours = Math.floor(remaining / 3600); remaining %= 3600
  parts.mins = Math.floor(remaining / 60); parts.secs = remaining % 60
  return parts
}

function Starfield() {
  const canvas = useRef(null)
  useEffect(() => {
    const el = canvas.current; const ctx = el.getContext('2d')
    const stars = Array.from({ length: 190 }, () => ({ x: Math.random(), y: Math.random() * 1.2, z: Math.random() }))
    const mouse = { x: .5, y: .5 }; const move = (e) => { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight }; window.addEventListener('pointermove', move, { passive: true })
    const shooting = Array.from({ length: 5 }, (_, i) => ({ x: .15 + Math.random() * .78, y: .04 + Math.random() * .72, delay: i * 3700 + Math.random() * 2600, duration: 580 + Math.random() * 430, length: 34 + Math.random() * 55 }))
    let raf
    const draw = (now = performance.now()) => {
      const { innerWidth: w, innerHeight: h, scrollY } = window
      const dpr = Math.min(devicePixelRatio, 2)
      if (el.width !== w * dpr || el.height !== h * dpr) { el.width = w * dpr; el.height = h * dpr; el.style.width = `${w}px`; el.style.height = `${h}px`; ctx.scale(dpr, dpr) }
      ctx.clearRect(0, 0, w, h)
      stars.forEach((s) => {
        const depth = .15 + s.z * .85; const driftX = (mouse.x - .5) * depth * 46; const driftY = (mouse.y - .5) * depth * 30; const y = ((s.y * h) - scrollY * depth * .09 + driftY) % (h + 24)
        ctx.globalAlpha = .12 + s.z * .65; ctx.fillStyle = s.z > .72 ? '#b8c9ff' : '#8291c7'
        ctx.beginPath(); ctx.arc(s.x * w + driftX, y < 0 ? y + h + 24 : y, .35 + s.z * 1.05, 0, Math.PI * 2); ctx.fill()
      })
      shooting.forEach((s) => {
        const cycle = 14500; const p = ((now - s.delay) % cycle) / s.duration
        if (p < 0 || p > 1) return
        const x = s.x * w + p * 130, y = s.y * h + p * 76
        const trail = ctx.createLinearGradient(x - s.length, y - s.length * .58, x, y)
        trail.addColorStop(0, 'rgba(140,155,255,0)'); trail.addColorStop(.75, 'rgba(164,178,255,.09)'); trail.addColorStop(1, 'rgba(230,238,255,.45)')
        ctx.strokeStyle = trail; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - s.length, y - s.length * .58); ctx.lineTo(x, y); ctx.stroke()
      })
      raf = requestAnimationFrame(draw)
    }
    draw(); return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move) }
  }, [])
  return <canvas aria-hidden="true" className="starfield" ref={canvas} />
}

function OrbIntro({ onComplete }) {
  const canvas = useRef(null); const shatterAt = useRef(0); const [shattering, setShattering] = useState(false)
  useEffect(() => {
    const replayPreview = new URLSearchParams(window.location.search).has('intro')
    if (!replayPreview && sessionStorage.getItem(INTRO_SESSION_KEY)) { onComplete(); return }
    const el = canvas.current; const ctx = el.getContext('2d'); let raf
    const shards = Array.from({ length: 29 }, (_, i) => {
      const a = Math.random() * Math.PI * 2; const speed = 220 + Math.random() * 450
      const pts = Array.from({ length: 3 + (i % 2) }, (_, j) => ({ a: a + (j - 1.5) * (.32 + Math.random() * .44), r: 10 + Math.random() * 55 }))
      return { x: 0, y: 0, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 80, rot: Math.random() * 6, spin: (Math.random() - .5) * 14, pts, alpha: .94 }
    })
    const render = (now) => {
      const w = el.width = innerWidth * devicePixelRatio, h = el.height = innerHeight * devicePixelRatio
      el.style.width = `${innerWidth}px`; el.style.height = `${innerHeight}px`; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      const cx = innerWidth / 2, cy = innerHeight / 2 - 30; const t = now / 1000
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (!shatterAt.current) {
        const beat = 1 + Math.sin(t * 1.7) * .035
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 245 * beat); aura.addColorStop(0, 'rgba(45,159,255,.42)'); aura.addColorStop(.2, 'rgba(35,98,255,.21)'); aura.addColorStop(.52, 'rgba(44,51,255,.1)'); aura.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = aura; ctx.fillRect(0, 0, innerWidth, innerHeight)
        ctx.save(); ctx.translate(cx, cy); ctx.scale(beat, beat); ctx.beginPath(); ctx.arc(0, 0, 114, 0, Math.PI * 2); ctx.clip()
        const core = ctx.createRadialGradient(-8, -10, 1, 0, 0, 118); core.addColorStop(0, '#e1ffff'); core.addColorStop(.045, '#54f3ff'); core.addColorStop(.13, '#168de9'); core.addColorStop(.36, '#0b3a9f'); core.addColorStop(.73, '#090f3c'); core.addColorStop(1, '#020515'); ctx.fillStyle = core; ctx.fillRect(-120, -120, 240, 240)
        ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 62; i++) { const a = i * 2.399 + Math.sin(t * .75 + i * 4) * .13; const start = 5 + (i % 5) * 7; const reach = 67 + ((i * 19) % 47); ctx.strokeStyle = i % 5 === 0 ? 'rgba(223,255,255,.92)' : 'rgba(52,203,255,.65)'; ctx.lineWidth = i % 5 === 0 ? 1.25 : .58; ctx.beginPath(); ctx.moveTo(Math.cos(a) * start, Math.sin(a) * start); for (let j = 1; j < 12; j++) { const rr = start + (reach - start) * j / 11; const wobble = Math.sin(i * 7 + j * 8 + t * 9) * (.1 + j * .012); ctx.lineTo(Math.cos(a + wobble) * rr, Math.sin(a + wobble) * rr) } ctx.stroke() }
        for (let i = 0; i < 11; i++) { ctx.strokeStyle = `rgba(83,202,255,${.13 + (i % 3) * .05})`; ctx.lineWidth = .55; ctx.beginPath(); ctx.ellipse(0, 0, 52 + i * 6, 99 - i * 5, t * .24 + i * .42, 0, Math.PI * 2); ctx.stroke() } ctx.globalCompositeOperation = 'source-over'
        const inner = ctx.createRadialGradient(-36, -46, 4, 0, 0, 130); inner.addColorStop(0, 'rgba(255,255,255,.98)'); inner.addColorStop(.04, 'rgba(187,246,255,.55)'); inner.addColorStop(.25, 'rgba(65,196,255,.07)'); inner.addColorStop(1, 'rgba(255,255,255,.1)'); ctx.fillStyle = inner; ctx.fillRect(-120, -120, 240, 240); ctx.restore()
        ctx.strokeStyle = 'rgba(86,223,255,.92)'; ctx.shadowBlur = 16; ctx.shadowColor = '#1ebcff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, 114 * beat, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0
      } else {
        const p = Math.min((now - shatterAt.current) / 1250, 1); const flash = Math.max(0, 1 - p * 6.5)
        ctx.fillStyle = `rgba(218,241,255,${flash * .9})`; ctx.fillRect(0, 0, innerWidth, innerHeight)
        if (p < .58) { const charge = Math.min(p / .12, 1); const travel = Math.min(Math.max((p - .07) / .46, 0), 1); const fade = Math.max(0, 1 - (p - .18) / .4); const surge = ctx.createRadialGradient(cx, cy, 0, cx, cy, 170 + travel * 420); surge.addColorStop(0, `rgba(170,245,255,${.62 * charge * fade})`); surge.addColorStop(.15, `rgba(77,176,255,${.28 * fade})`); surge.addColorStop(1, 'rgba(52,92,255,0)'); ctx.fillStyle = surge; ctx.fillRect(0, 0, innerWidth, innerHeight); for (let i = 0; i < 58; i++) { const a = i * 2.399 + Math.sin(i * 13) * .3; const max = 220 + (i % 7) * 82; const r = 15 + travel * max; ctx.strokeStyle = i % 4 === 0 ? `rgba(228,255,255,${.9 * fade})` : `rgba(51,192,255,${.76 * fade})`; ctx.lineWidth = i % 4 === 0 ? 2.2 : .85; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); for (let j = 1; j < 9; j++) { const rr = r * j / 8; const zig = Math.sin(i * 9 + j * 7 + p * 55) * (.08 + j * .018); ctx.lineTo(cx + Math.cos(a + zig) * rr, cy + Math.sin(a + zig) * rr) } ctx.stroke(); if (i % 3 === 0 && travel > .15) { const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; ctx.fillStyle = `rgba(214,250,255,${.8 * fade})`; ctx.fillRect(px - 1.5, py - 1.5, 3, 3) } } }
        shards.forEach((s) => { const dt = p * 1.35; const x = cx + s.vx * dt, y = cy + s.vy * dt + 430 * dt * dt; ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot + s.spin * dt); ctx.globalAlpha = s.alpha * (1 - Math.max(0, (p - .48) / .52)); ctx.beginPath(); s.pts.forEach((pt, j) => { const px = Math.cos(pt.a) * pt.r, py = Math.sin(pt.a) * pt.r; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py) }); ctx.closePath(); const g = ctx.createLinearGradient(-40, -35, 40, 40); g.addColorStop(0, 'rgba(230,244,255,.9)'); g.addColorStop(.45, 'rgba(119,124,255,.42)'); g.addColorStop(1, 'rgba(233,180,255,.12)'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(235,246,255,.65)'; ctx.stroke(); ctx.restore() })
        if (p >= 1) onComplete()
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render); return () => cancelAnimationFrame(raf)
  }, [onComplete])
  const enter = () => { if (!shattering) { shatterAt.current = performance.now(); setShattering(true) } }
  return <section className={`intro ${shattering ? 'is-shattering' : ''}`} onClick={enter} role="button" tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && enter()} aria-label="Enter Into the Void"><canvas ref={canvas} /><p>CLICK TO ENTER<span className="cursor">_</span></p></section>
}

function SolarSystem({ active = 0 }) {
  return <div className={`solar-system planet-stage planet-${active}`} aria-hidden="true">
    <div className="sun"><span /></div>
    <div className="orbit orbit-one"><b className="planet mercury" /></div>
    <div className="orbit orbit-two"><b className="planet cobalt" /></div>
    <div className="orbit orbit-three"><b className="planet lavender" /></div>
    <div className="orbit orbit-four"><b className="planet ice" /></div>
    <div className="saturn-ring ring-a" /><div className="saturn-ring ring-b" />
  </div>
}

const heroStops = [
  { label: '01 / Launch', title: <>INTO<br />THE <em>VOID</em></>, copy: 'A 24-hour collision of curious minds, untamed ideas, and code that refuses to stay ordinary.', link: '#mission', action: 'Explore the mission' },
  { label: '02 / Mission', title: <>MAKE<br />IT <em>MATTER.</em></>, copy: 'Find your people, choose a real problem, and turn the first sketch into something that works.', link: '#mission', action: 'Read the mission' },
  { label: '03 / Tracks', title: <>CHOOSE<br />A <em>VECTOR.</em></>, copy: 'Four directions. One wide-open field for ideas that are useful, strange, and brave.', link: '#tracks', action: 'See the tracks' },
  { label: '04 / Rewards', title: <>LEAVE<br />A <em>MARK.</em></>, copy: 'Build for the feeling of discovery. There are prizes for the work that earns a second look.', link: '#prizes', action: 'View the rewards' },
]
function Hero() {
  const time = useCountdown()
  const [active, setActive] = useState(0); const stop = heroStops[active]
  const move = (direction) => setActive((active + direction + heroStops.length) % heroStops.length)
  return <main className="site"><Starfield /><nav><a className="wordmark" href="#top">VOID<span>_</span></a><div className="nav-links"><a href="#mission">Mission</a><a href="#tracks">Tracks</a><a href="#timeline">Timeline</a><a href="#faq">FAQ</a></div><a className="nav-cta" href="#register">Register <i>↗</i></a></nav><section className="hero" id="top"><div className="hero-copy" key={active}><p className="eyebrow">{stop.label}<span /> OCTOBER 01—02, 2026</p><h1>{stop.title}</h1><p className="hero-intro">{stop.copy}</p><div className="hero-actions"><a className="button primary" href="#register">Claim your place <b>↗</b></a><a className="text-link" href={stop.link}>{stop.action} <b>↓</b></a></div></div><SolarSystem active={active} /><div className="hero-carousel"><button onClick={() => move(-1)} aria-label="Previous planet">←</button><span>{String(active + 1).padStart(2, '0')} <i>/ 04</i></span><button onClick={() => move(1)} aria-label="Next planet">→</button></div><div className="countdown" aria-label="Countdown to event"><p>Launch window opens in</p><div>{Object.entries(time).map(([key, value]) => <span key={key}><strong>{String(value).padStart(2, '0')}</strong><small>{key}</small></span>)}</div></div><div className="hero-meta"><span>24H / INTER-UNIVERSITY HACKATHON</span><span>DUBAI · UAE <i>25.2048° N, 55.2708° E</i></span></div></section></main>
}

function CountdownSection() {
  const time = useCountdown()
  return <section className="launch-countdown" aria-label="Event countdown"><p className="section-kicker"><span>LIVE LAUNCH WINDOW / OCTOBER 01, 2026</span><i /></p><div><h2>T−MINUS<br /><em>TO THE EVENT.</em></h2><p>One orbit remains. Find your crew and make your next idea count.</p></div><section className="launch-numbers">{Object.entries(time).map(([key, value]) => <article key={key}><b>{String(value).padStart(2, '0')}</b><span>{key}</span></article>)}</section></section>
}
function VoidInteraction() {
  const [cursor, setCursor] = useState({ x: -80, y: -80 }); const [trail, setTrail] = useState([]); const [transitioning, setTransitioning] = useState(false); const typed = useRef('')
  useEffect(() => { document.body.classList.add('void-cursor'); const move = (e) => { const point = { x: e.clientX, y: e.clientY }; setCursor(point); setTrail((points) => [point, ...points].slice(0, 7)); document.querySelectorAll('.hero-copy h1, h2, .track h3, .timeline-list b').forEach((node) => { const r = node.getBoundingClientRect(); const dx = point.x - (r.left + r.width / 2), dy = point.y - (r.top + r.height / 2), d = Math.hypot(dx, dy), power = Math.max(0, 1 - d / 260) * 5; node.style.translate = `${dx * power / 260}px ${dy * power / 260}px` }) }; const key = (e) => { if (e.key.length !== 1) return; typed.current = (typed.current + e.key.toLowerCase()).slice(-11); if (typed.current.includes('singularity')) { document.body.classList.add('singularity'); setTimeout(() => document.body.classList.remove('singularity'), 1800); typed.current = '' } }; const navigate = (e) => { const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href') === '#') return; const target = document.querySelector(a.getAttribute('href')); if (!target) return; e.preventDefault(); setTransitioning(true); setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 260); setTimeout(() => setTransitioning(false), 720) }; window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('keydown', key); document.addEventListener('click', navigate); return () => { document.body.classList.remove('void-cursor'); window.removeEventListener('pointermove', move); window.removeEventListener('keydown', key); document.removeEventListener('click', navigate) } }, [])
  return <><div className="void-trail">{trail.map((point, index) => <i key={index} style={{ transform: `translate(${point.x}px,${point.y}px) scale(${1 - index * .1})`, opacity: 1 - index * .13 }} />)}</div><div className="void-cursor-dot" style={{ transform: `translate(${cursor.x}px,${cursor.y}px)` }} />{transitioning && <div className="void-transition" />}</>
}

const tracks = [
  ['01', 'Beyond Earth', 'Build tools that change how people explore, navigate, and protect the world around them.', '◌'],
  ['02', 'Life Support', 'Make daily life healthier, more accessible, or more sustainable through technology.', '✦'],
  ['03', 'Signal & Sense', 'Turn data, AI, and creative intelligence into something people can genuinely use.', '⌁'],
  ['04', 'Open Frequency', 'Bring the problem that keeps you up at night. The boldest useful idea wins.', '↗'],
]
const timelineEvents = [
  ['09:00 / OCT 01', 'Gather & receive the brief', 'The room opens. Meet your people and choose a problem worth chasing.'],
  ['10:00 / OCT 01', 'Build window opens', 'Ideas become interfaces, experiments, demos, and beautiful mistakes.'],
  ['22:00 / OCT 01', 'Midnight pulse', 'A moment to regroup, find fuel, and ask a mentor the hard question.'],
  ['10:00 / OCT 02', 'Hands off keyboards', 'Ship it. Breathe. Get your story ready for the room.'],
  ['12:00 / OCT 02', 'Showcase & awards', 'Present your work, meet the judges, and celebrate every brave build.'],
]

function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }, { threshold: .14 }); const node = ref.current; observer.observe(node); return () => observer.disconnect() }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}
function Constellation() {
  return <svg className="constellation" viewBox="0 0 360 220" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="M15 177 92 126 153 151 218 70 325 22" /><path d="M92 126 115 35 218 70 281 142 340 111" /><path d="M153 151 281 142" /></g><g fill="currentColor"><circle cx="15" cy="177" r="3" /><circle cx="92" cy="126" r="4" /><circle cx="115" cy="35" r="2" /><circle cx="153" cy="151" r="3" /><circle cx="218" cy="70" r="4" /><circle cx="281" cy="142" r="3" /><circle cx="325" cy="22" r="2" /><circle cx="340" cy="111" r="3" /></g></svg>
}

function MissionAndTracks() {
  return <main className="content-shell">
    <section className="mission" id="mission">
      <Reveal className="section-kicker"><span>01 / THE MISSION</span><i /></Reveal>
      <Reveal className="mission-layout"><div><p className="mono-label">A single night can change your trajectory.</p><h2>MAKE A <em>BRILLIANT</em><br />MESS.</h2></div><div className="mission-copy"><p>Into the Void is UOWD’s 24-hour room for ambitious experiments. Come with a team, a question, or just the itch to make something real.</p><p>Across universities and disciplines, you’ll have one intense day to turn a half-formed thought into a convincing prototype.</p><a href="#timeline" className="arrow-link">Read the field guide <b>↓</b></a></div></Reveal>
      <Reveal className="mission-signals"><article><b>24</b><span>hours of deep work</span></article><article><b>4</b><span>ways into the challenge</span></article><article><b>01</b><span>idea worth shipping</span></article><div className="signal-orbit"><i /><i /><i /></div></Reveal>
      <Constellation />
    </section>
    <section className="tracks" id="tracks">
      <Reveal className="section-kicker"><span>02 / CHOOSE A VECTOR</span><i /></Reveal>
      <Reveal className="tracks-header"><h2>FOUR WAYS<br />TO <em>GO DEEP.</em></h2><p>Pick a direction, then make it unexpected. Every track welcomes coders, designers, researchers, and builders from every faculty.</p></Reveal>
      <div className="track-grid">{tracks.map(([number, title, copy, glyph]) => <Reveal className="track" key={number}><span className="track-number">{number}</span><span className="track-glyph">{glyph}</span><h3>{title}</h3><p>{copy}</p><a href="#register" aria-label={`Explore ${title}`}>Explore <b>↗</b></a></Reveal>)}</div>
    </section>
    <section className="timeline" id="timeline">
      <Reveal className="section-kicker"><span>03 / THE 24-HOUR ARC</span><i /></Reveal>
      <Reveal className="timeline-title"><h2>THE CLOCK<br />IS <em>THE CANVAS.</em></h2><p>There’s enough structure to find your footing, and enough open space to surprise yourself.</p></Reveal>
      <div className="timeline-layout"><div className="timeline-list">{timelineEvents.map(([time, title, copy], index) => <Reveal className="timeline-event" key={time}><article style={{ transitionDelay: `${index * 110}ms` }}><time>{time}</time><div><b>{title}</b><span>{copy}</span></div></article></Reveal>)}</div><Reveal className="timeline-side"><div className="time-dial"><span>24</span><small>hours</small></div><p>THE MOMENT<br /><em>IS NOW.</em></p><div className="dial-line" /></Reveal></div>
    </section>
  </main>
}

const routeStops = [['top', '01', 'Launch'], ['mission', '02', 'Mission'], ['tracks', '03', 'Tracks'], ['timeline', '04', 'Timeline'], ['prizes', '05', 'Prizes'], ['rules', '06', 'Protocol'], ['faq', '07', 'Signals'], ['register', '08', 'Join']]
function MissionRoute() {
  const [active, setActive] = useState(0)
  useEffect(() => { const nodes = routeStops.map(([id]) => document.getElementById(id)).filter(Boolean); const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(routeStops.findIndex(([id]) => id === entry.target.id)) }), { rootMargin: '-36% 0px -52% 0px', threshold: 0 }); nodes.forEach((node) => observer.observe(node)); return () => observer.disconnect() }, [])
  return <aside className="mission-route" aria-label="Page navigation"><span className="route-rocket" aria-hidden="true" style={{ transform: `translateY(${active * 31}px)` }}><i /></span><div>{routeStops.map(([id, number, label], index) => <a className={active === index ? 'active' : ''} href={`#${id}`} key={id}><b>{number}</b><span>{label}</span></a>)}</div></aside>
}

const questions = [
  ['Who can take part?', 'Any currently enrolled university student can join. Bring friends from another university or meet your team at the event.'],
  ['Do I need a team already?', 'No. You can register solo and meet potential collaborators during our team-forming session.'],
  ['How many people are on a team?', 'Teams can have between two and five members.'],
  ['What should I bring?', 'Your laptop, chargers, a student ID, and the appetite to build something you have not built before.'],
  ['Can I use existing tools and APIs?', 'Yes. Libraries, public APIs, and open-source tools are welcome when properly credited. Your project itself must be made during the event.'],
]
function NextChapter() {
  const [open, setOpen] = useState(0)
  return <main className="next-chapter">
    <section className="prizes" id="prizes"><Reveal className="section-kicker"><span>04 / REWARDS WITH GRAVITY</span><i /></Reveal><Reveal className="prizes-intro"><h2>BUILD IT.<br /><em>TAKE IT HOME.</em></h2><p>The prize pool recognises the work that proves useful, original, and hard to ignore.</p></Reveal><div className="prize-layout"><Reveal className="grand-prize"><span>01 / GRAND PRIZE</span><div><b>AED<br />20K</b><p>The build that makes the room lean in.</p></div><small>+ trophy · mentorship sessions · feature spotlight</small></Reveal><div className="minor-prizes"><Reveal><article><span>02 / RUNNER UP</span><b>AED 12,000</b><p>For the team with exceptional craft and momentum.</p></article></Reveal><Reveal><article><span>03 / THIRD PLACE</span><b>AED 6,000</b><p>For a sharp idea, made real in a short window.</p></article></Reveal><Reveal><article><span>04 / SPECIAL SIGNALS</span><b>MORE TO DISCOVER</b><p>Design, impact, first-timers, and crowd favourites.</p></article></Reveal></div></div></section>
    <section className="rules" id="rules"><Reveal className="section-kicker"><span>05 / KEEP IT BRAVE. KEEP IT FAIR.</span><i /></Reveal><Reveal className="rules-top"><h2>THE FEW<br />RULES <em>THAT MATTER.</em></h2><p>You’re free to be ambitious. These are the guardrails that let every team have a fair shot.</p></Reveal><div className="rules-grid"><Reveal><ol><li><b>Build during the event.</b><span>Fresh projects only. Existing libraries and APIs are welcome.</span></li><li><b>Make the work yours.</b><span>Credit tools, assets, and open-source code you build upon.</span></li><li><b>Respect the room.</b><span>Curiosity wins. Harassment, discrimination, and exclusion do not.</span></li></ol></Reveal><Reveal className="rules-aside"><span>TEAM SIZE</span><b>2—5</b><span>STUDENTS</span><i /><p>All disciplines are welcome. Bring your sharpest perspective.</p><a href="#faq" className="arrow-link">See full participant guide <b>↓</b></a></Reveal></div></section>
    <section className="faq" id="faq"><Reveal className="section-kicker"><span>06 / SIGNALS RECEIVED</span><i /></Reveal><Reveal className="faq-heading"><h2>YOU ASK.<br /><em>WE UNMYSTIFY.</em></h2><p>Everything you need to arrive prepared, stay focused, and make the most of your 24 hours.</p></Reveal><div className="faq-list">{questions.map(([question, answer], index) => <Reveal key={question}><button className={open === index ? 'open' : ''} onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{String(index + 1).padStart(2, '0')}</span><b>{question}</b><i>{open === index ? '−' : '+'}</i></button>{open === index && <p>{answer}</p>}</Reveal>)}</div></section>
  </main>
}

function App() {
  const [entered, setEntered] = useState(false)
  const finish = () => { sessionStorage.setItem(INTRO_SESSION_KEY, 'true'); setEntered(true) }
  return <><Hero /><CountdownSection /><MissionAndTracks /><NextChapter /><MissionRoute /><VoidInteraction />{!entered && <OrbIntro onComplete={finish} />}</>
}

createRoot(document.getElementById('root')).render(<App />)
