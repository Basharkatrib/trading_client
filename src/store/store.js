import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer, { setToken, setUser } from "./authSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Simple client-side persistence for auth token and user
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const { token, user } = JSON.parse(saved);
      if (token) store.dispatch(setToken(token));
      if (user) store.dispatch(setUser(user));
    }
  } catch (_) {}

  store.subscribe(() => {
    const state = store.getState();
    const payload = {
      token: state.auth.token,
      user: state.auth.user,
    };
    try {
      localStorage.setItem("auth", JSON.stringify(payload));
    } catch (_) {}
  });
}


