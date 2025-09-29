````markdown
# 🍽️ Restaurant AI Chatbot

A **restaurant menu assistant** powered by **Google Gemini AI** and **LangChain**, built with **Node.js** and **Express**.  
Users can ask about food menus based on meal types, cuisines, dietary choices, or subcategories — and get instant AI-powered responses.

---

## 🚀 Features

✅ Chat-based restaurant query system  
✅ Broad classification support:

| Type          | Options                                                           |
|---------------|-------------------------------------------------------------------|
| **Category**   | Breakfast, Lunch, Dinner, Snacks                                  |
| **Subcategory**| Main Course, Desserts, Beverages, Starters                        |
| **Cuisine**    | Indian, Italian, Chinese, Continental                             |
| **Dietary**    | Vegan, Vegetarian, Gluten-Free                                    |

✅ Smart filtering — rejects unrelated questions  
✅ AI-powered responses using **LangChain Tool Calling + Gemini**  
✅ Modular & easily expandable menu structure  
✅ Simple **Web UI with chat interface**

---

## 🧠 AI Architecture — How LLM & Tools Work Together

```mermaid
flowchart TD

A[User Input] --> B[Express Backend / API]
B --> C[Check if Query is Food/Restaurant Related]
C -->|Not Related| D[Return "Only food-related queries allowed"]

C -->|Related| E[LangChain AgentExecutor]
E --> F[Gemini LLM]
F --> G{Should Call Tool?}

G -->|Yes| H[Dynamic Menu Tool (getMenuTool)]
H --> I[Return Menu Response]

G -->|No| J[Fallback AI Response]

I --> K[Send Chat Response to Frontend]
J --> K
````

---

## 🛠️ Tech Stack

| Layer      | Technology Used                 |
| ---------- | ------------------------------- |
| Backend    | Node.js, Express                |
| AI Core    | LangChain Agent + Google Gemini |
| Validation | Zod                             |
| Frontend   | HTML / CSS / JavaScript         |

---

## 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Add Environment Variables

Create a `.env` file in the root folder:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

### 4️⃣ Start the Server

```bash
node server.js
```

### 5️⃣ Open in Browser

Visit 👉 **[http://localhost:3000](http://localhost:3000)** to start chatting with your AI assistant.

```
