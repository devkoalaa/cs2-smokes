export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6969',
  steam: {
    returnUrl: process.env.NEXT_PUBLIC_STEAM_RETURN_URL || 'https://cs2smokeshub.vercel.app/auth/callback',
    realm: process.env.NEXT_PUBLIC_STEAM_REALM || 'https://cs2smokeshub.vercel.app',
  },
} as const;
