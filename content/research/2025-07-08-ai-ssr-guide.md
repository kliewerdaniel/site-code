---
book_reference: true
categories:
- AI Integration
- Tools & Integration
- Tutorial & Education
- Web Development
date: 2025-07-08 01:42:44 -0500
layout: post
tags:
- Next.js
- Server-Side Rendering
- LLM Integration
- OpenAI
- Ollama
- AI Development
- React
- Full-Stack Development
- API Routes
- getServerSideProps
title: 'Complete Guide: Building Server-Side Rendered AI Applications with Next.js
  and Large Language Models'
wiki_references: ["llama3", "local-inference", "ollama", "typescript"]
---
![Image](/images/ComfyUI_00204_.png)




# **Build a Server-Rendered AI-Powered Page with Next.js + LLMs**

---

## **🧠 Introduction: Build an AI-Powered Web App with Next.js and LLMs**

In this guide, you're going to build something small — but powerful. You'll create a simple Next.js web app that accepts a user's input, sends that input to a large language model (LLM) like OpenAI's GPT-4 or a local model like Ollama's LLaMA 3, and then returns and displays the AI's response — all rendered **server-side** for performance and SEO benefits.

We'll walk through the entire process step-by-step using **Next.js's Pages Router**, which provides a clear foundation for understanding **API Routes** and **getServerSideProps**, two of the most critical features for any full-stack React developer. These are the tools that allow you to combine frontend and backend logic in one codebase — and in this case, to integrate an LLM cleanly and efficiently.

Here's what you'll learn, fast and hands-on:

---

### **🔧 1. Setting Up the Project**

You'll start by bootstrapping a new Next.js app using create-next-app. We'll install only the minimal dependencies — axios for making API requests and dotenv to handle environment variables securely.

You'll learn the project structure up front and understand where your backend (API route) lives versus where your frontend page and form live. This gives you a mental model that carries into more complex projects.

---

### **🤖 2. Connecting to an LLM (OpenAI or Local)**

Next, you'll configure the app to work with **either OpenAI's GPT models** or **a local LLM using Ollama**. The guide will walk you through how to:

- Store your API key securely using .env.local
- Optionally run a local Ollama model (e.g., llama3) from your terminal
- Switch between OpenAI and Ollama with a simple flag in the code

This is your first real-world experience integrating AI into a web app — without needing a huge ML pipeline or model training knowledge.

---

### **🌐 3. Creating the Backend: An API Route**

You'll then write an API route in `/pages/api/generate.js`. This is a lightweight Node.js function that handles POST requests from the frontend.

- It will receive the user's prompt
- Forward it to the LLM (OpenAI or local)
- Return the AI's response back as JSON

You'll learn how to structure API endpoints in Next.js, handle HTTP methods and errors, and understand how backend logic in Next.js works — all in under 50 lines of code.

---

### **🧠 4. Building a Server-Side Rendered Page**

Now that you can get responses from an LLM, you'll connect it to a real webpage. Using getServerSideProps, you'll dynamically fetch the AI response **at the time of the request**. This means the AI's response is fully rendered on the server before reaching the browser — which is excellent for SEO, shareability, and page speed.

You'll learn how to:

- Read query parameters from the URL
- Trigger a server-side API call
- Pass the result to your React component as props
- Re-render the page with new data every time the user submits a new prompt

---

### **📝 5. Creating the Prompt Form**

Next, you'll build a simple React component: a text area and a button. When submitted, the form sends the user's prompt as a query parameter to the same page, triggering a new server-rendered request.

You'll learn how to:

- Use React state for form input
- Route programmatically using useRouter()
- Link frontend forms to backend API logic without ever needing client-side fetches

This form is basic — but it shows the foundation for much more advanced applications like AI chatbots, search engines, summarizers, and intelligent dashboards.

---

### **🧪 6. Running, Testing, and Expanding the App**

