# Crypto Trading Analytics Dashboard

A comprehensive dashboard for analyzing cryptocurrency trading data, with Supabase integration for data storage and retrieval.

![Dashboard Preview](/placeholder.svg?height=400&width=800)

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
