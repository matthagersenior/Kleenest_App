import { useEffect, useState } from 'react';
import './NetworkEventToast.css';

export default function NetworkEventToast(){
  const [items,setItems]=useState([]);
  useEffect(()=>{
    const add=(kind,detail)=>setItems(v=>[{id:crypto.randomUUID(),kind,title:detail?.title||(kind==='notification'?'New Kleenest notification':'Network activity'),body:detail?.body||detail?.message||detail?.description||'New activity was detected nearby.'},...v].slice(0,3));
    const onNotification=e=>add('notification',e.detail);
    const onEvent=e=>add('network',e.detail);
    window.addEventListener('kleenest:notification',onNotification);
    window.addEventListener('kleenest:network-event',onEvent);
    return()=>{window.removeEventListener('kleenest:notification',onNotification);window.removeEventListener('kleenest:network-event',onEvent)};
  },[]);
  if(!items.length)return null;
  return <aside className="network-toast-stack" aria-live="polite">{items.map(item=><article className="network-toast" key={item.id}><div><strong>{item.title}</strong><p>{item.body}</p></div><button className="icon-button" onClick={()=>setItems(v=>v.filter(x=>x.id!==item.id))} aria-label="Dismiss">×</button></article>)}</aside>;
}
