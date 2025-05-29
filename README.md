👕 What 2 Wear – AI Clothing Advice App

A React application that uses ChatGPT and a weather API to give you advice on what to wear. By uploading a favorites file, the advice becomes personal and realistic.

---

## 🚀 Features

* 🌦️ AI-generated advice based on live weather in a specified city
* 👕 Upload your favorite clothing items as a JSON file
* 🧠 ChatGPT combines your favorites and weather data for tailored advice
* ⏱️ Streaming output: responses appear word by word
* 💬 React chat interface with dynamic messages

---

## 🛠️ Installation Instructions

### 1. Clone the repository

```bash
git clone https://github.com/SuhailSakhi/what2wear-app.git
cd what2wear-app
```

### 2. Install dependencies

For the frontend (React):

```bash
npm install
```

For the backend (Node/Express):
If your backend is in the same folder:

```bash
npm install
```

Or navigate to your backend folder and run `npm install` there.

---

### 3. Create a `.env` file

Create a `.env` file in the root of your backend project with:

```env
OPENAI_API_KEY=sk-...
WEATHER_API_KEY=...
```

If you are using Azure OpenAI, also include:

```env
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_INSTANCE_NAME=...
AZURE_OPENAI_API_DEPLOYMENT_NAME=...
```

---

### 4. Start the servers

Start the backend:

```bash
node server.js
```

Start the frontend:

```bash
npm run dev
```

Or use Vite, depending on your setup.

---

📁 Upload your favorites file
You can upload a file like this using the upload button in the app:

```json
{
  "tops": ["T-shirt", "Hoodie"],
  "bottoms": ["Jeans", "Shorts"],
  "outerwear": ["Windbreaker", "Jacket"],
  "footwear": ["Sneakers", "Boots"]
}
```

Make sure the file is named `favorites.json`.

---

📌 Known Issues

* ⏳ React blocks new input while an AI response is streaming
* 📉 Streaming may feel slow during long responses
* 🌍 WeatherAPI may have daily request limits

MIT License
