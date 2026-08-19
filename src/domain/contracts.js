export const ACCOUNT_TYPES = Object.freeze({ consumer: 'consumer', business: 'business', admin: 'admin' });
export const PLACE_CATEGORIES = Object.freeze(['restaurant','cafe','gas_station','shopping','park','service','restroom','health','public_safety']);
export const BUSINESS_FEATURES = Object.freeze(['profile','locations','reviews','promotions','campaigns','contests','events','qr','analytics']);
export const QR_SCOPES = Object.freeze({checkin:'checkin',reward:'reward',contest:'contest'});

export function normalizePlace(place){
  if(!place)return null;
  return {
    id:String(place.id),location_id:place.location_id?String(place.location_id):null,name:place.name??'Unnamed place',category:place.category??'service',rating:Number(place.rating??0),reviews:Number(place.review_count??place.reviews??0),distance:place.distance??null,distance_miles:place.distance_miles??null,distance_km:place.distance_km??null,latitude:place.latitude??null,longitude:place.longitude??null,description:place.description??'',address:place.address??[place.city,place.state,place.postal_code].filter(Boolean).join(', '),verified:Boolean(place.is_verified),cleanliness:place.cleanliness??null,cleanliness_pct:place.cleanliness_pct==null?null:Number(place.cleanliness_pct),accessible:Boolean(place.accessible),changing_table:Boolean(place.changing_table),smart_bathroom:Boolean(place.smart_bathroom),bathroom_verification_status:place.bathroom_verification_status??null,bathroom_verification_count:Number(place.bathroom_verification_count??0),bathroom_positive_count:Number(place.bathroom_positive_count??0),bathroom_negative_count:Number(place.bathroom_negative_count??0),source:place.source??null,source_dataset:place.source_dataset??null,freshness:place.updated_at??place.created_at??null,
  };
}

export function cleanlinessLabel(place){
  if(place?.cleanliness_pct!=null){if(place.cleanliness_pct>=85)return 'Excellent';if(place.cleanliness_pct>=70)return 'Good';if(place.cleanliness_pct>=50)return 'Fair';return 'Needs attention';}
  return place?.cleanliness || 'Not rated';
}
export function verificationLabel(place){
  if(place?.bathroom_verification_status==='verified' || place?.verified)return 'Verified';
  if((place?.bathroom_verification_count??0)>0)return 'Community checked';
  if(place?.bathroom_verification_status==='has_bathroom')return 'Bathroom reported';
  return 'Unverified';
}
export function restroomSignal(place){
  const cleanliness=place?.cleanliness_pct==null?50:place.cleanliness_pct;
  const verification=Math.min(20,(place?.bathroom_verification_count??0)*2);
  const rating=(place?.rating??0)*4;
  return Math.round(Math.min(100,cleanliness*.7+verification+rating));
}
