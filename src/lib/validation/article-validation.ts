/**
 * Validación compartida para artículos de inventario.
 * Puede usarse tanto en frontend (pre-submit) como en backend (Cloud Functions / Security Rules).
 */

export interface ArticlePricingData {
  dropshippingEnabled: boolean;
  cost?: number | null;
  minSalePrice?: number | null;
  normalPrice?: number | null;
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateArticlePricing(data: ArticlePricingData): ValidationResult {
  const errors: ValidationError[] = [];

  // Valores negativos nunca permitidos
  if (data.cost != null && data.cost < 0) {
    errors.push({ code: 'NEGATIVE_VALUE', field: 'cost', message: 'El costo no puede ser negativo.' });
  }
  if (data.minSalePrice != null && data.minSalePrice < 0) {
    errors.push({ code: 'NEGATIVE_VALUE', field: 'minSalePrice', message: 'El precio mínimo no puede ser negativo.' });
  }
  if (data.normalPrice != null && data.normalPrice < 0) {
    errors.push({ code: 'NEGATIVE_VALUE', field: 'normalPrice', message: 'La tarifa normal no puede ser negativa.' });
  }

  // Dropshipping ON: precios obligatorios
  if (data.dropshippingEnabled) {
    if (data.minSalePrice == null || data.minSalePrice === undefined) {
      errors.push({
        code: 'REQUIRED_FIELD',
        field: 'minSalePrice',
        message: 'El precio mínimo de venta es obligatorio cuando dropshipping está habilitado.',
      });
    }
    if (data.normalPrice == null || data.normalPrice === undefined) {
      errors.push({
        code: 'REQUIRED_FIELD',
        field: 'normalPrice',
        message: 'La tarifa normal es obligatoria cuando dropshipping está habilitado.',
      });
    }
  }

  // minSalePrice <= normalPrice (permite igualdad, bloquea si mínimo > normal)
  if (data.minSalePrice != null && data.normalPrice != null && data.minSalePrice > data.normalPrice) {
    errors.push({
      code: 'INVALID_PRICE_RANGE',
      field: 'minSalePrice',
      message: 'El precio mínimo no puede ser mayor que la tarifa normal.',
    });
  }

  return { valid: errors.length === 0, errors };
}
