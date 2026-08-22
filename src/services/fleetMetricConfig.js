import { supabase } from '../lib/supabase';

async function rpc(name, args = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to continue.');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export const getFleetMetricConfiguration = businessId => rpc('get_fleet_metric_configuration', { p_business_id: businessId });

export const createFleetMetricDefinition = (businessId, definition) => rpc('create_fleet_metric_definition', {
  p_business_id: businessId,
  p_metric_key: definition.metricKey,
  p_feature_code: definition.featureCode,
  p_name: definition.name,
  p_description: definition.description || null,
  p_unit: definition.unit || null,
  p_source_dataset: definition.sourceDataset,
  p_source_metric: definition.sourceMetric,
  p_aggregation: definition.aggregation,
  p_direction: definition.direction,
  p_scoring_method: definition.scoringMethod,
  p_goal: definition.goal === '' ? null : Number(definition.goal),
  p_threshold: definition.threshold === '' ? null : Number(definition.threshold),
  p_max_score: Number(definition.maxScore || 100),
  p_scoring_config: definition.scoringConfig || {},
  p_period: definition.period,
});

export const updateFleetMetricDefinition = (metricDefinitionId, definition) => rpc('update_fleet_metric_definition', {
  p_metric_definition_id: metricDefinitionId,
  p_name: definition.name,
  p_description: definition.description,
  p_goal: definition.goal === '' ? null : Number(definition.goal),
  p_threshold: definition.threshold === '' ? null : Number(definition.threshold),
  p_max_score: definition.maxScore === '' ? null : Number(definition.maxScore),
  p_scoring_method: definition.scoringMethod,
  p_scoring_config: definition.scoringConfig || {},
  p_period: definition.period,
  p_active: definition.active,
});

export const assignFleetMetric = (metricDefinitionId, targetType, targetId = null) => rpc('assign_fleet_metric', {
  p_metric_definition_id: metricDefinitionId,
  p_target_type: targetType,
  p_target_id: targetType === 'fleet' ? null : targetId,
});
