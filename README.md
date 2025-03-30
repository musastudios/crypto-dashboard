# Crypto Trading Analytics Dashboard

A comprehensive dashboard for analyzing cryptocurrency trading data, with Supabase integration for data storage and retrieval.

## 🚀 Introduction

Crypto Trading Analytics Dashboard is a powerful tool for crypto traders to analyze their transaction history, monitor price trends, calculate profits, and make data-driven trading decisions. The application integrates with Supabase for reliable data storage and features a responsive, dark-mode compatible UI built with Next.js and Tailwind CSS.

## ✨ Current Functionalities

### Dashboard & Overview
- **Trading Summary**: View key metrics including total volume, buy/sell distribution, and net profit/loss
- **Price Tracking**: Display current market prices from CoinAPI with automatic updates
- **Latest Transactions**: View most recent transactions across all trading pairs
- **Trading Pairs List**: Quick access to all available trading pairs in the database
- **Price History Chart**: Visualize price trends over time with interactive charts
- **Volume Distribution**: Analyze buy vs sell volume with visual breakdown

### Transaction Management
- **CSV Upload**: Import transaction data from CSV files
- **Data Persistence**: Store transactions in Supabase database for future access
- **Transaction Filtering**: Filter by pair, side (buy/sell), or search terms
- **Pagination**: Navigate through large transaction datasets

### Analytics & Tools
- **Profit Calculator**: Calculate potential profits when buying at lower prices
- **Reference Price Comparison**: Compare against current market price or average sell price
- **Investment Scenario Modeling**: Analyze different investment amounts and target prices
- **Volume Analysis**: Visualize trading volume distribution

### Data Management
- **Trading Pair Management**: Add, view, or delete trading pairs
- **Price History Management**: Record and track price changes over time
- **File Upload Tracking**: Keep record of uploaded transaction files
- **Database Stats**: Monitor database usage and statistics

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Supports light and dark themes
- **Collapsible Sidebar**: Toggle sidebar visibility for more screen space
- **Tab Navigation**: Easy navigation between different dashboard sections

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Context
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **External APIs**: CoinAPI for current market prices

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- CoinAPI key (optional, for real-time price data)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/crypto-trading-dashboard.git
cd crypto-trading-dashboard


### Future Features 

Here are 15-20 high-value features that would make your Crypto Trading Analytics Dashboard 10x more helpful:

1. AI-powered trade pattern recognition using OpenAI's models to identify successful and unsuccessful patterns in your past trades

2. Sentiment analysis integration that crawls news/social media about your coins and presents correlation with price movements

3. Risk assessment scores for current positions based on volatility, market conditions, and your trading history

4. Predictive price modeling using machine learning to estimate probable price ranges over different timeframes

5. Portfolio rebalancing recommendations based on performance metrics and risk tolerance  

6. Anomaly detection to flag unusual market movements or trading opportunities

7. AI trade advisor that analyzes your best/worst trades and suggests entry/exit strategies

8. Trading journal with AI insights where you document reasoning and the system provides feedback

9. Scenario planning tool to simulate potential market movements and their impact on your portfolio

10. Automated technical indicator analysis with plain-language explanations of signals

11. Correlation matrix showing how your holdings move in relation to each other and broader markets

12. Economic calendar integration highlighting events that might impact your holdings

13. AI-generated weekly reports summarizing key insights and opportunities you might have missed

14. Tax impact simulator to show tax implications of different trading decisions

15. Whale alert system to notify of large transactions in your watched coins

16. Seasonal pattern recognition to identify historical trends for specific timeframes

17. Cost basis optimization suggestions to improve tax efficiency when selling

18. Market regime detection to identify if we're in a bull, bear, or sideways market and adjust strategies accordingly

19. Backtesting simulator to test strategies against historical data with AI-suggested improvements

20. Trading psychology insights that analyze your emotional patterns in trading (FOMO, panic selling) based on your history

# Authentication Setup (NextAuth.js + Supabase Adapter)

This project uses NextAuth.js for authentication, leveraging Google and Twitter OAuth providers, with Supabase acting as the database backend via the `@auth/supabase-adapter`.

