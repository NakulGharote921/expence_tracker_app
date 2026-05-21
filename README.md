# 💰 Expense Tracker App

A modern and responsive **Personal Expense Tracker** built with **React + Vite** that helps users manage daily expenses with live currency conversion support.

This project focuses on:

* Clean frontend architecture
* Reusable React components
* Responsive UI/UX
* Real-world state management
* API integration
* Graceful loading/error handling

---

# 🚀 Features

## ✅ Core Functionality

### Add Expenses

Users can:

* Enter expense name
* Enter amount
* Select category

Supported categories:

* Food
* Travel
* Marketing
* Utilities
* Other

Validation includes:

* Empty field prevention
* Positive numeric amount validation
* Automatic form reset after submission

---

### Expense Management

Display expenses in a modern card/list layout.

Each expense contains:

* Expense name
* Category
* Amount
* Delete button

Features:

* Instant UI updates
* Smooth hover effects
* Empty state handling

---

### Running Total

Automatically calculates and updates:

* Total expenses amount

The summary section is visually highlighted for better user experience.

---

### Category Breakdown

Dynamically groups expenses by category.

Example:

* Food: $120
* Travel: $45
* Utilities: $80

Features:

* Real-time calculations
* Clean responsive layout
* Ignores empty categories

---

### 🌍 Live Currency Conversion

Integrated with a public exchange-rate API.

Supported currencies:

* USD
* EUR
* GBP
* INR
* JPY

Features:

* Real-time conversion
* Currency dropdown selector
* Loading states
* API error handling
* Graceful fallback UI

Example:
Total in EUR: €245.32

---

# 🛠️ Tech Stack

* React
* Vite
* JavaScript
* React Hooks (`useState`, `useEffect`)
* CSS / Tailwind CSS
* Public Currency Exchange API

---

# 📁 Project Structure

```bash
src/
│
├── components/
│   ├── Header/
│   ├── ExpenseForm/
│   ├── ExpenseList/
│   ├── ExpenseCard/
│   ├── SummaryPanel/
│   ├── CategoryBreakdown/
│   └── CurrencyConverter/
│
├── services/
│   └── currencyApi.js
│
├── styles/
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# ⚙️ Run Locally

## Prerequisites

Make sure you have installed:

* Node.js
* npm

---

## Installation

Clone the repository:

```bash
git clone https://github.com/NakulGharote921/Expence-Tracking-app.git
```

Go to the project directory:

```bash
cd Expence-Tracking-app
```

Install dependencies:

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env.local` file in the root directory.

Example:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

---

# ▶️ Start Development Server

```bash
npm run dev
```

The app will run locally on:

```bash
http://localhost:5173
```

---

# 🎯 Focus Areas

This project was built with a frontend engineering mindset:

* Clean and modular architecture
* Reusable components
* Responsive mobile-first design
* Thoughtful spacing and typography
* Graceful loading/error states
* Smooth interactions and transitions
* Production-style UI patterns

---

# 📱 Responsive Design

The application is fully responsive across:

* Mobile devices
* Tablets
* Desktop screens

Responsive improvements include:

* Flexible layouts
* Adaptive typography
* Mobile-friendly spacing
* Overflow prevention
* Optimized card stacking

---

# 🔄 State Management

This project uses only:

* `useState`
* `useEffect`

No external state management libraries were used.

---

# 🌐 API Integration

Currency conversion is powered using a free public API such as:

* Frankfurter API
* ExchangeRate API

The app:

* Fetches live exchange rates
* Updates conversion dynamically
* Handles API loading/errors safely

---

# 🧩 Component Architecture

The app follows a reusable component-based structure.

Main components:

* `Header`
* `ExpenseForm`
* `ExpenseList`
* `ExpenseCard`
* `SummaryPanel`
* `CategoryBreakdown`
* `CurrencyConverter`

Benefits:

* Better maintainability
* Easier scalability
* Cleaner separation of concerns

---

# ✨ Bonus Features (Optional)

Possible future improvements:

* LocalStorage persistence
* Edit expense functionality
* Dark/light mode
* Search expenses
* Category filters
* Charts with Recharts
* Toast notifications
* Skeleton loaders
* Form animations

---

# 📌 Important

This project is designed to demonstrate:

* Frontend development skills
* UI/UX thinking
* Clean React practices
* Responsive implementation
* Real-world application structure

The goal was not just to build functionality, but to create a polished and production-ready user experience.

---

# 📄 License

This project is open source and available under the MIT License.
