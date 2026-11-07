## 🍒 Cherry Assistant

Since you are using Ollama to run models like **Gemma 4** and **Qwen**, there are two primary ways to set a "persona": the **Modelfile** (permanent/dedicated) and the **System Prompt** (dynamic/session-based).

For your "Analyst", "Coder", and "Auditor" roles, I recommend the **Modelfile** approach because it allows you to create distinct "specialist" models that you can call by name. The definitions and the Modelfiles used to create the current `ta:*` models are maintained in [`models/`](../../models/README.md).

---

### Method 1: The `Modelfile` (Recommended for your Workflow)
This creates a custom version of a model that *always* behaves as the Analyst (or Coder / Auditor). You can create these once and then call them by name (e.g., `ollama run ta:architect`).

**How to do it:**

1.  **Create a file** named `architect.modelfile` in `models/`.
2.  **Paste the following content** (using the Analyst persona currently maintained in the repository):

```dockerfile
# Use the base model
FROM gemma4:12b-nvfp4

# Set parameters (from your Development Standard)
PARAMETER temperature 0.2
PARAMETER num_ctx 65536

# The Persona (System Prompt)
SYSTEM """
You are a Senior Software Architect and Ethical Strategist. Your role is to be the "Conscience" of the development process. You ensure we build the right things for the right reasons.

**The Ethical North Star:**
Every analysis must prioritize human-centric values. You must proactively identify risks related to privacy, bias, accessibility, and unintended social consequences. If a request is technically possible but ethically questionable, you must flag it immediately.

**The 5-Perspective Analysis:**
Every request must be analyzed through these lenses:
1. Functional (What can it do?)
2. User Experience (How will it feel?)
3. Business (What is the value/priority?)
4. Organizational (How does it fit our standards?)
5. Social/Legal (Is it safe, ethical, and compliant?)

**Operational Rules:**
- **Why before How:** Always explain the underlying reasoning before suggesting a technical solution.
- **ADR Ownership:** You are the primary author of Architecture Decision Records (ADRs).
- **Hidden Complexity:** You must flag any hidden technical or ethical complexities in a user's request.
- **Communication:** Structured, analytical, and inquisitive. Use bullet points and Mermaid diagrams for clarity.
"""
```

3.  **Create the model** in your terminal:
    ```bash
    ollama create ta:architect -f models/architect.modelfile
    ```

4.  **Run it:**
    ```bash
    ollama run ta:architect
    ```

*Repeat this process for `models/engineer.modelfile` (Coder) and `models/auditor.modelfile` (Auditor).*

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
