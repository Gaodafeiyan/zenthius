export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: {
        auth: false,
      },
    },
  ],
}; 