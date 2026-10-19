import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Sparkles, ArrowLeft, ArrowRight, RotateCcw, Share2, Gift } from 'lucide-react'
import { REWARDS, weightedRandomReward, validateRewardWeights, type Reward } from './rewards'

type Phase = 'idle' | 'moving' | 'descending' | 'grabbing' | 'lifting' | 'dropping' | 'reveal'
type Screen = 'start' | 'game' | 'end'
type Toy = { id: number; x: number; y: number; reward: Reward }

const INITIAL_TOYS: Toy[] = [
  { id: 1, x: 120, y: 320, reward: REWARDS[0] }, { id: 2, x: 205, y: 365, reward: REWARDS[1] },
  { id: 3, x: 300, y: 318, reward: REWARDS[2] }, { id: 4, x: 395, y: 365, reward: REWARDS[3] },
  { id: 5, x: 485, y: 320, reward: REWARDS[4] }, { id: 6, x: 165, y: 420, reward: REWARDS[5] },
  { id: 7, x: 270, y: 430, reward: REWARDS[6] }, { id: 8, x: 375, y: 425, reward: REWARDS[7] },
  { id: 9, x: 455, y: 420, reward: REWARDS[8] }, { id: 10, x: 325, y: 385, reward: REWARDS[9] },
]
const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms))

function GiftSprite({ toy, selected = false }: { toy: Toy; selected?: boolean }) {
  return <g transform={`translate(${toy.x} ${toy.y})`} className={selected ? 'toy selected-toy' : 'toy'}>
    <rect x="-24" y="-24" width="48" height="44" rx="2" fill="#17152e" opacity=".45" />
    <rect x="-21" y="-23" width="42" height="39" fill={toy.reward.color} stroke="#fff4f8" strokeWidth="2" />
    <rect x="-4" y="-23" width="8" height="39" fill="#fff4f8" opacity=".9" />
    <rect x="-21" y="-9" width="42" height="7" fill="#fff4f8" opacity=".9" />
    <rect x="-13" y="-31" width="10" height="9" fill={toy.reward.color} stroke="#fff4f8" strokeWidth="2" />
    <rect x="3" y="-31" width="10" height="9" fill={toy.reward.color} stroke="#fff4f8" strokeWidth="2" />
    <text x="0" y="9" textAnchor="middle" fontSize="17">{toy.reward.emoji}</text>
  </g>
}

