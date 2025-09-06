export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6969',
  steam: {
    returnUrl: process.env.NEXT_PUBLIC_STEAM_RETURN_URL || 'http://localhost:5757/auth/callback',
    realm: process.env.NEXT_PUBLIC_STEAM_REALM || 'http://localhost:5757',
  },
} as const;
