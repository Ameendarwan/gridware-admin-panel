import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isLoggedIn: boolean;
  userDetails: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

const initialState: AuthState = {
  isLoggedIn: !!Cookies.get('token'),
  userDetails: Cookies.get('token') ? jwtDecode(Cookies.get('token') as string) : {},
};

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: state => {
      state.isLoggedIn = true;
    },
    userLoggedOut: state => {
      state.isLoggedIn = false;
    },
    userDetails: (state, action) => {
      state.userDetails = action.payload;
    },
  },
});

export const { userLoggedIn, userLoggedOut, userDetails } = AuthSlice.actions;

export default AuthSlice.reducer;
