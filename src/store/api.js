import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://trading.test/api";
const baseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
    credentials: "omit",
  }),
  tagTypes: ["Auth", "Me", "Wallet", "Positions"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/register", method: "POST", body }),
      invalidatesTags: ["Auth", "Me"],
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/login", method: "POST", body }),
      invalidatesTags: ["Auth", "Me"],
    }),
    logout: builder.mutation({
      query: () => ({ url: "/logout", method: "POST" }),
      invalidatesTags: ["Auth", "Me"],
    }),
    me: builder.query({
      query: () => ({ url: "/me", method: "GET" }),
      providesTags: ["Me"],
    }),
    resendEmail: builder.mutation({
      query: () => ({ url: "/email/resend", method: "POST" }),
    }),
    resendVerification: builder.mutation({
      query: (body) => ({ url: "/email/resend-public", method: "POST", body }),
    }),
    verifyEmail: builder.query({
      query: ({ id, hash, expires, signature }) => ({
        url: `/email/verify/${id}/${hash}`,
        method: "GET",
        params: { expires, signature },
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/password/forgot", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/password/reset", method: "POST", body }),
    }),
    // Wallet endpoints
    getWallet: builder.query({
      query: () => ({ url: "/wallet", method: "GET" }),
      providesTags: ["Wallet"],
    }),
    // Position endpoints
    getPositions: builder.query({
      query: () => ({ url: "/positions", method: "GET" }),
      providesTags: ["Positions"],
    }),
    openPosition: builder.mutation({
      query: (body) => ({ url: "/positions", method: "POST", body }),
      invalidatesTags: ["Positions", "Wallet"],
    }),
    closePosition: builder.mutation({
      query: (id) => ({ url: `/positions/${id}/close`, method: "POST" }),
      invalidatesTags: ["Positions", "Wallet"],
    }),
    deletePosition: builder.mutation({
      query: (id) => ({ url: `/positions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Positions", "Wallet"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useResendVerificationMutation,
  useLogoutMutation,
  useMeQuery,
  useLazyMeQuery,
  useResendEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useGetWalletQuery,
  useGetPositionsQuery,
  useOpenPositionMutation,
  useClosePositionMutation,
  useDeletePositionMutation,
} = api;


