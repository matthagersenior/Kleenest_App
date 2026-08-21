export const BUSINESS_PLANS=Object.freeze({
 standard:Object.freeze({key:'standard',label:'Standard',locationLimit:null,features:['profile','locations','reviews','basic_analytics','qr','campaigns','promotions','events','contests']}),
 growth:Object.freeze({key:'growth',label:'Growth',locationLimit:5,features:['profile','locations','reviews','basic_analytics','qr','campaigns','promotions','events','contests','advanced_analytics','engagement_attribution','network_intelligence','customer_segments','growth_signals']}),
 enterprise:Object.freeze({key:'enterprise',label:'Enterprise',locationLimit:null,features:['profile','locations','reviews','basic_analytics','qr','campaigns','promotions','events','contests','advanced_analytics','engagement_attribution','network_intelligence','customer_segments','growth_signals','multi_location','priority_support','enterprise_analytics','custom_engagement']})
});
export function normalizeBusinessPlan(value){const key=String(value||'standard').toLowerCase();return BUSINESS_PLANS[key]||BUSINESS_PLANS.standard;}
export function hasBusinessFeature(plan,feature){return normalizeBusinessPlan(plan).features.includes(feature);}
export function requireBusinessFeature(plan,feature){const normalized=normalizeBusinessPlan(plan);if(!normalized.features.includes(feature)){const error=new Error(`${normalized.label} plan does not include ${feature}.`);error.code='FEATURE_NOT_ENTITLED';error.feature=feature;error.plan=normalized.key;throw error;}return true;}
export function businessPlanSummary(plan){const normalized=normalizeBusinessPlan(plan);return{key:normalized.key,label:normalized.label,locationLimit:normalized.locationLimit,features:[...normalized.features]};}