Once everything is wired up, you'll run the app with npm run dev and test it locally. You'll type prompts into your form and see responses from the AI rendered in real-time — server-side and fully integrated.

Finally, we'll close with some powerful ideas on how to expand the app:

- Adding streaming output from the LLM
- Upgrading to the App Router with React Server Components
- Adding markdown rendering or syntax highlighting
- Caching prompts and responses
- Securing the API with rate limits or tokens

---

## **📌 Why This Guide Matters**

This isn't just a toy demo. The pattern you'll learn here — **API route + SSR page + AI backend** — is the foundation for production-grade tools that use artificial intelligence in meaningful, high-performance ways.

By the end, you'll know how to:

✅ Build and run a modern full-stack React app

✅ Use server-side rendering to dynamically generate pages with AI content

✅ Integrate both cloud and local LLMs into your backend

✅ Build a lightweight interface to interact with AI in real time

Whether you're an indie hacker, startup founder, or developer just learning Next.js, this guide gives you a rock-solid template to build anything from blog post generators to AI tutors to productivity tools — all powered by large language models.

Let's get building.

---

## **🛠️ Part 1: Project Setup**

In this first step, we'll set up your development environment so that you're ready to build a complete SSR (server-side rendered) AI app using **Next.js** and integrate it with a large language model (LLM). We'll walk through creating a new project, selecting the right routing system, setting up your folders, and installing the dependencies you'll need.

---

### **1.1 Create the Next.js Project**

To begin, create a new Next.js project using the official starter tool:

```bash
npx create-next-app ai-ssr-guide
```

You'll be prompted with a few questions. When asked about the router, **choose the Pages Router**, not the App Router. This guide focuses on getServerSideProps and pages/api routes, which are most straightforward to learn using the Pages Router.

> ⚠️ If you accidentally select the App Router, you can still follow along — but paths like pages/index.js and pages/api/generate.js will need to be adjusted to the app/ directory structure.

After the install finishes, navigate into your new project folder:

```bash
cd ai-ssr-guide
```

---

### **📁 Project Folder Structure**

Before we move on, here's how the core structure of your project will look after you add a few files:

```
/ai-ssr-guide
│
├── /pages
│   ├── index.js              # Main SSR page
│   └── /api
│       └── generate.js       # API route to talk to the LLM
│
├── /components
│   └── PromptForm.js         # React form for user input
│
├── .env.local                # Secrets like API keys
├── package.json
└── next.config.js
```

This structure separates concerns:

- `/pages/index.js` renders the actual page using getServerSideProps
- `/pages/api/generate.js` contains the server function that queries the LLM
- `/components/PromptForm.js` holds the reusable form UI

---

### **1.2 Install Dependencies**

You'll only need two npm packages for this guide:

1. **axios** – To make HTTP requests to the LLM API
2. **dotenv** – To securely load your API keys from a .env.local file

Install them by running:

```bash
npm install axios dotenv
```

> 💡 dotenv is mostly for local development — Next.js will automatically load variables from .env.local into your code. Just make sure sensitive keys like OPENAI_API_KEY are never committed to GitHub.

---

✅ With that, your project is now set up and ready to go. In the next step, we'll configure your environment variables and get connected to an LLM like OpenAI or Ollama.

---

## **🤖 Part 2: Set Up the LLM API**

To generate AI-powered content in your Next.js app, you need to connect to a **Large Language Model (LLM)** backend. In this step, you'll choose between two options:

