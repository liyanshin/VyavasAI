# VyavasAI (व्यवसAI) 🎙️🏪

> **A voice-first agentic operating system for Indian MSME shop owners (kirana stores)** to manage inventory, customer orders, and credit ledgers entirely through regional voice commands without typing or complex menu navigation.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-amber.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-Function_Calling-orange.svg)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📌 Repository Description

**VyavasAI (व्यवसAI)**: Voice-first agentic OS for Indian kirana stores supporting Marathi (Primary), Tamil, Hindi, and English. Powered by Google Gemini function calling for multi-step autonomous shop operations with live speech confidence scoring and a sleek black theme.

---

## 🌟 Key Features

### 1. 🗣️ Multilingual Voice Interface
- **Primary Language**: Marathi (`mr-IN`), with instant switching to Tamil (`ta-IN`), Hindi (`hi-IN`), and English (`en-IN`).
- Browser **Web Speech API** for live Speech-to-Text (`SpeechRecognition`) and spoken replies (`SpeechSynthesis`).
- Supports regional transliterated terms and code-mixed speech (e.g., *sakhar, tandul, tel, atta, dal, chai patti, bill, order, stock*).
- Text-input fallback for keyboard input or environments without microphone access.

### 2. 🎯 Speech Confidence Score Indicator
- Real-time speech accuracy meter positioned near the transcript bubble.
- Dynamic color-coded bar:
  - 🟢 **Green (≥ 80%)**: High clarity (*अचूक आवाज / स्पष्ट*)
  - 🟡 **Yellow (60%–79%)**: Moderate clarity (*मध्यम स्पष्टता*)
  - 🔴 **Red (< 60%)**: Low clarity (*अस्पष्ट / माईक जवळ बोला*)

### 3. 🤖 Autonomous Gemini Agent Loop
- Backend agent loop powered by Google's Gemini API with **structured function calling**.
- Executes 10 discrete in-app tools:
  1. `check_stock(item)`
  2. `update_stock(item, delta, reason)`
  3. `create_order(customer, items[{name, qty, unit}])`
  4. `add_to_customer_ledger(customer, amount, type: 'credit' | 'payment')`
  5. `get_sales_summary(period: 'today' | 'week' | 'month')`
  6. `get_customer_balance(customer)`
  7. `add_item(name, unit, price, qty)`
  8. `get_low_stock_items(threshold)`
  9. `record_expense(category, amount, note)`
  10. `record_payment(customer, amount)`

### 4. 🔍 Agent Transparency Panel
- Visual timeline displaying each tool call as it executes with a green checkmark (✅):
  > `Checked stock: Sugar 40 kg` ➔ `Order #ORD-1024 created: ₹225` ➔ `Stock updated: 35 kg (-5)` ➔ `Ramesh Udhaar +₹225`
- Collapsible panel with inspectable JSON parameters and return payloads for technical verification.

### 5. 📊 5 Real-Time Business Dashboard Tabs
- **Home**: Centered hero glowing mic, live transcript, conversation chat, confidence bar, and Agent Steps timeline.
- **Stock**: Inventory item cards, price per unit, stock progress bars, low-stock red badges, and quick `+ / -` adjustments.
- **Orders**: Chronological orders stream with item breakdown, customer name, total in ₹, and payment status badges.
- **Khata (Ledger)**: Customer credit ledger tracking outstanding udhaar, high-balance alerts, and quick payment recording.
- **Money**: Today's revenue, order counts, operating expenses, net profit, and an interactive 7-day sales bar chart.

### 6. 🌙 Black Theme with Seamless Switcher
- High-contrast obsidian black theme (`bg-black` / `bg-stone-950`) designed for low-light shop environments.
- Instant header toggle to switch between **Black Theme** and **Light Theme**.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Google Gemini API key ([Get one from Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/vyavasai.git
cd vyavasai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎙️ Demo Voice Commands to Try

| Language | Sample Voice Command | What the Agent Does |
| :--- | :--- | :--- |
| **Marathi (Primary)** | *"रमेशने ५ किलो साखर मागितली, ऑर्डर कर आणि स्टॉक अपडेट कर"* | Checks sugar stock, creates order for Ramesh, deducts 5 kg, adds ₹225 to Ramesh's Khata, and speaks confirmation in Marathi. |
| **Marathi** | *"आज किती कमाई झाली?"* | Calculates today's sales, order count, and net profit. |
| **Marathi** | *"सुरेशचा उधारी किती आहे?"* | Queries Suresh's pending khata balance. |
| **Marathi** | *"तांदूळ किती उरलाय?"* | Checks available rice quantity and rate in inventory. |
| **Tamil** | *"இன்னைக்கு எவ்வளவு விற்பனை ஆச்சு?"* | Fetches today's revenue and sales metrics in Tamil. |
| **Tamil** | *"ரமேஷ் 2 கிலோ சர்க்கரை கேட்டார், ஆர்டர் செய்"* | Creates sugar order for Ramesh and updates stock in Tamil. |
| **Hindi** | *"रमेश ने 5 किलो चीनी मांगी, ऑर्डर करो और स्टॉक अपडेट करो"* | Runs the multi-step order & inventory workflow in Hindi. |
| **English** | *"Ramesh wants 5 kg sugar, create order and update stock"* | Executes stock check, order creation, inventory deduction, and udhaar ledger update. |

---

## 📁 Project Structure

```
├── server.ts                 # Full-stack Express server with Gemini agent loop
├── index.html                # App entry with Devanagari & Tamil fonts
├── metadata.json             # AI Studio app metadata
├── package.json              # Project dependencies & scripts
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main application container with tab switching & theme state
│   ├── index.css             # Tailwind CSS & custom mic ripple animations
│   ├── types/
│   │   └── index.ts          # Core TypeScript interfaces (ShopState, Tools, Orders, etc.)
│   ├── data/
│   │   └── seedData.ts       # Preloaded kirana inventory, customers, & financial records
│   ├── utils/
│   │   ├── agentEngine.ts    # 10 discrete tool executors operating on shop state
│   │   ├── agentPlanner.ts   # Deterministic intent parser and agent workflow planner
│   │   ├── itemMatcher.ts    # Multilingual & transliteration matcher for regional goods
│   │   ├── speech.ts         # Web Speech API recognition, synthesis & chimes
│   │   └── translations.ts   # Multilingual UI strings (Marathi, Tamil, Hindi, English)
│   └── components/
│       ├── Header.tsx        # Top bar with branding, language picker & theme toggle
│       ├── HomeTab.tsx       # Hero mic button, live transcript, chat & sample chips
│       ├── ConfidenceIndicator.tsx # Color-coded speech recognition confidence meter
│       ├── AgentStepsPanel.tsx     # Transparent agentic tool execution timeline
│       ├── StockTab.tsx      # Inventory management cards with quick adjustments
│       ├── OrdersTab.tsx     # Customer receipts and order history
│       ├── KhataTab.tsx      # Customer udhaar (credit) ledger & payment recording
│       ├── MoneyTab.tsx      # Profit/loss analytics & 7-day interactive sales chart
│       ├── BottomNav.tsx     # Mobile-first navigation bar with counters
│       └── Toast.tsx         # Action feedback notifications
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, tsx
- **AI / Agent Engine**: Google Gemini API (`@google/genai`) with function calling
- **Voice Stack**: Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + Web Audio API synthesized chimes

---

## 📄 License

This project is licensed under the Apache License 2.0.
