export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://cs2-smokes-hub-api.vercel.app',
  steam: {
    returnUrl: process.env.NEXT_PUBLIC_STEAM_RETURN_URL || 'https://cs2smokeshub.vercel.app/auth/callback',
    realm: process.env.NEXT_PUBLIC_STEAM_REALM || 'https://cs2smokeshub.vercel.app',
  },
} as const;
