import * as yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@app/components/Card/Card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/components/Form/Form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '@app/lib/api-config';
import { Button } from '@app/components/Button/Button';
import { Input } from '@app/components/Input/Input';
import Loader from '@app/components/Loader/Loader';
import { Switch } from '@app/components/Switch/Switch';
import { UserFormValues } from '../../types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { USER_ERROR_MESSAGE } from '@app/providers/AuthProvider/AuthConstants';

const formSchema = yup.object().shape({
  email: yup.string().email().required('Email is required'),
  is_invited_to_auth0: yup.boolean().optional(),
  created_by: yup.string().optional(),
  updated_by: yup.string().optional(),
});

const UserDetails = () => {
  const navigate = useNavigate();
  const navigateUrl = -1;
  const { id, mode } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      email: '',
      is_invited_to_auth0: false,
      created_by: '',
      updated_by: '',
    },
  });

  useEffect(() => {
    /**
     * Fetches user details when an `id` is provided in the URL parameters.
     * - Calls the API to retrieve the user data.
     * - Populates the form fields with the fetched user data.
     * - Manages the loading state while the data is being fetched.
     */
    if (id) {
      setIsLoading(true);
      API.get(`/user/${id}`)
        .then(resp => {
          const { data } = resp.data;
          form.setValue('email', data.email ?? '');
          form.setValue('is_invited_to_auth0', data.is_invited_to_auth0 ?? '');
          form.setValue('created_by', data.created_by ?? '');
          form.setValue('updated_by', data.updated_by ?? '');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const onSubmit = async (data: UserFormValues) => {
    /**
     * Handles the form submission.
     * - Sends the user data to the API for saving.
     * - Displays success or error notifications based on the result.
     * - Navigates back to the previous page upon successful submission.
     */
    try {
      setIsLoading(true);
      await API.post('/user', data);
      if (!globalThis.Cypress) {
        navigate(navigateUrl);
      }
      toast.success('User created successfully');
    } catch (error: any) {
      console.error('Error saving user: ', error);
      if (error?.response?.status === 409) {
        toast.error(error?.response?.data?.detail || USER_ERROR_MESSAGE);
        return;
      } else {
        toast.error(USER_ERROR_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Determines the appropriate title based on the mode
   */
  const getTitle = () => {
    if (mode === 'view') return `#${id}`;
    if (mode === 'edit') return 'Edit User';
    return 'New User';
  };

  return (
    <div className="m-3 rounded-lg border border-gray-300 py-4 shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {isLoading ? (
            <Loader width={'150'} height={'150'} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} required disabled={mode === 'view'} data-testid="user-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="is_invited_to_auth0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is invited to auth0</FormLabel>
                      <FormControl>
                        <div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={mode === 'view'}
                            data-testid="is-invited-to-auth0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode && (
                  <>
                    <FormField
                      name="created_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Created by</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={true} data-testid="user-created-by" />
                          </FormControl>
                          <FormDescription>Auto populates.</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="updated_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Updated by</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={true} data-testid="user-updated-by" />
                          </FormControl>
                          <FormDescription>Auto populates.</FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end gap-4">
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => navigate(navigateUrl)}
                    data-testid="cancel-btn">
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

export default UserDetails;
