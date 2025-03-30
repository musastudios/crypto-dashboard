import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id (from Supabase) */
      id?: string; // Add the id property
    } & DefaultSession["user"]; // Keep the default properties (name, email, image)
  }

  // Optional: If you need to add properties to the User object used during callbacks
  // interface User {
  //   // id is already part of the default User type from the adapter
  // }
}

// Optional: If you need to add properties to the JWT token itself
// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
//   interface JWT {
//     /** Add custom properties */
//     // example_role?: string;
//   }
// } 