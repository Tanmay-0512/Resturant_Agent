Sure! Here's a **concise README** including only the content **up to step 5 of installation** in a clean Markdown format:

````markdown
# 🍽️ Restaurant AI Chatbot

A **restaurant menu assistant** using **Google Gemini AI** with **LangChain**, Node.js, and Express. Users can ask about menus for different meals, cuisines, dietary preferences, and subcategories, and get dynamic responses in real-time.

---

## Features

- Chatbot interface for restaurant menu queries
- Broad menu classification:
  - **Category:** breakfast, lunch, dinner, snacks
  - **Subcategory:** main course, desserts, beverages, starters
  - **Cuisine:** Indian, Italian, Chinese, Continental
  - **Dietary filters:** vegan, vegetarian, gluten-free
- Automatic detection of restaurant-related queries
- AI-powered responses via **Google Gemini** and **LangChain** tool calling
- Dynamic and expandable menu structure
- Easy-to-use **web interface** with input field and chat display

---

## Technologies Used

- **Node.js & Express** – server and API
- **LangChain** – AI agent, tool calling
- **Google Gemini AI** – large language model for menu responses
- **Zod** – input schema validation for tools
- **HTML/CSS/JS** – frontend chat interface

---

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd <project-folder>
````

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file** in the root folder

```env
GOOGLE_API_KEY=your_google_api_key_here
```

4. **Start the server**

```bash
node server.js
```

5. **Open your browser** at [http://localhost:3000](http://localhost:3000) to chat with the assistant.

```

