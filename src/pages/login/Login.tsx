import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from '@app/components/Form/Form';
import { Input } from '@app/components/Input/Input';
import { userDetails, userLoggedIn } from '@app/store/slices/auth';
import { urls } from '@app/routes/urls';
import { LoginFormValues } from './types';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm<LoginFormValues>();

  const navigateToHome = () => {
    dispatch(userLoggedIn());
    navigate(urls.users);
  };

  const onSubmit = (data: LoginFormValues) => {
    console.log(data);
    navigateToHome();
  };

  const handleSuccess = (credentialResponse: any) => {
    const token = credentialResponse.credential;
    const extractedUserDetails = jwtDecode(token);
    dispatch(userDetails(extractedUserDetails));
    Cookies.set('token', token, { secure: true, sameSite: 'Strict' });
    navigateToHome();
  };

  const handleFailure = () => {
    console.error('Google login failed');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans leading-normal tracking-normal">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" id="password" placeholder="Password" {...field} className="mb-6" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 p-2 text-white transition-all duration-300 ease-in-out hover:bg-blue-400">
              Continue
            </button>
          </form>
        </Form>
        <div className="my-4 flex items-center justify-between">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
      </div>
    </div>
  );
};

export default Login;
