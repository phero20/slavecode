export interface LlmStep {
  provider: "groq" | "gemini";
  model: string;
}

export const AI_CONFIG = {
  // Speed-first: AI Code Evaluation & Judge
  order1: [
    // 1. Primary: Groq Flagship MoE (~500ms latency, pooled across keys)
    { provider: "groq", model: "openai/gpt-oss-120b" },

    // 2. Google Primary: Gemini 3.6 Flash (~3.0s latency, smart Gemini 3 reasoning)
    { provider: "gemini", model: "gemini-3.6-flash" },

    // 3. Fast Google Fallback: Gemini 2.5 Flash (~1.3s latency, zero queue)
    { provider: "gemini", model: "gemini-2.5-flash" },

    // 4. Groq Alternative: Qwen 3.8 27B (fast open-weights reasoning)
    { provider: "groq", model: "qwen/qwen3.8-27b" },

    // 5. Deep Intelligence Reserve: Gemini 3.8 Flash (called only if earlier models fail)
    { provider: "gemini", model: "gemini-3.8-flash" },

    // 6. Emergency Last-Resort: Groq Fast MoE (~200ms, 1,000 tokens/sec fail-safe)
    { provider: "groq", model: "openai/gpt-oss-20b" },
  ] as LlmStep[],

  // Reasoning-first: System Design & Canvas Diagrams
  order2: [
    // 1. Primary: Gemini 3.6 Flash (~3.0s, best architectural reasoning & schemas)
    { provider: "gemini", model: "gemini-3.6-flash" },

    // 2. High-Capacity Groq: OpenAI GPT-OSS 120B (~500ms, 117B MoE)
    { provider: "groq", model: "openai/gpt-oss-120b" },

    // 3. Fast Google Fallback: Gemini 2.5 Flash (~1.3s, rock-solid stability)
    { provider: "gemini", model: "gemini-2.5-flash" },

    // 4. Groq Alternative: Qwen 3.8 27B (multimodal / structural reasoning)
    { provider: "groq", model: "qwen/qwen3.8-27b" },

    // 5. Deep Intelligence Reserve: Gemini 3.8 Flash (called only if earlier models fail)
    { provider: "gemini", model: "gemini-3.8-flash" },

    // 6. Emergency Last-Resort: Groq Fast MoE (~200ms, 1,000 tokens/sec fail-safe)
    { provider: "groq", model: "openai/gpt-oss-20b" },
  ] as LlmStep[],
};
