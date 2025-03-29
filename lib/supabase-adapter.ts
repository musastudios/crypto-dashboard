import { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { createClient } from "@supabase/supabase-js";

export function CustomSupabaseAdapter(options: {
  url: string;
  secret: string;
}): Adapter {
  const client = createClient(options.url, options.secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Use the public schema
  const schemaPrefix = "public.";

  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      try {
        // Format the user data properly for Supabase
        const supabaseUser = {
          id: crypto.randomUUID(),
          name: user.name,
          email: user.email,
          image: user.image,
          // Explicitly convert to ISO string if exists
          ...(user.emailVerified && { 
            "emailVerified": user.emailVerified instanceof Date 
              ? user.emailVerified.toISOString() 
              : user.emailVerified 
          })
        };

        console.log("Creating user with data:", JSON.stringify(supabaseUser, null, 2));

        const { data, error } = await client
          .from("users")
          .insert(supabaseUser)
          .select()
          .single();

        if (error) {
          console.error("Error creating user:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
      }
    },

    async getUser(id: string) {
      const { data, error } = await client
        .from("users")
        .select()
        .eq("id", id)
        .single();

      if (error) return null;
      return data;
    },

    async getUserByEmail(email: string) {
      const { data, error } = await client
        .from("users")
        .select()
        .eq("email", email)
        .single();

      if (error) return null;
      return data;
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      try {
        const { data, error } = await client
          .from("accounts")
          .select("user_id")
          .eq("provider_account_id", providerAccountId)
          .eq("provider", provider)
          .single();

        if (error || !data?.user_id) return null;

        const { data: userData, error: userError } = await client
          .from("users")
          .select()
          .eq("id", data.user_id)
          .single();

        if (userError) return null;
        return userData;
      } catch (error) {
        console.error("Error in getUserByAccount:", error);
        return null;
      }
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      try {
        // Format the update data
        const updateData = {
          ...user,
          ...(user.emailVerified && { 
            "emailVerified": user.emailVerified instanceof Date 
              ? user.emailVerified.toISOString() 
              : user.emailVerified 
          }),
          updated_at: new Date().toISOString(),
        };

        // Remove id from the update data (it's used in the where clause)
        delete (updateData as any).id;

        const { data, error } = await client
          .from("users")
          .update(updateData)
          .eq("id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error in updateUser:", error);
        throw error;
      }
    },

    async deleteUser(userId: string) {
      const { error } = await client.from("users").delete().eq("id", userId);
      if (error) throw error;
    },

    async linkAccount(account: AdapterAccount) {
      try {
        // Format the account data for Supabase
        const formattedAccount = {
          ...account,
          id: crypto.randomUUID(),
          user_id: account.userId,
          provider_account_id: account.providerAccountId,
        };
        
        // Remove properties that don't exist in the database
        delete (formattedAccount as any).userId;
        delete (formattedAccount as any).providerAccountId;

        const { data, error } = await client
          .from("accounts")
          .insert(formattedAccount)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error linking account:", error);
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const { error } = await client
        .from("accounts")
        .delete()
        .eq("provider_account_id", providerAccountId)
        .eq("provider", provider);

      if (error) throw error;
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      try {
        const formattedSession = {
          id: crypto.randomUUID(),
          user_id: session.userId,
          session_token: session.sessionToken,
          expires: session.expires instanceof Date ? session.expires.toISOString() : session.expires,
        };
        
        const { data, error } = await client
          .from("sessions")
          .insert(formattedSession)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating session:", error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken: string) {
      try {
        const { data, error } = await client
          .from("sessions")
          .select("*, users(*)")
          .eq("session_token", sessionToken)
          .single();

        if (error || !data) return null;

        const { users: user, ...session } = data;

        // Convert snake_case to camelCase for session
        const formattedSession = {
          ...session,
          userId: session.user_id,
          sessionToken: session.session_token,
          expires: new Date(session.expires),
        };

        return { user, session: formattedSession };
      } catch (error) {
        console.error("Error getting session and user:", error);
        return null;
      }
    },

    async updateSession(session: Partial<{ sessionToken: string; userId: string; expires: Date }> & { sessionToken: string }) {
      try {
        const formattedSession = {
          ...(session.userId && { user_id: session.userId }),
          ...(session.expires && { 
            expires: session.expires instanceof Date 
              ? session.expires.toISOString() 
              : session.expires 
          }),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await client
          .from("sessions")
          .update(formattedSession)
          .eq("session_token", session.sessionToken)
          .select()
          .single();

        if (error) throw error;
        
        return {
          ...data,
          userId: data.user_id,
          sessionToken: data.session_token,
        };
      } catch (error) {
        console.error("Error updating session:", error);
        throw error;
      }
    },

    async deleteSession(sessionToken: string) {
      const { error } = await client
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken);

      if (error) throw error;
    },

    async createVerificationToken(verificationToken: { identifier: string; token: string; expires: Date }) {
      try {
        const formattedToken = {
          ...verificationToken,
          expires: verificationToken.expires instanceof Date 
            ? verificationToken.expires.toISOString() 
            : verificationToken.expires,
        };
        
        const { data, error } = await client
          .from("verification_tokens")
          .insert(formattedToken)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating verification token:", error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const { data, error } = await client
        .from("verification_tokens")
        .delete()
        .eq("identifier", identifier)
        .eq("token", token)
        .select()
        .single();

      if (error) return null;
      return data;
    },
  };
} 