- **Option A**: Use OpenAI's GPT models via the cloud
- **Option B**: Use a fully local model via [Ollama](https://ollama.com), which runs LLMs like LLaMA 3 on your machine

Both options follow the same pattern — you'll send a prompt via an API request and receive generated text in response. The only difference is whether the model runs on a remote server (OpenAI) or on your local machine (Ollama).

---

### **🔐 Option A – OpenAI (Cloud)**

If you want quick access to the most powerful LLMs (like GPT-4 or GPT-3.5), OpenAI is the fastest way to start.

#### **✅ Step 1: Get an API Key**

- Visit [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
- Log in and create a new API key

> ⚠️ Treat this key like a password. Do **not** hardcode it into your app or expose it in the browser.

#### **✅ Step 2: Store Your Key in .env.local**

Create a `.env.local` file in the root of your project, and add:

```
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

This ensures that your API key is loaded securely into your server environment and not exposed on the client.

#### **✅ Step 3: Send Requests to OpenAI**

In your API route (we'll build it in the next step), you'll make a POST request to OpenAI's Chat API:

```
POST https://api.openai.com/v1/chat/completions
```

You'll provide the model (gpt-4 or gpt-3.5-turbo), and a prompt inside a messages array. You'll receive a text response in JSON format.

---

### **💻 Option B – Ollama (Local)**

If you prefer **running models locally**, Ollama is a fantastic tool. It allows you to download and run LLMs like LLaMA 3, Mistral, or Phi-3 without needing an API key or internet connection once installed.

#### **✅ Step 1: Install Ollama**

Download and install Ollama from:

👉 [https://ollama.com/download](https://ollama.com/download)

Follow the instructions for your operating system (macOS, Linux, or Windows).

#### **✅ Step 2: Run a Model (e.g., LLaMA 3)**

Once installed, open a terminal and run:

```bash
ollama run llama3
```

This will:

- Download the model if you haven't already (it may take a few minutes)
- Start a local LLM server on http://localhost:11434

You can test it by running:

```bash
curl http://localhost:11434/api/generate -d '{"model": "llama3", "prompt": "Hello!"}'
```

You should get a streaming or complete text response back.

#### **✅ Step 3: POST to Ollama from Your API Route**

You'll send requests to:

```
POST http://localhost:11434/api/generate
```

With a JSON body like:

```json
{
  "model": "llama3",
  "prompt": "Explain server-side rendering in Next.js"
}
```

Ollama runs entirely on your machine, so no API keys are needed. It's perfect for:

- Offline development
- Privacy-sensitive projects
- Avoiding API costs

---

### **🧠 Which Should You Use?**

| **Use Case** | **Choose** |
|---|---|
| You want the latest GPT-4 model | OpenAI |
| You want free, offline AI | Ollama |
| You care about response speed | Ollama (local = fast) |
| You need multilingual support or plugins | OpenAI |

---

✅ Once you've picked your backend, you're ready to wire it into your Next.js API route. In the next step, we'll build the `/api/generate` endpoint that takes in a prompt, calls your LLM, and returns the result to your frontend.

Let's build your AI brain! 🧠💻

---

## **📡 Part 3: Create API Route for LLM**

Now that you've chosen your language model (OpenAI or Ollama), it's time to create the **backend logic** that will talk to it.

In Next.js, API routes let you run server-side code just like a traditional Node.js server — but scoped to specific endpoints in your app. This is where we'll place our prompt-handling logic.

We'll now create an endpoint that:

- Accepts a POST request with a prompt string in the body
- Sends that prompt to the selected LLM (OpenAI or Ollama)
- Returns the generated response to the frontend

---

### **🔧 File: /pages/api/generate.js**

Create the file:

```
/pages/api/generate.js
```

Paste in the following code:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Toggle between OpenAI and Ollama here:
    const useOpenAI = true;

    let llmResponse = '';

    if (useOpenAI) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI');
      }

      llmResponse = data.choices[0].message.content;
    } else {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3', prompt }),
      });

      const data = await response.json();

      if (!data.response) {
        throw new Error('Invalid response from Ollama');
      }

      llmResponse = data.response;
    }

    res.status(200).json({ result: llmResponse });
  } catch (err) {
    console.error('Error generating LLM response:', err);
    res.status(500).json({ error: 'LLM failed to respond' });
  }
}
```

---

### **🔍 What This Code Does**

- ✅ Checks that the request method is POST. If not, it returns a 405 error.
- ✅ Reads the prompt string from the request body.
- ✅ Validates the prompt — if it's empty, it returns a 400 error.
- ✅ Chooses which backend to call (useOpenAI = true or false)
- ✅ Makes a POST request to the appropriate LLM endpoint:
  - OpenAI: uses your API key to hit the chat/completions endpoint
  - Ollama: uses your local server at http://localhost:11434/api/generate
- ✅ Extracts the response content from the JSON result
- ✅ Sends it back as `{ result: <text> }` to the frontend

---

### **🧠 Developer Notes**

- You can easily switch between OpenAI and Ollama by toggling the useOpenAI flag.
- This API route is never exposed to the browser — it only runs server-side.
- You can add rate limiting, prompt filtering, or logging here later as your app grows.

---

✅ At this point, your backend is fully wired to generate responses from an LLM. In the next part, we'll build the actual webpage that will render those responses server-side, using getServerSideProps.

Let's connect the brain to the page. 🧠➡️📄

---

## **🧠 Part 4: Create Server-Side Rendered Page**

Now that your backend API route is ready to talk to an LLM, it's time to render the results on your website — **server-side**.

In this step, you'll create a page at `/` that uses getServerSideProps, one of Next.js's built-in data-fetching functions, to generate the AI response **at the time of the request**. This gives you all the benefits of traditional server-rendered websites:

- Fast first loads
- Better SEO
- Easier sharing of dynamic, query-based pages

You'll also include a form that lets users submit their own prompts, dynamically updating the page with new LLM output on every request.

---

### **🔧 File: /pages/index.js**

Create or edit the file:

```
/pages/index.js
```

Paste the following code:

```javascript
import PromptForm from '../components/PromptForm';

export async function getServerSideProps(context) {
  const query = context.query.prompt || 'Explain server-side rendering in Next.js';

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: query }),
  });

  const data = await res.json();

  return {
    props: {
      initialPrompt: query,
      aiResponse: data.result || 'No response.',
    },
  };
}

export default function Home({ initialPrompt, aiResponse }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1>🧠 AI-Powered SSR Page</h1>
      <PromptForm defaultPrompt={initialPrompt} />
      <h2 style={{ marginTop: '2rem' }}>🧾 AI Response:</h2>
      <p>{aiResponse}</p>
    </main>
  );
}
```

---

### **🔍 What This Code Does**

#### **✅ getServerSideProps(context)**

- This function runs **on the server** every time someone requests the page.
- It looks for a query parameter called prompt in the URL (e.g., `/` or `/?prompt=What+is+Next.js`).
- If no prompt is given, it uses a default question: _"Explain server-side rendering in Next.js"_.
- It sends the prompt to your API route (`/api/generate`) via a POST request.
- It receives the AI's generated answer and passes it as a prop to the page.

#### **✅ The Page Component (Home)**

- Displays a form component for input (PromptForm)
- Shows the AI response in a readable format
- Renders everything server-side — meaning the user gets fully generated content in the initial HTML

---

### **🌐 How It Works End-to-End**

1. User visits `http://localhost:3000/?prompt=Write+a+poem+about+React`
2. getServerSideProps captures the prompt from the URL
3. Your API route sends the prompt to OpenAI or Ollama
4. The response is passed to your React component
5. The entire page is rendered and sent to the browser — **ready to go**, no client-side JavaScript required to fetch content

---

✅ You now have a fully functioning SSR page powered by an LLM. Next, we'll build the **form** that allows users to input prompts and trigger a full page refresh with new AI output.

Let's give the user a voice. 🗣️✍️

---

## **💬 Part 5: Create the Prompt Form**

Now it's time to let users interact with your AI-powered SSR page by submitting their own prompts.

In this step, you'll build a simple React component that accepts user input and updates the page by changing the URL's query parameter. That query will trigger getServerSideProps on the next request, fetch a new response from the LLM, and render fresh content on the server — no client-side fetches required.

This keeps the UX seamless while benefiting from full server-side rendering.

---

### **🔧 File: /components/PromptForm.js**

Create the file:

```
/components/PromptForm.js
```

Then paste in the following code:

```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PromptForm({ defaultPrompt }) {
  const [prompt, setPrompt] = useState(defaultPrompt || '');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="prompt" style={{ display: 'block', marginBottom: '0.5rem' }}>
        Enter a prompt for the AI:
      </label>
      <textarea
        id="prompt"
        rows="4"
        cols="60"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask me something like: 'Summarize the concept of server-side rendering'"
        style={{
          fontSize: '1rem',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          width: '100%',
          maxWidth: '600px',
        }}
      />
      <br />
      <button
        type="submit"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Generate
      </button>
    </form>
  );
}
```

---

### **🔍 What This Code Does**

- `useState(defaultPrompt)`: Initializes the prompt state with whatever was rendered by getServerSideProps
- `useRouter()`: Gives access to the Next.js router
- `handleSubmit`: Prevents default form submission, and instead uses `router.push()` to update the URL query string (`/?prompt=...`)
- Triggers a full server-side refresh, sending the new prompt to the backend and returning a fresh AI-generated response

---

### **💡 Why Use Query Parameters?**

Using the query string (`/?prompt=...`) to pass user input:

- Keeps your app stateless and URL-driven
- Triggers SSR on every page load — so the AI response is always fresh
- Makes pages shareable/bookmarkable (e.g., share a URL to a specific AI answer)
- Keeps the UX clean with no client-side fetch logic needed

---

✅ With this form connected, your app is now fully interactive. Visitors can ask questions, trigger server-side AI generation, and see intelligent results rendered instantly on the page — all using standard Next.js patterns.

---

## **⚙️ Part 6: Environment Variables**

Create a `.env.local` file in your project root with:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## **🧪 Part 7: Test Your Project**

Now that your app is fully wired up, it's time to see it in action!

### **Run the development server:**

```bash
npm run dev
```

### **Open your browser and visit:**

[http://localhost:3000](http://localhost:3000)

### **Try typing prompts like:**

- "What is server-side rendering?"
- "Explain quantum computing to a child"
- "Generate a startup idea in 2025"

Each submission will reload the page with your prompt in the URL, triggering server-side rendering with fresh AI-generated content.

---

## **🧱 Optional Add-Ons / Expansions**

Once you're comfortable with the basics, here are some ideas to take your project further:

- 💡 **Switch to Next.js App Router**
  Use the new App Router and generateMetadata or React Server Components for more modern data fetching and SEO.

- 🧠 **Add Streaming AI Responses**
  Implement Server-Sent Events (SSE) or React Suspense for live streaming of LLM outputs.

- 🖼️ **Add AI Image Generation**
  Integrate APIs like OpenAI's DALL·E or Stability AI to generate images alongside text.

- 🧾 **Cache Previous Results**
  Store responses in memory or on disk to speed up repeated queries and reduce API costs.

- 🔐 **Add Rate Limiting**
  Protect your API route from abuse with basic rate limiting or IP throttling.

- 🧪 **Write Unit Tests**
  Add tests for your API route to ensure reliability and ease future refactors.

---

## **🧠 Closing Thoughts**

Congratulations! Here's a quick recap of what you learned:

- How to build a dynamic, server-side rendered Next.js page powered by AI
- How to create API routes that integrate with large language models (OpenAI or Ollama)
- How to handle query parameters and React forms for user input
- Why combining SSR with AI yields fast, SEO-friendly, and intelligent web apps

This pattern is a solid foundation for countless projects — from chatbots and tutoring apps to content generators and intelligent dashboards.

As you continue your AI development journey, consider exploring:

- Building chat interfaces with conversation memory
- Adding markdown or rich text rendering for better UX
- Creating summarization or translation tools
- Combining multiple AI modalities (text, images, speech)

Thank you for following along — happy coding and AI-building! 🚀
