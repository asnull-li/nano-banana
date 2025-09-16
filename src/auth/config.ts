import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { handleSignInUser } from "./handler";

let providers: Provider[] = [];

// Google One Tap Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
) {
  providers.push(
    CredentialsProvider({
      id: "google-one-tap",
      name: "google-one-tap",

      credentials: {
        credential: { type: "text" },
      },

      async authorize(credentials) {
        const googleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
        if (!googleClientId) {
          console.log("invalid google auth config");
          return null;
        }

        const token = credentials!.credential;

        const response = await fetch(
          "https://oauth2.googleapis.com/tokeninfo?id_token=" + token
        );
        if (!response.ok) {
          console.log("Failed to verify token");
          return null;
        }

        const payload = await response.json();
        if (!payload) {
          console.log("invalid payload from token");
          return null;
        }

        const {
          email,
          sub,
          given_name,
          family_name,
          email_verified,
          picture: image,
        } = payload;
        if (!email) {
          console.log("invalid email in payload");
          return null;
        }

        const user = {
          id: sub,
          name: [given_name, family_name].join(" "),
          email,
          image,
          emailVerified: email_verified ? new Date() : null,
        };

        return user;
      },
    })
  );
}

// Google Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Github Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

// Email Auth with Verification Code
if (
  process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" &&
  process.env.RESEND_API_KEY &&
  process.env.RESEND_SENDER_EMAIL
) {
  providers.push(
    CredentialsProvider({
      id: "email-code",
      name: "Email Code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const { standardizeEmail } = await import("@/lib/emailUtils");
        const email = standardizeEmail(credentials.email as string);
        const code = credentials.code as string;

        const { verifyCode } = await import("@/services/verifyCode");
        const result = await verifyCode(email, code);

        if (!result.success) {
          // CredentialsProvider doesn't properly pass error messages
          // Return null to indicate authentication failure
          return null;
        }

        // Check if user exists or create new user
        const { findUserByEmail } = await import("@/models/user");
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
          // Get client IP from request headers
          const clientIp =
            req.headers.get("x-vercel-forwarded-for") ||
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";

          // Update user's signin_ip and updated_at
          const { db } = await import("@/db");
          const { users } = await import("@/db/schema");
          const { eq } = await import("drizzle-orm");

          await db()
            .update(users)
            .set({
              signin_ip: clientIp,
              updated_at: new Date(),
            })
            .where(eq(users.uuid, existingUser.uuid));

          // Return existing user
          return {
            id: existingUser.uuid,
            email: existingUser.email,
            name: existingUser.nickname || existingUser.email.split("@")[0],
            image: existingUser.avatar_url || null,
          };
        } else {
          // Create new user
          const { getUuid } = await import("@/lib/hash");
          const uuid = getUuid();
          const { db } = await import("@/db");
          const { users } = await import("@/db/schema");

          // Get client IP from request headers
          const clientIp =
            req.headers.get("x-vercel-forwarded-for") ||
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";

          // Check IP registration count before granting credits
          const maxAccountsPerIp = parseInt(
            process.env.MAX_ACCOUNTS_PER_IP_FOR_CREDITS || "2"
          );
          let shouldGrantCredits = true;

          if (maxAccountsPerIp > 0) {
            const { count, eq } = await import("drizzle-orm");
            const [ipCount] = await db()
              .select({ count: count() })
              .from(users)
              .where(eq(users.signin_ip, clientIp));

            shouldGrantCredits = ipCount.count < maxAccountsPerIp;
          }

          const [newUser] = await db()
            .insert(users)
            .values({
              uuid,
              email,
              nickname: email.split("@")[0],
              avatar_url: "",
              signin_type: "email",
              signin_provider: "email-code",
              signin_openid: email,
              signin_ip: clientIp,
              created_at: new Date(),
              locale: "en",
              invite_code: "",
              invited_by: "",
              is_affiliate: false,
            })
            .returning();

          // Grant initial credits for new user (if allowed)
          if (shouldGrantCredits) {
            const { increaseCredits, CreditsTransType, CreditsAmount } =
              await import("@/services/credit");
            const { getOneYearLaterTimestr } = await import("@/lib/time");

            await increaseCredits({
              user_uuid: newUser.uuid,
              trans_type: CreditsTransType.NewUser,
              credits: CreditsAmount.NewUserGet,
              expired_at: getOneYearLaterTimestr(),
            });

            console.log(
              "New user created with initial credits:",
              newUser.email
            );
          } else {
            console.log(
              `New user created without credits (IP has ${maxAccountsPerIp}+ accounts):`,
              newUser.email,
              "IP:",
              clientIp
            );
          }

          return {
            id: newUser.uuid,
            email: newUser.email,
            name: newUser.nickname || newUser.email.split("@")[0],
            image: newUser.avatar_url || null,
          };
        }
      },
    })
  );
}

// Magic Link Auth with Resend (optional - can be removed if you only want code)
// if (
//   process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK_ENABLED === "true" &&
//   process.env.RESEND_API_KEY &&
//   process.env.RESEND_SENDER_EMAIL
// ) {
//   providers.push(
//     Resend({
//       apiKey: process.env.RESEND_API_KEY,
//       from: process.env.RESEND_SENDER_EMAIL,
//     })
//   );
// }

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  // No adapter needed for CredentialsProvider with JWT strategy
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn() {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      if (token && token.user && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        if (!user) {
          return token;
        }

        // For email sign-in, use our existing user management
        if (!account || account.provider === "resend") {
          // Email sign-in - user already exists in DB from adapter
          const userInfo = await handleSignInUser(user, null);
          if (userInfo) {
            token.user = {
              uuid: userInfo.uuid,
              email: userInfo.email,
              nickname: userInfo.nickname,
              avatar_url: userInfo.avatar_url,
              created_at: userInfo.created_at,
            };
          }
        } else {
          // OAuth sign-in
          const userInfo = await handleSignInUser(user, account);
          if (userInfo) {
            token.user = {
              uuid: userInfo.uuid,
              email: userInfo.email,
              nickname: userInfo.nickname,
              avatar_url: userInfo.avatar_url,
              created_at: userInfo.created_at,
            };
          }
        }

        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
};
