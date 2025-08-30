import { Adapter } from "next-auth/adapters";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUuid } from "@/lib/hash";

/**
 * Custom adapter for email authentication only
 * This adapter only implements the methods required for email/magic link authentication
 * User management is handled by our existing handleSignInUser function
 */
export const emailAdapter: Adapter = {
  // Create a verification token for email authentication
  async createVerificationToken({ identifier, expires, token }) {
    await db().insert(verificationTokens).values({
      identifier,
      token,
      expires,
    });
    return { identifier, expires, token };
  },

  // Use (and delete) a verification token
  async useVerificationToken({ identifier, token }) {
    try {
      const [verificationToken] = await db()
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .limit(1);

      if (!verificationToken) return null;

      // Delete the used token
      await db()
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token));

      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    } catch (err) {
      console.error("useVerificationToken error:", err);
      return null;
    }
  },

  // Get user by email - used during email sign in
  async getUserByEmail(email) {
    try {
      const [user] = await db()
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) return null;

      // Return user in NextAuth expected format
      return {
        id: user.uuid,
        email: user.email,
        name: user.nickname || user.email.split("@")[0],
        image: user.avatar_url || null,
        emailVerified: null,
      };
    } catch (err) {
      console.error("getUserByEmail error:", err);
      return null;
    }
  },

  // Create a new user - for email sign in
  async createUser(data) {
    try {
      const uuid = getUuid();
      const [user] = await db()
        .insert(users)
        .values({
          uuid,
          email: data.email,
          nickname: data.name || data.email.split("@")[0],
          avatar_url: data.image || "",
          signin_type: "email",
          signin_provider: "email",
          signin_openid: data.email,
          created_at: new Date(),
          locale: "en",
          invite_code: "",
          invited_by: "",
          is_affiliate: false,
        })
        .returning();

      // Grant initial credits for new user
      const { increaseCredits, CreditsTransType, CreditsAmount } = await import("@/services/credit");
      const { getOneYearLaterTimestr } = await import("@/lib/time");
      
      await increaseCredits({
        user_uuid: user.uuid,
        trans_type: CreditsTransType.NewUser,
        credits: CreditsAmount.NewUserGet,
        expired_at: getOneYearLaterTimestr(),
      });
      
      console.log("New email user created with initial credits:", user.email);

      return {
        id: user.uuid,
        email: user.email,
        name: user.nickname || user.email.split("@")[0],
        image: user.avatar_url || null,
        emailVerified: null,
      };
    } catch (err) {
      console.error("createUser error:", err);
      return null;
    }
  },

  // Get user by ID
  async getUser(id) {
    try {
      const [user] = await db()
        .select()
        .from(users)
        .where(eq(users.uuid, id))
        .limit(1);

      if (!user) return null;

      return {
        id: user.uuid,
        email: user.email,
        name: user.nickname || user.email.split("@")[0],
        image: user.avatar_url || null,
        emailVerified: null,
      };
    } catch (err) {
      console.error("getUser error:", err);
      return null;
    }
  },

  // These methods are not needed for email authentication but required by the Adapter interface
  async getUserByAccount() {
    return null;
  },
  async updateUser() {
    return null;
  },
  async deleteUser() {
    return null;
  },
  async linkAccount() {
    return undefined;
  },
  async unlinkAccount() {
    return undefined;
  },
  async createSession() {
    return null;
  },
  async getSessionAndUser() {
    return null;
  },
  async updateSession() {
    return null;
  },
  async deleteSession() {
    return null;
  },
};