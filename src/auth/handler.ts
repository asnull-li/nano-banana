import { AdapterUser } from "next-auth/adapters";
import { Account, User } from "next-auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { saveUser } from "@/services/user";
import { User as UserType } from "@/types/user";
import { getClientIp } from "@/lib/ip";

export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account | null
): Promise<UserType | null> {
  try {
    if (!user.email) {
      throw new Error("invalid signin user");
    }
    
    // Handle email sign-in (Resend provider)
    if (!account) {
      // For email sign-in, adapter has already created the user with initial credits
      // We just need to ensure the user info is complete
      const userInfo: UserType = {
        uuid: user.id || getUuid(),
        email: user.email,
        nickname: user.name || user.email.split("@")[0],
        avatar_url: user.image || "",
        signin_type: "email",
        signin_provider: "email",
        signin_openid: user.email,
        created_at: new Date(),
        signin_ip: await getClientIp(),
      };
      
      // saveUser will return existing user info without creating duplicate
      const savedUser = await saveUser(userInfo);
      return savedUser;
    }
    
    // Handle OAuth sign-in (existing logic)
    if (!account.type || !account.provider || !account.providerAccountId) {
      throw new Error("invalid signin account");
    }

    const userInfo: UserType = {
      uuid: getUuid(),
      email: user.email,
      nickname: user.name || "",
      avatar_url: user.image || "",
      signin_type: account.type,
      signin_provider: account.provider,
      signin_openid: account.providerAccountId,
      created_at: new Date(),
      signin_ip: await getClientIp(),
    };

    const savedUser = await saveUser(userInfo);

    return savedUser;
  } catch (e) {
    console.error("handle signin user failed:", e);
    throw e;
  }
}
