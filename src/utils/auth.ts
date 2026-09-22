import Cookies from 'js-cookie';

const auth = {
  setTokenExpiry: (expiry: number) => {
    Cookies.set('token-expiry', `${expiry}`);
  },
  getTokenExpiry: () => Cookies.get('token-expiry'),
  clearTokenExpiry: () => {
    Cookies.remove('token-expiry');
  },
};

export default auth;
