import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import { Button } from '@app/components/Button/Button';
import Loader from '@app/components/Loader/Loader';
import { Form } from '@app/components/Form/Form';
import { UseFormReturn } from 'react-hook-form';

interface DetailPageWrapperProps {
  title: string;
  isLoading: boolean;
  mode?: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  children: ReactNode;
}

/**
 * Reusable wrapper for detail pages with common layout and behavior
 */
const DetailPageWrapper = ({ title, isLoading, mode, form, onSubmit, onCancel, children }: DetailPageWrapperProps) => {
  return (
    <div className="m-3 rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {children}
                <div className="flex justify-end gap-4">
                  <Button variant="destructive" type="button" onClick={onCancel} data-testid="cancel-btn">
                    {mode === 'view' ? 'Back' : 'Cancel'}
                  </Button>
                  {mode !== 'view' && (
                    <Button type="submit" data-testid="save-btn">
                      Save
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailPageWrapper;
