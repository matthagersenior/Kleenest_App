import { supabase } from '../lib/supabase';
import { buildNotificationCandidates } from './intelligenceNotifications';

async function requireUser(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const { data:{ user }, error } = await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error('Sign in to manage notifications.');
  return user;
}

export async function listIntelligenceNotifications(limit=50){
  await requireUser();
  const { data, error } = await supabase.rpc('user_notifications',{p_limit:limit});
  if(error) throw error;
  return data || [];
}

export async function markIntelligenceNotificationRead(notificationId){
  await requireUser();
  const { data, error } = await supabase.rpc('mark_notification_read',{p_notification_id:notificationId});
  if(error) throw error;
  return Boolean(data);
}

export async function persistIntelligenceCandidates(rows=[],{surface='business',existingNotifications=[],now=Date.now()}={}){
  const user=await requireUser();
  const candidates=buildNotificationCandidates(rows,{surface,existingNotifications,now});
  const created=[];
  for(const candidate of candidates){
    const { data, error } = await supabase.rpc('create_intelligence_notification',{
      p_user_id:user.id,
      p_location_id:candidate.location_id,
      p_surface:candidate.surface,
      p_type:candidate.type,
      p_dedupe_key:candidate.dedupe_key,
      p_title:candidate.title,
      p_body:candidate.body,
      p_data:{ reasons:candidate.reasons, signals:candidate.signals },
      p_cooldown_minutes:candidate.cooldown_minutes,
    });
    if(error) throw error;
    if(data) created.push(data);
  }
  return created;
}

export async function queueIntelligenceNotificationJobs(){
  if(!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.rpc('queue_intelligence_notification_jobs');
  if(error) throw error;
  return true;
}
