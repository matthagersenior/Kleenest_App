import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,Brain,Clock3,Gamepad2,RotateCcw,Trophy,Zap} from 'lucide-react';
import {Link} from 'react-router-dom';
import FeatureNavLinks from '../components/FeatureNavLinks';
import {useAuth} from '../context/AuthContext';

const games=[
 {id:'tap',title:'Clean Sweep',tag:'30 seconds',icon:Zap,description:'Tap the clean tiles. Build a streak before time runs out.',color:'sun'},
 {id:'memory',title:'Bathroom Memory',tag:'Quick match',icon:Brain,description:'Match the amenity pairs. A tiny brain break for the bathroom.',color:'mint'},
 {id:'quiz',title:'Kleenest Quick Quiz',tag:'5 questions',icon:Trophy,description:'Test your knowledge of places, amenities and community trust.',color:'sky'}
];

export default function GamesPage(){
 const{authenticated}=useAuth(); const [active,setActive]=useState(null); const [score,setScore]=useState(0); const [round,setRound]=useState(0); const [message,setMessage]=useState('Pick a quick game.');
 const numbers=useMemo(()=>Array.from({length:12},(_,i)=>i),[]);
 useEffect(()=>{if(!active){setScore(0);setRound(0)}},[active]);
 function tap(){const hit=Math.random()>.35; setRound(r=>r+1); if(hit){setScore(s=>s+10);setMessage('Nice! +10');}else setMessage('Miss! Keep going.');}
 function memory(){setRound(r=>r+1);setScore(s=>s+5);setMessage('Match found! +5');}
 function quiz(){setRound(r=>r+1);setScore(s=>s+15);setMessage('Correct! +15');}
 if(!authenticated)return <section className="page"><Link className="back-link" to="/profile"><ArrowLeft size={16}/>Back to profile</Link><div className="empty-state"><h2>Sign in to play</h2><p>Your scores and streaks are tied to your Kleenest profile.</p><Link className="primary" to="/profile">Sign in</Link></div></section>;
 return <section className="page games-page"><Link className="back-link" to="/rewards"><ArrowLeft size={16}/>Back to rewards</Link><div className="page-header"><div><span className="eyebrow">KLEENEST PLAY</span><h1>Something fun while you're here</h1><p>Small, free games designed for a quick bathroom break. No ads required. Just play.</p></div><div className="reward-stats"><div><Gamepad2/><strong>{score}</strong><span>score</span></div><div><Zap/><strong>{round}</strong><span>moves</span></div></div></div><FeatureNavLinks/><div className="game-grid">{games.map(g=>{const Icon=g.icon;return <button className={`game-card game-${g.color} ${active===g.id?'selected':''}`} key={g.id} onClick={()=>{setActive(g.id);setMessage('Ready!')}}><span className="game-icon"><Icon/></span><span><b>{g.title}</b><small>{g.tag}</small><em>{g.description}</em></span></button>})}</div>{active&&<section className="detail-panel game-board"><div className="panel-heading"><div><span className="eyebrow">NOW PLAYING</span><h2>{games.find(g=>g.id===active)?.title}</h2></div><Clock3 size={24}/></div><p className="game-message">{message}</p>{active==='tap'&&<div className="tap-board">{numbers.map(n=><button key={n} onClick={tap} aria-label={`tile ${n+1}`}>{Math.random()>.72?'✓':'·'}</button>)}</div>}{active==='memory'&&<div className="memory-board">{numbers.slice(0,8).map(n=><button key={n} onClick={memory}>{['WC','♨','★','♧','WC','♨','★','♧'][n]}</button>)}</div>}{active==='quiz'&&<div className="quiz-board"><h3>Which action builds the strongest community signal?</h3>{['A verified check-in','A random tap','Skipping the location details'].map((x,i)=><button key={x} onClick={()=>{if(i===0){setScore(s=>s+15);setMessage('Correct! +15')}else setMessage('Try again.')}}>{x}</button>)}</div>}<button className="secondary" onClick={()=>{setActive(null);setMessage('Pick a quick game.')}}><RotateCcw size={16}/>Choose another</button></section>}</section>
}
