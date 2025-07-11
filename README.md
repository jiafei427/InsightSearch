# InsightSearch 🔍

**InsightSearch** is an advanced, responsive web application designed to help users **search, visualize, and analyze CSV data** using modern similarity algorithms. With support for **semantic search**, **multi-file uploads**, **custom relevance weighting**, and a **rich UI/UX**, InsightSearch is your smart assistant for navigating complex CSV datasets.

---

## 🌟 Features

### 🔄 File Upload & Validation
- Upload one or **multiple CSV files** at once.
- Validate files for required fields (e.g., `Title`, `Description`).
- Provide detailed feedback on invalid or incomplete files.

### 🔍 Intelligent Search Engine
- Enter **natural language queries** to find relevant rows from your data.
- Choose between **TF-IDF** (simple) or **BERT-based embeddings** (advanced) for similarity matching.
- Customize column relevance (e.g., prioritize `Title` over `Description`).
- Support for **English** and **Korean** search queries and interface.

### 📊 Visualization Dashboard
- View auto-generated **charts** and **graphs** like:
  - Pie chart of `Priority`
  - Bar chart of `Status`
  - Timeline of `Created Date`

### 🧠 Auto Tagging & Grouping
- Automatically generate intelligent **tags** for each row (e.g., `#login-error`, `#UI-issue`).
- Group similar issues by topic, status, or priority.

### ⚙️ Advanced Search Options
- **Multi-column search** (e.g., Title-only, Assignee-only).
- **Boolean search**: AND, OR, quoted phrases.
- **Fuzzy search** for typo tolerance.
- **Dynamic filters**: by `priority`, `status`, `assignee`, or `date`.

### 💡 UI/UX Enhancements
- **Responsive Design** (Mobile + Desktop friendly).
- Switch between **Card** and **Table (Grid)** views.
- **Resizable, sortable, and rearrangeable** result columns.
- **Dark Mode** toggle support.
- Highlight matched keywords in results.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

```bash
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

---

## 💻 Technologies Used

This project is built with:

- [**Vite**](https://vitejs.dev/) – Lightning-fast frontend build tool
- [**TypeScript**](https://www.typescriptlang.org/) – Strongly typed JavaScript
- [**React**](https://reactjs.org/) – UI library for building components
- [**shadcn/ui**](https://ui.shadcn.com/) – Beautifully designed accessible components
- [**Tailwind CSS**](https://tailwindcss.com/) – Utility-first CSS framework

---

## 🌐 Multilingual Support

- The website supports **both Korean and English**.
- Easily switch languages via a language selector.

---

## 📦 Future Improvements (Ideas)
- CSV-to-JSON Export for filtered results.
- Integration with APIs (e.g., bug tracker or GitHub issues).
- User accounts and saved searches.

---

## 📣 Contribute

Got ideas or improvements? Contributions are welcome!

---

## 📄 License

MIT License – feel free to use, modify, and distribute.

---

> Created with 💡 + 🤖 – Prompt-engineered AI meets powerful modern web stack.

