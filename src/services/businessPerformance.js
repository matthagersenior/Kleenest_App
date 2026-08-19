import { getAnalytics, getLocationIntelligence, getReviewAnalytics } from './business';

export async function getBusinessPerformance(businessId) {
  const [analytics, intelligence, reviews] = await Promise.all([
    getAnalytics(businessId),
    getLocationIntelligence(businessId),
    getReviewAnalytics(businessId),
  ]);
  const rows = Array.isArray(intelligence) ? intelligence : [];
  const total = key => rows.reduce((sum, row) => sum + Number(row?.[key] || 0), 0);
  return {
    analytics: analytics || {},
    intelligence: rows,
    reviews: reviews || {},
    totals: {
      searches: total('searches'),
      views: total('views'),
      directions: total('directions'),
      arrivals: total('arrivals'),
      checkIns: total('check_ins'),
      reviews: total('reviews'),
    },
    locationsWithConflicts: rows.filter(row => row?.has_recent_conflict).length,
    freshLocations: rows.filter(row => row?.is_fresh).length,
  };
}

export function performanceSummary(performance) {
  if (!performance) return [];
  const t = performance.totals || {};
  return [
    { key: 'demand', label: 'Demand', value: t.searches || 0, detail: `${t.views || 0} location views` },
    { key: 'intent', label: 'Intent', value: t.directions || 0, detail: `${t.arrivals || 0} arrivals` },
    { key: 'community', label: 'Community', value: t.checkIns || 0, detail: `${t.reviews || 0} reviews` },
    { key: 'freshness', label: 'Fresh locations', value: performance.freshLocations || 0, detail: `${performance.locationsWithConflicts || 0} with conflicting reports` },
  ];
}

export function locationPerformance(row) {
  const searches = Number(row?.searches || 0);
  const views = Number(row?.views || 0);
  const directions = Number(row?.directions || 0);
  const arrivals = Number(row?.arrivals || 0);
  const checkIns = Number(row?.check_ins || 0);
  return {
    demand: searches,
    viewRate: searches ? Math.round((views / searches) * 100) : 0,
    intentRate: views ? Math.round((directions / views) * 100) : 0,
    arrivalRate: directions ? Math.round((arrivals / directions) * 100) : 0,
    communityActivity: checkIns + Number(row?.reviews || 0),
    conflict: Boolean(row?.has_recent_conflict),
    fresh: Boolean(row?.is_fresh),
  };
}
