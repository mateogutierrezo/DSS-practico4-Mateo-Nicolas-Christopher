# MedSys Dashboard Demo

A Vite-powered React + Tailwind CSS demo for a medical system, with auth, dashboard, clinical records (paginated & filterable), and invoices.

---

## 1. Scaffold and Initialize

```bash
# 1. Scaffold new Vite React app
npm create vite@latest medical-dashboard-demo -- --template react

cd medical-dashboard-demo

# 2. Install runtime dependencies
npm install axios react-router-dom react-icons

# 3. Install & configure Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Add the following to `tailwind.config.js`:
#    content: ['./index.html','./src/**/*.{js,jsx}']

# 5. Create `src/index.css` with:
#    @tailwind base;
#    @tailwind components;
#    @tailwind utilities;

# 6. Install the React plugin for Vite (if not already):
npm install -D @vitejs/plugin-react
