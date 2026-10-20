import { optionValues, type Option } from '@/lib/options';

// Answer choices from the paper onboarding sheet (docs/reference/wholesale-form.png).
// Values are stored in the database: add new options freely, but never rename a value.

export const BUSINESS_TYPES = [
  { value: 'kava_bar', label: 'Kava Bar' },
  { value: 'smoke_vape_shop', label: 'Smoke/Vape Shop' },
  { value: 'retail_store', label: 'Retail Store' },
  { value: 'online_store', label: 'Online Store' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'restaurant_cafe', label: 'Restaurant / Cafe' },
  { value: 'wellness_health_store', label: 'Wellness / Health Store' },
  { value: 'hotel_hospitality', label: 'Hotel / Hospitality' },
  { value: 'brand_owner', label: 'Brand Owner' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[];

export const PRODUCTS_OF_INTEREST = [
  { value: 'bulk_kava', label: 'Bulk Kava (25kg)' },
  { value: 'kava_powder_retail', label: 'Kava Powder (Retail)' },
  { value: 'whole_crushed_leaf', label: 'Whole Leaf / Crushed Leaf' },
  { value: 'kratom_powder_leaf', label: 'Kratom (Powder/Leaf)' },
  { value: 'canned_beverages', label: 'Canned Beverages' },
  { value: 'extracts_shots', label: 'Extracts / Shots' },
  { value: 'accessories_merchandise', label: 'Accessories / Merchandise' },
  { value: 'private_label', label: 'Private Label / Custom' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[];

export const ORDER_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[];

export const FULFILLMENT_METHODS = [
  { value: 'warehouse_pickup', label: 'Warehouse Pickup (Orlando, FL)' },
  { value: 'shipping', label: 'Shipping' },
] as const satisfies readonly Option[];

export const GOALS = [
  { value: 'product_pricing', label: 'Product Pricing' },
  { value: 'new_location', label: 'Opening a New Location' },
  { value: 'expand_locations', label: 'Expand Current Locations' },
  { value: 'try_new_products', label: 'Try New Products / Samples' },
  { value: 'private_label', label: 'Private Label' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[];

export const NEXT_STEPS = [
  { value: 'send_catalog', label: 'Send Wholesale Catalog' },
  { value: 'send_pricing', label: 'Send Pricing' },
  { value: 'follow_up', label: 'Follow Up Call / Email' },
  { value: 'schedule_meeting', label: 'Schedule a Meeting' },
  { value: 'request_samples', label: 'Request Samples (if available)' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[];

export const BUSINESS_TYPE_VALUES = optionValues(BUSINESS_TYPES);
export const PRODUCT_OF_INTEREST_VALUES = optionValues(PRODUCTS_OF_INTEREST);
export const ORDER_FREQUENCY_VALUES = optionValues(ORDER_FREQUENCIES);
export const FULFILLMENT_METHOD_VALUES = optionValues(FULFILLMENT_METHODS);
export const GOAL_VALUES = optionValues(GOALS);
export const NEXT_STEP_VALUES = optionValues(NEXT_STEPS);
