import {useEffect,useState} from 'react';
import {CheckCircle2,X} from 'lucide-react';

function rewardFromDetail(detail={}){
  const transactions=Array.isArray(detail.transactions)?detail.transactions:[];
  const latest=transactions[0]||{};
  return {
    points:Number(detail.points??detail.points_awarded??latest.points??0),
    reason:String(detail.reason??latest.reason??'reward').replaceAll('_',' '),
  };
}

export default function RewardNotificationBridge(){
  const[note,setNote]=useState(null);
  useEffect(()=>{
    const onReward=e=>{
      const next=rewardFromDetail(e?.detail);
      if(next.points<=0)return;
      setNote(next);
      window.clearTimeout(window.__kleenestRewardToast);
      window.__kleenestRewardToast=window.setTimeout(()=>setNote(null),4500);
    };
    const events=['kleenest:rewards-updated','kleenest:checkin-rewards-updated','kleenest:review-rewards-updated','kleenest:promotion-rewards-updated','kleenest:reward-earned'];
    events.forEach(name=>window.addEventListener(name,onReward));
    return()=>{events.forEach(name=>window.removeEventListener(name,onReward));window.clearTimeout(window.__kleenestRewardToast)};
  },[]);
  if(!note)return null;
  return <div className="reward-toast" role="status"><CheckCircle2 size={20}/><div><strong>Reward earned</strong><span>+{note.points} points · {note.reason}</span></div><button className="icon-button" onClick={()=>setNote(null)} aria-label="Dismiss"><X size={16}/></button></div>;
}
