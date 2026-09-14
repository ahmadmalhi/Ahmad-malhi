import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 config.
 *
 * IMPORTANT — you must supply your own credentials before Google works:
 *
 *   1. https://console.cloud.google.com/apis/credentials
 *   2. Create an OAuth Client ID (type: Web application)
 *   3. Authorized redirect URI: https://YOUR-SITE.netlify.app/api/auth/callback/google
 *   4. Put the values in Netlify env vars: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
 *
 * Until those are set, the Google button in the sign-in modal will show a
 * friendly "not configured yet" message instead of erroring.
 *
 * This app has no database (see README), so sessions are JWT-based only.
 * That's fine for Google OAuth. The "continue with email" option is NOT a
 * secured login — it's a lightweight local profile (name + email) used to
 * personalize greetings, stored in the browser. If you want real
 * email/password accounts, you'll need to add a database.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
  },
});
