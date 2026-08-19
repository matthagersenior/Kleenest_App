import {describe,it,expect} from 'vitest';
import {normalizeBusinessPlan} from '../domain/entitlements';
describe('business performance contracts',()=>{it('normalizes business plans',()=>{expect(normalizeBusinessPlan('growth').key).toBe('growth');expect(normalizeBusinessPlan('unknown').key).toBe('standard')})})
