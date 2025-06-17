export const environment = {
  production: true,
  apiUrl: 'https://harmoney-backend.onrender.com/api/v1',
  routes: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      verifyOtp: '/auth/verify-otp/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh-token',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    users: {
      getAll: '/users',
      getById: 'users/{id}',
      create: 'users',
      update: 'users/{id}',
      delete: 'users/{id}',
      profile: 'users/profile',
    },
    posts: {
      getAll: 'posts',
      getById: 'posts/{id}',
      create: 'posts',
      update: 'posts/{id}',
      delete: 'posts/{id}',
      getByUser: 'posts/user/{userId}',
    },
  },
};
