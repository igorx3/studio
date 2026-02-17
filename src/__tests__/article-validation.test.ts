import { describe, it, expect } from 'vitest';
import { validateArticlePricing, type ArticlePricingData } from '@/lib/validation/article-validation';

describe('validateArticlePricing', () => {

  // 1. dropshipping OFF + precios vacíos → OK
  it('permite crear producto sin precios cuando dropshipping está desactivado', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: false,
      cost: undefined,
      minSalePrice: undefined,
      normalPrice: undefined,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // 2. dropshipping ON + falta mínimo → ERROR
  it('rechaza cuando dropshipping ON y falta precio mínimo', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: true,
      cost: 100,
      minSalePrice: undefined,
      normalPrice: 500,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'minSalePrice' && e.code === 'REQUIRED_FIELD')).toBe(true);
  });

  // 3. dropshipping ON + falta tarifa normal → ERROR
  it('rechaza cuando dropshipping ON y falta tarifa normal', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: true,
      cost: 100,
      minSalePrice: 200,
      normalPrice: undefined,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'normalPrice' && e.code === 'REQUIRED_FIELD')).toBe(true);
  });

  // 4. dropshipping ON + mínimo = tarifa normal → OK
  it('permite precio mínimo igual a tarifa normal', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: true,
      cost: 100,
      minSalePrice: 500,
      normalPrice: 500,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // 5. dropshipping ON + mínimo > tarifa normal → ERROR
  it('rechaza cuando precio mínimo es mayor que tarifa normal', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: true,
      cost: 100,
      minSalePrice: 600,
      normalPrice: 500,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'minSalePrice' && e.code === 'INVALID_PRICE_RANGE')).toBe(true);
  });

  // 6. Valores negativos → ERROR
  it('rechaza valores negativos en cualquier precio', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: false,
      cost: -10,
      minSalePrice: -5,
      normalPrice: -1,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(false);
    expect(result.errors.filter(e => e.code === 'NEGATIVE_VALUE')).toHaveLength(3);
  });

  // 7. dropshipping OFF con precios válidos → OK (no borra valores)
  it('permite precios válidos cuando dropshipping está desactivado', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: false,
      cost: 100,
      minSalePrice: 200,
      normalPrice: 300,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // 8. dropshipping ON + mínimo < normal (caso estándar) → OK
  it('permite precio mínimo menor que tarifa normal con dropshipping ON', () => {
    const data: ArticlePricingData = {
      dropshippingEnabled: true,
      cost: 50,
      minSalePrice: 200,
      normalPrice: 350,
    };
    const result = validateArticlePricing(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

});
