import { useLocation, useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';
import { urls } from '@app/routes/urls';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

const Login = () => {
  const { loginWithRedirect, user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const cookie = Cookies.get('token');

  useEffect(() => {
    /**
     * Redirects the user to the appropriate destination if they are authenticated.
     * - Checks if the user exists.
     * - Determines the target destination using the `from` state or defaults to the user list URL.
     * - Navigates to the constructed destination path, ensuring smooth navigation.
     */
    if (user) {
      const from = location.state?.from;
      const destinationPath = from?.pathname || urls.users.list;
      const destinationSearch = from?.search || '';
      const destinationHash = from?.hash || '';
      const fullDestination = `${destinationPath}${destinationSearch}${destinationHash}`;
      navigate(fullDestination, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans leading-normal tracking-normal">
      {!cookie && (
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
          <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
          <button
            id="login-btn"
            onClick={() => loginWithRedirect()}
            className="w-full rounded-lg bg-blue-500 p-2 text-white transition-all duration-300 ease-in-out hover:bg-blue-400">
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
