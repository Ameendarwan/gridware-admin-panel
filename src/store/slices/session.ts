import { createSlice } from '@reduxjs/toolkit'

interface SessionState {
  /**
   * The time the session started in milliseconds.
   */
  startedAt: string
}

const initialState: SessionState = {
  startedAt: Date.now().toString(),
}

export const SessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
})

export default SessionSlice.reducer
