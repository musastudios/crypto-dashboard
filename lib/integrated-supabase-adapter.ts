import { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { createClient } from "@supabase/supabase-js";

export function IntegratedSupabaseAdapter(options: {
  url: string;
  secret: string;
}): Adapter {
  const supabase = createClient(options.url, options.secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      try {
        console.log("Creating user in Supabase Auth:", user);
        
        // First create the user in Supabase Auth
        const { data: authUserData, error: authUserError } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            picture: user.image,
          },
        });

        if (authUserError) {
          console.error("Error creating auth user:", authUserError);
          throw authUserError;
        }

        if (!authUserData.user) {
          throw new Error("No user returned from Supabase Auth");
        }

        // The trigger should automatically create the user in the public.users table
        // but let's verify it exists and get the data
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", authUserData.user.id)
          .single();

        if (error) {
          console.error("Error fetching created user:", error);
          throw error;
        }

        if (!data) {
          // If the user doesn't exist in the public schema, create it manually
          // (the trigger might have failed)
          const { data: manualUserData, error: manualUserError } = await supabase
            .from("users")
            .insert({
              id: authUserData.user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: user.emailVerified,
            })
            .select()
            .single();

          if (manualUserError) {
            console.error("Error manually creating user in public schema:", manualUserError);
            throw manualUserError;
          }

          return manualUserData;
        }

        return data;
      } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
      }
    },

    async getUser(id: string) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", id)
          .single();

        if (error || !data) return null;
        return data;
      } catch (error) {
        console.error("Error in getUser:", error);
        return null;
      }
    },

    async getUserByEmail(email: string) {
      try {
        // First check if the user exists in the public schema
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("email", email)
          .single();

        // Return the user if found
        if (!error && data) {
          return data;
        }

        // Check if user exists in Supabase Auth
        // Use the listUsers API to find a user by email
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error finding users in auth:", authError);
          return null;
        }
        
        // Find the user with matching email
        const authUser = authData?.users?.find(u => u.email === email);
        if (!authUser) {
          return null;
        }
        
        console.log("Found user in Supabase Auth but not in public schema:", authUser);
        
        // Insert the user into the public schema
        const { data: newUserData, error: newUserError } = await supabase
          .from("users")
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
            image: authUser.user_metadata?.picture || '',
          })
          .select()
          .single();

        if (newUserError) {
          console.error("Error creating user in public schema:", newUserError);
          return null;
        }

        console.log("Created user in public schema:", newUserData);
        return newUserData;
      } catch (error) {
        console.error("Error in getUserByEmail:", error);
        return null;
      }
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      try {
        const { data, error } = await supabase
          .from("accounts")
          .select("user_id")
          .eq("provider_account_id", providerAccountId)
          .eq("provider", provider)
          .single();

        if (error || !data?.user_id) return null;

        const { data: userData, error: userError } = await supabase
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
        // Update both Supabase Auth and public schema
        if (user.email || user.name || user.image) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
              email: user.email,
              user_metadata: {
                ...(user.name && { name: user.name }),
                ...(user.image && { picture: user.image }),
              },
            }
          );

          if (authError) {
            console.error("Error updating auth user:", authError);
            throw authError;
          }
        }

        // Update the public schema
        const { data, error } = await supabase
          .from("users")
          .update({
            ...(user.name && { name: user.name }),
            ...(user.email && { email: user.email }),
            ...(user.image && { image: user.image }),
            ...(user.emailVerified && { 
              "emailVerified": user.emailVerified instanceof Date 
                ? user.emailVerified.toISOString() 
                : user.emailVerified 
            }),
            updated_at: new Date().toISOString(),
          })
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
      try {
        // First delete the user from Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
          console.error("Error deleting auth user:", authError);
          throw authError;
        }

        // Then delete the user from the public schema
        // This should cascade to all related tables due to the foreign key constraints
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", userId);

        if (error) throw error;
        return;
      } catch (error) {
        console.error("Error in deleteUser:", error);
        throw error;
      }
    },

    async linkAccount(account: AdapterAccount) {
      try {
        // Generate a UUID for the account
        const accountId = crypto.randomUUID();
        
        // Check if an account with this provider and providerAccountId already exists
        const { data: existingAccount, error: findError } = await supabase
          .from("accounts")
          .select("*")
          .eq("provider", account.provider)
          .eq("provider_account_id", account.providerAccountId);
          
        if (!findError && existingAccount && existingAccount.length > 0) {
          console.log("Found existing account, will delete and recreate:", existingAccount[0]);
          // Delete the existing account
          const { error: deleteError } = await supabase
            .from("accounts")
            .delete()
            .eq("provider", account.provider)
            .eq("provider_account_id", account.providerAccountId);
            
          if (deleteError) {
            console.error("Error deleting existing account:", deleteError);
            throw deleteError;
          }
        }
        
        // Insert the new account
        const { data, error } = await supabase
          .from("accounts")
          .insert({
            id: accountId, // Explicitly set the ID
            user_id: account.userId,
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          })
          .select()
          .single();

        if (error) {
          console.error("Error linking account:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error in linkAccount:", error);
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      try {
        const { error } = await supabase
          .from("accounts")
          .delete()
          .eq("provider_account_id", providerAccountId)
          .eq("provider", provider);

        if (error) throw error;
      } catch (error) {
        console.error("Error in unlinkAccount:", error);
        throw error;
      }
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .insert({
            session_token: session.sessionToken,
            user_id: session.userId,
            expires: session.expires instanceof Date ? session.expires.toISOString() : session.expires,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating session:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error in createSession:", error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken: string) {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*, users(*)")
          .eq("session_token", sessionToken)
          .single();

        if (error || !data) return null;

        const { users: user, ...session } = data;

        // Format the session data to match NextAuth.js expectations
        return {
          user,
          session: {
            ...session,
            userId: session.user_id,
            sessionToken: session.session_token,
            expires: new Date(session.expires),
          },
        };
      } catch (error) {
        console.error("Error in getSessionAndUser:", error);
        return null;
      }
    },

    async updateSession(session: Partial<{ sessionToken: string; userId: string; expires: Date }> & { sessionToken: string }) {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .update({
            ...(session.userId && { user_id: session.userId }),
            ...(session.expires && { 
              expires: session.expires instanceof Date 
                ? session.expires.toISOString() 
                : session.expires 
            }),
            updated_at: new Date().toISOString(),
          })
          .eq("session_token", session.sessionToken)
          .select()
          .single();

        if (error) {
          console.error("Error updating session:", error);
          throw error;
        }

        // Format session data for NextAuth.js
        return {
          ...data,
          userId: data.user_id,
          sessionToken: data.session_token,
          expires: new Date(data.expires),
        };
      } catch (error) {
        console.error("Error in updateSession:", error);
        throw error;
      }
    },

    async deleteSession(sessionToken: string) {
      try {
        const { error } = await supabase
          .from("sessions")
          .delete()
          .eq("session_token", sessionToken);

        if (error) throw error;
      } catch (error) {
        console.error("Error in deleteSession:", error);
        throw error;
      }
    },

    async createVerificationToken(verificationToken: { identifier: string; token: string; expires: Date }) {
      try {
        const { data, error } = await supabase
          .from("verification_tokens")
          .insert({
            identifier: verificationToken.identifier,
            token: verificationToken.token,
            expires: verificationToken.expires instanceof Date 
              ? verificationToken.expires.toISOString() 
              : verificationToken.expires,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error in createVerificationToken:", error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      try {
        const { data, error } = await supabase
          .from("verification_tokens")
          .delete()
          .match({ identifier, token })
          .select()
          .single();

        if (error) return null;
        return data;
      } catch (error) {
        console.error("Error in useVerificationToken:", error);
        return null;
      }
    },
  };
} 