## Setup Instructions

### 1. Environment Variables

Set the following environment variables. Use `.env.local` for local development and configure them in your deployment environment (e.g., Vercel) for production.

```bash
# Supabase connection (Adapter needs URL & Service Role Key)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_project_jwt_secret # From Supabase Project Settings > API > JWT Settings

# Application URL (Ensure consistency)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Dev: http://localhost:3000, Prod: https://your-domain.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000 # Should match NEXT_PUBLIC_APP_URL
NEXTAUTH_SECRET=generate_a_strong_secret # Use `openssl rand -base64 32`

# OAuth Provider Credentials (Used by NextAuth API Route)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

See `.env.example` and `.env.production` for templates.

**Note:** While `GOOGLE_CLIENT_SECRET` and `TWITTER_CLIENT_SECRET` are listed, they are used server-side within the NextAuth API route (`app/api/auth/[...nextauth]/route.ts`) and ideally should not be exposed elsewhere in your Next.js environment variables if possible (depends on deployment platform capabilities).

### 2. Supabase Database Setup

The `@auth/supabase-adapter` automatically creates the necessary tables (`users`, `accounts`, `sessions`, `verification_tokens`) in your Supabase public schema if they don't exist.

However, if you previously created a `public.users` table for the Supabase Auth Helpers method, ensure its structure is compatible or consider removing it to let the adapter create its own.

*(Optional)* If you want to keep syncing `auth.users` to a `public.users` table (e.g., for RLS policies), ensure the trigger (`handle_new_user` from the old SQL script) is still in place or adapt it.

### 3. OAuth Provider Configuration (External)

**CRITICAL:** Configure the **Redirect URIs** (or Callback URLs) in your Google and Twitter developer consoles to point to the NextAuth.js callback handler:

*   **Google Cloud Console (OAuth 2.0 Client ID -> Authorized redirect URIs):**
    *   `http://localhost:3000/api/auth/callback/google`
    *   `https://your-production-domain.com/api/auth/callback/google`

*   **Twitter Developer Portal (Your App -> Authentication Settings -> Callback URLs):**
    *   `http://localhost:3000/api/auth/callback/twitter`
    *   `https://your-production-domain.com/api/auth/callback/twitter`

**Remove any old callback URLs** pointing to `/auth/callback` or Supabase's `/auth/v1/callback`.

## Authentication Flow

1.  User clicks "Sign In" (`signIn()` from `next-auth/react`).
2.  User is redirected to the selected provider (Google/Twitter).
3.  User authenticates with the provider.
4.  Provider redirects back to the NextAuth callback (`/api/auth/callback/[provider]`).
5.  The NextAuth API route (`app/api/auth/[...nextauth]/route.ts`) handles the code exchange, fetches/creates the user profile via the Supabase adapter, creates a session, and sets session cookies.
6.  User is redirected back to the application (usually the page they started from or the root).
7.  `useSession()` hook updates, and UI reflects the authenticated state.

## Usage

-   **Session Management:** Handled by `SessionProvider` (`app/layout.tsx`) and `useSession` hook.
-   **Sign In/Out:** Use `signIn()` and `signOut()` from `next-auth/react` (see `components/UserProfile.tsx`).
-   **Protected Routes:** Use the `AuthGuard` component (`components/auth-guard.tsx`), which uses `useSession` to check authentication status.

## Troubleshooting

-   **OAuth Errors (`redirect_uri_mismatch`, etc.):** Almost always an issue with the Redirect URIs configured in Google/Twitter not exactly matching the required NextAuth callback URLs (`/api/auth/callback/[provider]`). Check `.env` variables (`NEXTAUTH_URL`).
-   **Missing JWT Secret:** Ensure `SUPABASE_JWT_SECRET` is correctly set.
-   **Missing NextAuth Secret:** Ensure `NEXTAUTH_SECRET` is set.
-   **Database Issues:** Check Supabase logs if the adapter fails to write user/session data.
-   **Check Application Logs:** Look for errors in Vercel runtime logs or local terminal, especially from the `[...nextauth]` API route.
-   **Clear Cookies:** Always clear browser cookies after configuration changes.