function Claw({ x, y, closed, carrying }: { x: number; y: number; closed: boolean; carrying: Toy | null }) {
  return <g className="claw-assembly">
    <rect x={x - 5} y="80" width="10" height="16" fill="#48e5ff" stroke="#17152e" strokeWidth="3" />
    <line x1={x} y1="94" x2={x} y2={y} stroke="#ffd166" strokeWidth="4" />
    <rect x={x - 7} y={y - 5} width="14" height="13" fill="#ff4fa3" stroke="#fff4f8" strokeWidth="2" />
    <path d={closed ? `M ${x-5} ${y+6} l -5 10 l 7 12 M ${x+5} ${y+6} l 5 10 l -7 12` : `M ${x-5} ${y+6} l -15 15 l -1 15 M ${x+5} ${y+6} l 15 15 l 1 15`} fill="none" stroke="#48e5ff" strokeWidth="6" strokeLinecap="square" />
    {carrying && <g transform={`translate(${x} ${y+42})`}><rect x="-18" y="-16" width="36" height="30" fill={carrying.reward.color} stroke="#fff4f8" strokeWidth="2"/><text x="0" y="7" fontSize="22" textAnchor="middle">{carrying.reward.emoji}</text></g>}
  </g>
}

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [phase, setPhase] = useState<Phase>('idle')
  const [clawX, setClawX] = useState(300)
  const [clawY, setClawY] = useState(110)
  const [closed, setClosed] = useState(false)
  const [toys, setToys] = useState<Toy[]>(INITIAL_TOYS)
  const [carrying, setCarrying] = useState<Toy | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [miss, setMiss] = useState(false)
  const [sound, setSound] = useState(false)
  const [plays, setPlays] = useState(0)
  const busy = useRef(false)
  const holdTimer = useRef<number | null>(null)
  const audio = useRef<AudioContext | null>(null)

  const beep = useCallback((frequency = 440, duration = 0.07, type: OscillatorType = 'square') => {
    if (!sound) return
    try {
      const ctx = audio.current ?? new AudioContext()
      audio.current = ctx
      if (ctx.state === 'suspended') void ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type; osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.045, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + duration)
    } catch { /* Audio is an optional enhancement. */ }
  }, [sound])

  const move = useCallback((delta: number) => {
    if (busy.current || screen !== 'game') return
    setPhase('moving')
    setClawX(x => Math.max(62, Math.min(538, x + delta)))
    beep(260, 0.035)
    window.setTimeout(() => setPhase(p => p === 'moving' ? 'idle' : p), 120)
  }, [screen, beep])

  const stopHold = useCallback(() => {
    if (holdTimer.current !== null) window.clearInterval(holdTimer.current)
    holdTimer.current = null
  }, [])
  const startHold = useCallback((delta: number) => {
    if (busy.current || screen !== 'game') return
    move(delta)
    stopHold()
    holdTimer.current = window.setInterval(() => move(delta), 85)
  }, [move, screen, stopHold])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (screen !== 'game') return
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault()
      if (event.repeat && event.key === ' ') return
      if (event.key === 'ArrowLeft') move(-15)
      if (event.key === 'ArrowRight') move(15)
      if (event.key === ' ' || event.key === 'Enter') void grab()
    }
    window.addEventListener('keydown', onKey)
    const onBlur = () => stopHold()
    window.addEventListener('blur', onBlur)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('blur', onBlur); stopHold() }
  })

  const grab = async () => {
    if (busy.current || screen !== 'game' || phase === 'reveal') return
    busy.current = true
    stopHold()
    setMiss(false); setReward(null); setCarrying(null); setClosed(false)
    setPhase('descending'); beep(180, 0.16)
    await wait(720); setClawY(300)
    await wait(550); setPhase('grabbing'); setClosed(true); beep(320, 0.09)
    const target = toys.filter(t => Math.abs(t.x - clawX) <= 38).sort((a,b) => Math.abs(a.x-clawX)-Math.abs(b.x-clawX))[0]
    const success = Boolean(target) && Math.random() < 0.78
    let lifted: Toy | null = null
    if (success && target) {
      lifted = { ...target, x: clawX, y: 0, reward: weightedRandomReward() }
      setCarrying(lifted)
      setToys(current => current.filter(t => t.id !== target.id))
    } else setMiss(true)
    await wait(350); setPhase('lifting'); setClawY(110); beep(success ? 600 : 150, 0.15)
    await wait(720); setPhase('dropping')
    if (lifted) { setCarrying(null); setReward(lifted.reward); setPlays(n => n + 1); beep(lifted.reward.rarity === 'LEGENDARY' ? 980 : 720, 0.3, 'triangle') }
    else setPlays(n => n + 1)
    await wait(400); setPhase('reveal'); setScreen('game'); busy.current = false
  }

  const playAgain = () => {
    setReward(null); setMiss(false); setCarrying(null); setClawY(110); setClosed(false)
    setToys(current => current.length ? current : INITIAL_TOYS.map((t, i) => ({ ...t, id: t.id + plays * 10 + i })))
    setPhase('idle'); busy.current = false
  }
  const share = async () => {
    const text = reward ? `I got ${reward.name} in the 20/10 Pixel Arcade! Happy Vietnamese Women's Day!` : 'Happy Vietnamese Women\'s Day!'
    if (navigator.share) { try { await navigator.share({ title: '20/10 Pixel Arcade', text }) } catch { /* User cancelled share. */ } }
    else if (navigator.clipboard) { await navigator.clipboard.writeText(text); window.alert('Result copied! Share it with your team.') }
    else window.alert(text)
  }
  const startGame = () => { setScreen('game'); setPhase('idle'); beep(520, 0.1) }

  return <main className="page-shell">
    <div className="stars" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>♡</i><i>✧</i><i>✦</i><i>♡</i><i>✧</i></div>
    <header className="topbar"><div className="mini-logo"><span className="logo-heart">♥</span> 20/10 <span>PIXEL ARCADE</span></div>
      <button className="sound-button" aria-label={sound ? 'Mute sound' : 'Enable sound'} onClick={() => setSound(v => !v)}>{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}<span>SOUND {sound ? 'ON' : 'OFF'}</span></button>
    </header>

    {screen === 'start' && <section className="start-screen">
      <div className="eyebrow"><Sparkles size={14}/> A LITTLE DIGITAL GIFT FOR YOU <Sparkles size={14}/></div>
      <h1>HAPPY<br/><span>WOMEN'S</span><br/>DAY!</h1>
      <p className="lead">Ready to grab some happiness?</p>
      <div className="hero-machine">
        <svg viewBox="0 0 600 430" role="img" aria-label="Pixel art claw machine full of gifts">
          <defs><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#48e5ff" stopOpacity=".16"/><stop offset="1" stopColor="#ff4fa3" stopOpacity=".1"/></linearGradient></defs>
          <rect x="62" y="22" width="476" height="365" fill="#ff4fa3" stroke="#ffd5eb" strokeWidth="6"/>
          <rect x="76" y="36" width="448" height="336" fill="#21183f" stroke="#48e5ff" strokeWidth="4"/>
          <rect x="88" y="48" width="424" height="307" fill="url(#glass)"/>
          <rect x="88" y="65" width="424" height="8" fill="#48e5ff"/>
          <line x1="300" y1="73" x2="300" y2="112" stroke="#ffd166" strokeWidth="5"/>
          <rect x="280" y="108" width="40" height="24" fill="#ff4fa3" stroke="#fff4f8" strokeWidth="3"/>
          <path d="M285 130 L270 150 L274 164 M315 130 L330 150 L326 164" fill="none" stroke="#48e5ff" strokeWidth="7"/>
          {['🧁','💐','💗','🎁','💎','🧋','☁️','👑'].map((g,i)=><text key={i} x={125+(i%4)*112} y={235+Math.floor(i/4)*84} fontSize="40" textAnchor="middle" className="hero-gift" style={{animationDelay:`${i*.13}s`}}>{g}</text>)}
          <rect x="76" y="372" width="448" height="20" fill="#ffd166"/>
          <rect x="100" y="393" width="400" height="25" fill="#ff4fa3"/>
          <rect x="130" y="399" width="70" height="8" fill="#fff4f8"/><rect x="400" y="399" width="70" height="8" fill="#fff4f8"/>
          <circle cx="300" cy="405" r="8" fill="#48e5ff"/>
        </svg>
      </div>
      <button className="primary-button" onClick={startGame}><span className="coin">★</span> INSERT COIN <span className="button-arrow">→</span></button>
      <p className="fineprint">NO COINS NEEDED · JUST GOOD VIBES</p>
    </section>}

    {screen !== 'start' && <section className="game-screen">
      <div className="game-heading"><div><span className="eyebrow-small">LUCKY GIFT MACHINE</span><h2>Grab your <em>happiness!</em></h2></div><div className="play-counter"><span>PLAYS</span><b>{String(plays).padStart(2,'0')}</b></div></div>
      <div className="machine-frame">
        <div className="machine-top"><span className="machine-light"/><span>♥ HAPPY DAY ♥</span><span className="machine-light"/></div>
        <svg className="machine-svg" viewBox="0 0 600 500" role="img" aria-label="Interactive claw machine. Move the claw over a gift and press grab.">
          <defs><linearGradient id="cabinetGlass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#48e5ff" stopOpacity=".13"/><stop offset=".5" stopColor="#39245f" stopOpacity=".04"/><stop offset="1" stopColor="#ff4fa3" stopOpacity=".13"/></linearGradient></defs>
          <rect x="25" y="16" width="550" height="466" fill="#0e0b20" stroke="#ff4fa3" strokeWidth="8"/>
          <rect x="37" y="28" width="526" height="440" fill="#21183f" stroke="#48e5ff" strokeWidth="4"/>
          <rect x="48" y="40" width="504" height="405" fill="url(#cabinetGlass)"/>
          <path d="M55 42 L180 42 L55 190 Z" fill="#fff" opacity=".035"/>
          <rect x="50" y="75" width="500" height="9" fill="#48e5ff"/>
          <rect x="50" y="84" width="500" height="5" fill="#fff4f8" opacity=".6"/>
          {Array.from({length:12},(_,i)=><circle key={i} cx={75+i*40} cy={53+(i%2)*15} r="2.5" fill={i%2?'#ff4fa3':'#ffd166'}/>)}
          {toys.map(toy=><GiftSprite key={toy.id} toy={toy}/>)}
          <Claw x={clawX} y={clawY} closed={closed} carrying={carrying}/>
          <rect x="50" y="445" width="500" height="16" fill="#ffd166" stroke="#fff4f8" strokeWidth="2"/>
          <rect x="50" y="461" width="500" height="7" fill="#ff4fa3"/>
          <rect x="218" y="436" width="164" height="28" fill="#17152e" stroke="#48e5ff" strokeWidth="3"/>
          <text x="300" y="455" fill="#fff4f8" fontSize="11" textAnchor="middle" fontWeight="bold">PRIZE CHUTE</text>
        </svg>
        <div className="machine-base"><div className="base-screen">★ GOOD LUCK ★</div><div className="base-speaker"><i/><i/><i/><i/><i/><i/></div></div>
      </div>
      <div className="status-line" aria-live="polite">{phase === 'idle' ? '← MOVE THE CLAW OVER A GIFT →' : phase === 'moving' ? 'MOVING...' : phase === 'descending' ? 'LOWERING CLAW...' : phase === 'grabbing' ? 'GRAB IT!' : phase === 'lifting' ? 'PULLING UP...' : phase === 'dropping' ? 'DELIVERING YOUR GIFT...' : miss ? 'OOPS! MISSED IT — TRY AGAIN!' : reward ? 'GIFT UNLOCKED!' : 'READY!'}</div>
      <div className="controls">
        <button className="move-button" aria-label="Move claw left" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);startHold(-14)}} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold} onContextMenu={e=>e.preventDefault()} disabled={phase!=='idle'&&phase!=='moving'}><ArrowLeft size={22}/><span>LEFT</span></button>
        <button className="grab-button" onClick={()=>void grab()} disabled={phase!=='idle'&&phase!=='moving'}><Gift size={21}/><span>GRAB!</span></button>
        <button className="move-button" aria-label="Move claw right" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);startHold(14)}} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold} onContextMenu={e=>e.preventDefault()} disabled={phase!=='idle'&&phase!=='moving'}><span>RIGHT</span><ArrowRight size={22}/></button>
      </div>
      <p className="instruction">HOLD ◀ ▶ TO MOVE · LINE UP WITH A GIFT · TAP GRAB!</p>
      <p className="team-wish">A little luck, a lot of love. <span>Happy 20/10!</span></p>
    </section>}

    {screen === 'end' && <section className="end-screen"><div className="end-crown">👑</div><div className="eyebrow">A MESSAGE FOR YOU</div><h2>HAPPY <span>20/10!</span></h2><p>Chúc tất cả chị em luôn tự tin, rực rỡ, hạnh phúc và luôn có những điều tốt đẹp đang chờ phía trước.</p><p className="end-english">Thanks for playing.<br/><strong>You are all legendary!</strong></p><button className="primary-button" onClick={()=>{playAgain();setScreen('game')}}><RotateCcw size={18}/> PLAY AGAIN</button></section>}

    {screen === 'game' && phase === 'reveal' && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className={`reward-modal rarity-${(reward?.rarity ?? 'common').toLowerCase()}`}>
        <div className="modal-sparkles" aria-hidden="true">✦　✧　✦　✧　✦</div>
        <div className="reward-stamp">{miss ? 'TRY AGAIN!' : reward?.rarity === 'LEGENDARY' ? '★ JACKPOT ★' : 'YOU GOT A GIFT!'}</div>
        {miss ? <div className="reward-emoji miss-emoji">♡</div> : <div className="reward-emoji">{reward?.emoji}</div>}
        <h2 id="reward-title">{miss ? 'Almost!' : reward?.name}</h2>
        <span className="rarity-label">{miss ? 'NO PRIZE THIS TIME' : reward?.rarity}</span>
        <p>{miss ? 'The claw slipped! Line up with a gift and give it another try.' : reward?.message}</p>
        <div className="modal-actions"><button className="primary-button" onClick={playAgain}><RotateCcw size={17}/> PLAY AGAIN</button><button className="share-button" onClick={()=>void share()}><Share2 size={17}/> SHARE</button></div>
        <button className="end-link" onClick={()=>setScreen('end')}>FINISH & READ OUR WISH ♥</button>
      </div>
    </div>}

    <footer className="footer"><span>MADE WITH ♥ FOR THE AMAZING WOMEN</span><span>EST. 20/10 · {validateRewardWeights() ? 'LUCK SYSTEM ONLINE' : 'CHECK REWARD CONFIG'}</span></footer>
  </main>
}

export default App