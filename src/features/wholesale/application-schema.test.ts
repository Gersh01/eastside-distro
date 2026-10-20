import { describe, expect, it } from 'vitest';
import { formDataToValues } from '@/lib/form';
import { WHOLESALE_ARRAY_FIELDS, wholesaleApplicationSchema } from './application-schema';

const valid = {
  fullName: 'Jordan Rivera',
  phone: '(407) 555-0123',
  email: ' Jordan@Example.com ',
  titleRole: 'Owner',
  businessName: 'Lagoon Kava Bar',
  addressLine1: '100 Main St',
  addressLine2: '',
  city: 'Orlando',
  state: 'FL',
  postalCode: '32807',
  resaleCertificateNumber: '',
  businessTypes: ['kava_bar'],
  businessTypeOther: '',
  numberOfLocations: '2',
  yearsInBusiness: '',
  currentSuppliers: '',
  productsOfInterest: ['bulk_kava', 'canned_beverages'],
  productsOfInterestOther: '',
  productNotes: '',
  orderFrequency: 'monthly',
  orderFrequencyOther: '',
  estimatedOrderVolume: '10 cases',
  fulfillmentPreferences: ['warehouse_pickup'],
  goals: [],
  goalsOther: '',
  nextSteps: ['send_pricing'],
  nextStepsOther: '',
  attestation: 'on',
};

describe('wholesaleApplicationSchema', () => {
  it('accepts a complete application and normalizes values', () => {
    const result = wholesaleApplicationSchema.parse(valid);
    expect(result.email).toBe('jordan@example.com');
    expect(result.numberOfLocations).toBe(2);
    expect(result.yearsInBusiness).toBeUndefined();
    expect(result.addressLine2).toBeUndefined();
  });

  it('requires at least one business type and product of interest', () => {
    const result = wholesaleApplicationSchema.safeParse({
      ...valid,
      businessTypes: [],
      productsOfInterest: [],
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['businessTypes', 'productsOfInterest']));
  });

  it('requires details when "Other" is chosen', () => {
    const result = wholesaleApplicationSchema.safeParse({
      ...valid,
      businessTypes: ['other'],
      orderFrequency: 'other',
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['businessTypeOther', 'orderFrequencyOther']));
  });

  it('rejects unknown option values, bad ZIP codes and a missing attestation', () => {
    const result = wholesaleApplicationSchema.safeParse({
      ...valid,
      businessTypes: ['casino'],
      postalCode: '3280',
      attestation: undefined,
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['businessTypes.0', 'postalCode', 'attestation']));
  });

  it('parses real FormData with repeated checkbox keys', () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(valid)) {
      for (const item of Array.isArray(value) ? value : [value]) formData.append(key, item);
    }
    formData.append('productsOfInterest', 'extracts_shots');
    const values = formDataToValues(formData, WHOLESALE_ARRAY_FIELDS);
    const result = wholesaleApplicationSchema.parse(values);
    expect(result.productsOfInterest).toEqual(['bulk_kava', 'canned_beverages', 'extracts_shots']);
    expect(result.goals).toEqual([]);
  });
});
