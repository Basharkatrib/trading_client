import { createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

const initialState = {
  token: null,
  user: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.token = payload?.token ?? null;
        state.user = payload?.user ?? null;
      })
      .addMatcher(
        api.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.token = payload?.token ?? null;
          state.user = payload?.user ?? null;
        }
      )
      .addMatcher(api.endpoints.me.matchFulfilled, (state, { payload }) => {
        state.user = payload ?? null;
      })
      .addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export const { setToken, setUser, clearAuth } = slice.actions;
export default slice.reducer;


