import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './Form';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the Label component
vi.mock('@app/components/Label/Label', () => ({
  Label: ({ children, className, htmlFor, ...props }: any) => (
    <label data-testid="form-label" className={className} htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

// Test component to render the Form with all its parts
const TestForm = () => {
  const form = useForm({
    defaultValues: {
      username: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormDescription>Enter your username</FormDescription>
              <FormControl>
                <input data-testid="username-input" {...field} />
              </FormControl>
              <FormMessage>Error message</FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

// Mock the useFormContext hook
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual as any,
    useFormContext: vi.fn().mockImplementation(() => ({
      getFieldState: vi.fn().mockImplementation((name) => {
        // Return error state for username field in error tests
        if (name === 'username-with-error') {
          return { error: { message: 'Username is required' } };
        }
        return {};
      }),
      formState: {
        errors: {
          'username-with-error': { message: 'Username is required' }
        }
      }
    })),
  };
});

// Test component with error state
const TestFormWithError = () => {
  const form = useForm({
    defaultValues: {
      username: '',
      'username-with-error': '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="username-with-error"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input data-testid="username-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('Form', () => {
  it('should render Form with all its parts', () => {
    render(<TestForm />);
    
    // Check if all form elements are rendered
    expect(screen.getByTestId('form-label')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render FormLabel with correct attributes', () => {
    render(<TestForm />);
    
    const label = screen.getByTestId('form-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for'); // htmlFor gets converted to 'for' in the DOM
  });

  it('should render FormDescription with correct text', () => {
    render(<TestForm />);
    
    const description = screen.getByText('Enter your username');
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe('P');
  });

  it('should render FormControl with correct attributes', () => {
    render(<TestForm />);
    
    const input = screen.getByTestId('username-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('should render FormMessage with error message when there is an error', () => {
    // Create a component that uses FormMessage with an error field
    const TestFormMessageWithError = () => {
      const form = useForm({
        defaultValues: {
          'username-with-error': '',
        },
      });
      
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username-with-error"
            render={() => (
              <FormItem>
                <FormMessage data-testid="form-error-message" />
              </FormItem>
            )}
          />
        </Form>
      );
    };
    
    // Render both components
    render(<TestFormWithError />);
    render(<TestFormMessageWithError />);
    
    // The error message should be displayed
    const errorMessage = screen.getByTestId('form-error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Username is required');
  });

  it('should render FormLabel with error class when there is an error', () => {
    // Create a component that uses FormLabel with an error field
    const TestFormLabelWithError = () => {
      const form = useForm({
        defaultValues: {
          'username-with-error': '',
        },
      });
      
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username-with-error"
            render={() => (
              <FormItem>
                <FormLabel data-testid="error-label">Username</FormLabel>
              </FormItem>
            )}
          />
        </Form>
      );
    };
    
    // Render the component
    render(<TestFormLabelWithError />);
    
    const label = screen.getByTestId('error-label');
    // With our mock, the label should receive the text-destructive class
    expect(label).toHaveClass('text-destructive');
  });

  it('should render FormControl with aria-invalid when there is an error', () => {
    // Create a component that uses FormControl with an error field
    const TestFormControlWithError = () => {
      const form = useForm({
        defaultValues: {
          'username-with-error': '',
        },
      });
      
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username-with-error"
            render={() => (
              <FormItem>
                <FormControl>
                  <input data-testid="error-input" />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      );
    };
    
    // Render the component
    render(<TestFormControlWithError />);
    
    const input = screen.getByTestId('error-input');
    // With our mock, the input should have aria-invalid="true"
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should render FormItem with custom className', () => {
    const CustomFormItem = () => {
      const form = useForm();
      return (
        <Form {...form}>
          <FormItem className="custom-item" data-testid="form-item">
            Item
          </FormItem>
        </Form>
      );
    };
    
    render(<CustomFormItem />);
    
    const item = screen.getByTestId('form-item');
    expect(item).toHaveClass('custom-item');
  });

  it('should render FormDescription with custom className', () => {
    const CustomFormDescription = () => {
      const form = useForm();
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem>
                <FormDescription className="custom-description" data-testid="form-description">
                  Description
                </FormDescription>
              </FormItem>
            )}
          />
        </Form>
      );
    };
    
    render(<CustomFormDescription />);
    
    const description = screen.getByTestId('form-description');
    expect(description).toHaveClass('custom-description');
  });

  it('should render FormMessage with custom className', () => {
    const CustomFormMessage = () => {
      const form = useForm();
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem>
                <FormMessage className="custom-message" data-testid="form-message">
                  Message
                </FormMessage>
              </FormItem>
            )}
          />
        </Form>
      );
    };
    
    render(<CustomFormMessage />);
    
    const message = screen.getByTestId('form-message');
    expect(message).toHaveClass('custom-message');
  });
});
