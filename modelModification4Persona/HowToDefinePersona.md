## 🍒 Cherry Assistant

Since you are using Ollama to run models like **Gemma 4** and **Qwen**, there are two primary ways to set a "persona": the **Modelfile** (permanent/dedicated) and the **System Prompt** (dynamic/session-based).

For your "Analyst" and "Coder" roles, I recommend the **Modelfile** approach because it allows you to create two distinct "specialist" models that you can call by name.

---

### Method 1: The `Modelfile` (Recommended for your Workflow)
This creates a custom version of a model that *always* behaves as the Analyst or Coder. You can create these once and then call them by name (e.g., `ollama run analyst-persona`).

**How to do it:**

1.  **Create a file** named `analyst.modelfile` (no extension needed).
2.  **Paste the following content** (using the Analyst persona we discussed):

```dockerfile
# Use the base model
FROM gemma4:12b-nvfp4-analyst

# Set parameters (from your Development Standard)
PARAMETER temperature 0.2
PARAMETER num_ctx 32768

# The Persona (System Prompt)
SYSTEM """
You are a Senior Software Architect and Product Strategist. Your goal is not to write code, but to ensure we are building the right thing for the right reasons. 

You must analyze every request through the 5-perspective lens:
1. Functional
2. User Experience
3. Business
4. Organizational
5. Social/Legal

Before suggesting a technical solution, explain the 'why' behind the decision. You are the primary author of Architecture Decision Records (ADRs). If a request has hidden complexity, you must flag it immediately.

Communication Style: Structured, analytical, and inquisitive. Use bullet points and Mermaid diagrams for clarity.
"""
```

3.  **Create the model** in your terminal:
    ```bash
    ollama create analyst-persona -f analyst.modelfile
    ```

4.  **Run it:**
    ```bash
    ollama run analyst-persona
    ```

*Repeat this process for the `coder.modelfile` using the Coder persona.*

---

### Method 2: The `system` Parameter (Dynamic Switching)
If you prefer to keep using the base models and just want to "switch" their personality during a conversation, you can pass a system prompt.

**In the CLI:**
When you run the model, you can't easily "inject" a system prompt via a simple flag in the standard `ollama run` command, but you can do it via the **API** or **Third-party GUIs** (like Cherry Studio).

**In Cherry Studio (or other GUIs):**
Most GUIs have a **"System Prompt"** or **"Instructions"** field in the Model Settings. 
1.  Go to the settings for the specific model (e.g., Gemma 4).
2.  Paste the Persona description into the **System Prompt** box.
3.  This will wrap every conversation with that persona.

---

### Summary Table: Which should you use?

| Feature | **Modelfile** (Method 1) | **System Prompt** (Method 2) |
| :--- | :--- | :--- |
| **Best for...** | Dedicated roles (Analyst, Coder) | General-purpose chat |
| **Persistence** | Permanent (Saved as a new model) | Session-based (Reset when you change it) |
| **Setup** | Requires a one-time `ollama create` | Easy to copy-paste in a UI |
| **Workflow** | **Recommended** for your "Thinking Trinity" | Better for quick, one-off questions |

### Pro-Tip for your Development Standard:
Since your standard mentions `num_ctx` and `temperature`, the **Modelfile** is superior because it allows you to hard-code those specific values (e.g., `PARAMETER temperature 0.2`) so the model never "drifts" into being too creative or too repetitive during an analysis.
