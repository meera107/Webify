import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hi'],
  defaultLocale: 'en'
});

export const config = {
  matcher: [
    // Include all pathnames except those starting with /api/, /_next/, or static files
    '/((?!api/|_next/|_vercel/|.*\\..*).*)'
  ]
};