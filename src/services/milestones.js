import { supabase } from '../lib/supabase';

export async function getContributorMilestones(){
  if(!supabase)throw new Error('Supabase is not configured.');
  const{data:{user},error:userError}=await supabase.auth.getUser();
  if(userError)throw userError;if(!user)throw new Error('Sign in to continue.');
  const{data,error}=await supabase.rpc('refresh_contributor_milestones',{p_user_id:user.id});
  if(error)throw error;return data??[];
}

export const MILESTONE_COPY={
 first_observation:['First observation','Submit your first location observation.'],
 five_observations:['Five observations','Submit five observations.'],
 first_verified_checkin:['First verified check-in','Complete your first verified check-in.'],
 five_verified_checkins:['Five verified check-ins','Complete five verified check-ins.'],
 trusted_contributor:['Trusted contributor','Reach 8 observations and 4 verified check-ins.'],
 verified_contributor:['Verified contributor','Reach 20 observations and 10 verified check-ins.'],
};
