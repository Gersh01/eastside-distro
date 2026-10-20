'use client';

import { useActionState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import {
  Checkbox,
  ChoiceGroup,
  Honeypot,
  SelectField,
  TextArea,
  TextField,
} from '@/components/ui/form-fields';
import { FormSection } from '@/components/ui/form-section';
import { FormStatus } from '@/components/ui/form-status';
import { US_STATES } from '@/domain/us-states';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '@/lib/form';
import { submitWholesaleApplication } from '../actions';
import {
  BUSINESS_TYPES,
  FULFILLMENT_METHODS,
  GOALS,
  NEXT_STEPS,
  ORDER_FREQUENCIES,
  PRODUCTS_OF_INTEREST,
} from '../options';

const STATE_OPTIONS = US_STATES.map((state) => ({ value: state.code, label: state.name }));

/** The Wholesale Customer Onboarding Sheet, sections 1–9, as a web form. */
export function WholesaleApplicationForm() {
  const [state, formAction, pending] = useActionState(submitWholesaleApplication, IDLE_FORM_STATE);

  if (state.status === 'success') return <FormStatus state={state} />;

  const errors = state.status === 'error' ? state.fieldErrors : {};
  const values = state.status === 'error' ? state.values : {};
  const text = (name: string) => {
    const value = values[name];
    return typeof value === 'string' ? value : undefined;
  };
  const list = (name: string) => {
    const value = values[name];
    return Array.isArray(value) ? value : [];
  };

  return (
    <form action={formAction} className="relative flex flex-col gap-10">
      <FormStatus state={state} />
      <Honeypot name={HONEYPOT_FIELD} />

      <FormSection number="01" title="Contact information">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="fullName"
            label="Full name"
            required
            autoComplete="name"
            defaultValue={text('fullName')}
            error={errors.fullName}
          />
          <TextField
            name="titleRole"
            label="Title / role"
            autoComplete="organization-title"
            defaultValue={text('titleRole')}
            error={errors.titleRole}
          />
          <TextField
            name="phone"
            label="Phone"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={text('phone')}
            error={errors.phone}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            defaultValue={text('email')}
            error={errors.email}
          />
        </div>
      </FormSection>

      <FormSection number="02" title="Business information">
        <TextField
          name="businessName"
          label="Business name"
          required
          autoComplete="organization"
          defaultValue={text('businessName')}
          error={errors.businessName}
        />
        <TextField
          name="addressLine1"
          label="Business address"
          required
          autoComplete="address-line1"
          defaultValue={text('addressLine1')}
          error={errors.addressLine1}
        />
        <TextField
          name="addressLine2"
          label="Suite, unit, etc."
          autoComplete="address-line2"
          defaultValue={text('addressLine2')}
          error={errors.addressLine2}
        />
        <div className="grid gap-5 sm:grid-cols-[1fr_1fr_9rem]">
          <TextField
            name="city"
            label="City"
            required
            autoComplete="address-level2"
            defaultValue={text('city')}
            error={errors.city}
          />
          <SelectField
            name="state"
            label="State"
            required
            options={STATE_OPTIONS}
            autoComplete="address-level1"
            defaultValue={text('state')}
            error={errors.state}
          />
          <TextField
            name="postalCode"
            label="ZIP"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            defaultValue={text('postalCode')}
            error={errors.postalCode}
          />
        </div>
        <TextField
          name="resaleCertificateNumber"
          label="Resale / sales tax license #"
          hint="Needed for tax-exempt wholesale orders. You can add it later."
          defaultValue={text('resaleCertificateNumber')}
          error={errors.resaleCertificateNumber}
        />
      </FormSection>

      <FormSection number="03" title="Business type" description="Check all that apply.">
        <ChoiceGroup
          type="checkbox"
          name="businessTypes"
          legend="What kind of business is this?"
          required
          options={BUSINESS_TYPES}
          defaultValue={list('businessTypes')}
          error={errors.businessTypes}
        >
          <TextField
            name="businessTypeOther"
            label="Other (describe)"
            defaultValue={text('businessTypeOther')}
            error={errors.businessTypeOther}
          />
        </ChoiceGroup>
      </FormSection>

      <FormSection number="04" title="Business details">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="numberOfLocations"
            label="Number of locations"
            type="number"
            inputMode="numeric"
            defaultValue={text('numberOfLocations')}
            error={errors.numberOfLocations}
          />
          <TextField
            name="yearsInBusiness"
            label="Years in business"
            type="number"
            inputMode="numeric"
            defaultValue={text('yearsInBusiness')}
            error={errors.yearsInBusiness}
          />
        </div>
        <TextField
          name="currentSuppliers"
          label="Current suppliers (if any)"
          defaultValue={text('currentSuppliers')}
          error={errors.currentSuppliers}
        />
      </FormSection>

      <FormSection number="05" title="Products of interest" description="Check all that apply.">
        <ChoiceGroup
          type="checkbox"
          name="productsOfInterest"
          legend="What would you like to stock?"
          required
          options={PRODUCTS_OF_INTEREST}
          defaultValue={list('productsOfInterest')}
          error={errors.productsOfInterest}
        >
          <TextField
            name="productsOfInterestOther"
            label="Other (describe)"
            defaultValue={text('productsOfInterestOther')}
            error={errors.productsOfInterestOther}
          />
        </ChoiceGroup>
      </FormSection>

      <FormSection number="06" title="Additional product notes">
        <TextArea
          name="productNotes"
          label="Specific products, strains, sizes, or brands you’re interested in"
          rows={4}
          maxLength={2000}
          defaultValue={text('productNotes')}
          error={errors.productNotes}
        />
      </FormSection>

      <FormSection number="07" title="Purchase plans">
        <ChoiceGroup
          type="radio"
          name="orderFrequency"
          legend="Estimated order frequency"
          options={ORDER_FREQUENCIES}
          defaultValue={text('orderFrequency')}
          error={errors.orderFrequency}
        >
          <TextField
            name="orderFrequencyOther"
            label="Other (describe)"
            defaultValue={text('orderFrequencyOther')}
            error={errors.orderFrequencyOther}
          />
        </ChoiceGroup>
        <TextField
          name="estimatedOrderVolume"
          label="Estimated order volume"
          hint="For example: 10 cases a month, or 25 kg a quarter."
          defaultValue={text('estimatedOrderVolume')}
          error={errors.estimatedOrderVolume}
        />
        <ChoiceGroup
          type="checkbox"
          name="fulfillmentPreferences"
          legend="Preferred method"
          options={FULFILLMENT_METHODS}
          defaultValue={list('fulfillmentPreferences')}
          error={errors.fulfillmentPreferences}
        />
      </FormSection>

      <FormSection number="08" title="Goals & priorities">
        <ChoiceGroup
          type="checkbox"
          name="goals"
          legend="What are you most interested in right now?"
          options={GOALS}
          defaultValue={list('goals')}
          error={errors.goals}
        >
          <TextField
            name="goalsOther"
            label="Other (describe)"
            defaultValue={text('goalsOther')}
            error={errors.goalsOther}
          />
        </ChoiceGroup>
      </FormSection>

      <FormSection number="09" title="Next steps">
        <ChoiceGroup
          type="checkbox"
          name="nextSteps"
          legend="What would you like from us next?"
          options={NEXT_STEPS}
          defaultValue={list('nextSteps')}
          error={errors.nextSteps}
        >
          <TextField
            name="nextStepsOther"
            label="Other (describe)"
            defaultValue={text('nextStepsOther')}
            error={errors.nextStepsOther}
          />
        </ChoiceGroup>
      </FormSection>

      <div className="flex flex-col gap-6 border-t border-line pt-8 md:pl-[16.5rem]">
        <Checkbox
          name="attestation"
          required
          defaultChecked={text('attestation') === 'on'}
          error={errors.attestation}
          label="I am 21 or older and authorized to apply for wholesale on behalf of this business."
        />
        <div>
          <button type="submit" disabled={pending} className={buttonClasses('ink', 'lg')}>
            {pending ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      </div>
    </form>
  );
}
