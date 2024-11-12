import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  isLoggedIn: boolean
}

const initialState: AuthState = {
  isLoggedIn: false,
}

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: state => {
      state.isLoggedIn = true
    },
    userLoggedOut: state => {
      state.isLoggedIn = false
    },
  },
})

export const { userLoggedIn, userLoggedOut } = AuthSlice.actions

export default AuthSlice.reducer
