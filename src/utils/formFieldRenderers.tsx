/**
 * Reusable form field renderer components
 * Reduces duplication across detail page forms
 */

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@app/components/Form/Form';
import { Input } from '@app/components/Input/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';
import { Textarea } from '@app/components/TextArea/Textarea';
import { Switch } from '@app/components/Switch/Switch';
import React from 'react';

/**
 * Renders a standard text input field
 * @param name - Field name
 * @param label - Field label
 * @param required - Whether the field is required
 * @param disabled - Whether the field is disabled
 * @param testId - Data test ID for testing
 */
export const renderTextInputField = (
  name: string,
  label: string,
  required: boolean,
  disabled: boolean,
  testId: string
) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} required={required} disabled={disabled} data-testid={testId} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Renders a read-only field with description
 * @param name - Field name
 * @param label - Field label
 * @param testId - Data test ID for testing
 * @param description - Description text to display
 */
export const renderReadOnlyField = (name: string, label: string, testId: string, description: string) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} disabled={true} data-testid={testId} />
        </FormControl>
        <FormDescription>{description}</FormDescription>
      </FormItem>
    )}
  />
);

/**
 * Renders a simple input field (commonly used pattern)
 * @param name - Field name
 * @param label - Field label
 * @param disabled - Whether the field is disabled
 * @param type - Input type (default: 'text')
 * @param testId - Optional data test ID
 */
export const renderSimpleInputField = (
  name: string,
  label: string,
  disabled: boolean,
  type: string = 'text',
  testId?: string
) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} disabled={disabled} type={type} data-testid={testId} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Renders created_by and updated_by fields (common pattern)
 * @param mode - The form mode (if truthy, fields will render)
 */
export const renderAuditFields = (mode: string | undefined) => {
  if (!mode) return null;

  return (
    <>
      {renderReadOnlyField('created_by', 'Created by', 'created-by', 'Auto populates.')}
      {renderReadOnlyField('updated_by', 'Updated by', 'updated-by', 'Auto populates.')}
    </>
  );
};

/**
 * Renders a textarea field
 * @param name - Field name
 * @param label - Field label
 * @param disabled - Whether the field is disabled
 */
export const renderTextareaField = (name: string, label: string, disabled: boolean) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Textarea {...field} disabled={disabled} />
        </FormControl>
      </FormItem>
    )}
  />
);

/**
 * Renders a select field
 * @param name - Field name
 * @param label - Field label
 * @param options - Array of option values
 * @param placeholder - Placeholder text
 * @param disabled - Whether the field is disabled
 * @param fieldRefs - Optional ref object for field references
 */
export const renderSelectField = (
  name: string,
  label: string,
  options: string[],
  placeholder: string,
  disabled: boolean,
  fieldRefs?: React.MutableRefObject<{ [key: string]: HTMLElement | null }>
) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem ref={fieldRefs ? el => (fieldRefs.current[name] = el) : undefined}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Renders a switch field
 * @param name - Field name
 * @param label - Field label
 * @param disabled - Whether the field is disabled
 */
export const renderSwitchField = (name: string, label: string, disabled: boolean) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div>
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Renders an input field with optional field refs support
 * @param name - Field name
 * @param label - Field label
 * @param disabled - Whether the field is disabled
 * @param fieldRefs - Optional ref object for field references
 */
export const renderInputField = (
  name: string,
  label: string,
  disabled: boolean,
  fieldRefs?: React.MutableRefObject<{ [key: string]: HTMLElement | null }>
) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} disabled={disabled} ref={fieldRefs ? el => (fieldRefs.current[name] = el) : undefined} />
        </FormControl>
      </FormItem>
    )}
  />
);
