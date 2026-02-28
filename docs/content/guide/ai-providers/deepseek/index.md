+++
title = "DeepSeek"
description = "Configure DeepSeek models in BraceKit."
weight = 35
template = "page.html"

[extra]
category = "AI Providers"
+++

# DeepSeek

DeepSeek offers powerful models at competitive prices, including DeepSeek-R1 for advanced reasoning.

## Setup

### 1. Get an API Key

1. Go to [platform.deepseek.com](https://platform.deepseek.com)
2. Sign in or create an account
3. Navigate to API Keys
4. Create a new key

### 2. Configure in BraceKit

1. Open **Settings → AI Provider**
2. Select **DeepSeek**
3. Paste your API key
4. Select a model
5. Click **Save**

## Available Models

| Model | Best For | Context | Notes |
|-------|----------|---------|-------|
| **deepseek-chat** | General use | 64K | Main chat model |
| **deepseek-reasoner** | Complex reasoning | 64K | R1 reasoning model |

## Features

### Reasoning (DeepSeek-R1)

The `deepseek-reasoner` model shows its thinking process:

```
┌─────────────────────────────────────┐
│ 🧠 Thinking...                    ▾ │
├─────────────────────────────────────┤
│ Let me analyze this problem...      │
│                                     │
│ Step 1: Identify the key variables  │
│ Step 2: Consider edge cases         │
│ Step 3: Formulate solution          │
└─────────────────────────────────────┘

Based on my analysis...
```

This happens automatically with the reasoner model.

### Function Calling

DeepSeek supports tool calling for:
- MCP server tools
- Built-in tools (Google Search)

### Cost-Effective

DeepSeek offers very competitive pricing while maintaining high quality.

## Model Parameters

Configure in **Settings → Chat**:

| Parameter | Range | Effect |
|-----------|-------|--------|
| **Temperature** | 0-2 | Higher = more creative |
| **Max Tokens** | 1-64K | Maximum response length |

### Recommended Settings

| Use Case | Model | Temperature |
|----------|-------|-------------|
| Code generation | deepseek-chat | 0.3 |
| General chat | deepseek-chat | 0.7 |
| Complex reasoning | deepseek-reasoner | 0.5 |
| Math/Logic | deepseek-reasoner | 0.0 |

## Pricing

DeepSeek offers very competitive pricing:

| Model | Input (per 1M) | Output (per 1M) |
|-------|----------------|-----------------|
| deepseek-chat | $0.27 | $1.10 |
| deepseek-reasoner | $0.55 | $2.19 |

> **Note:** Check [DeepSeek pricing](https://platform.deepseek.com/api-docs/pricing) for current rates.

## Troubleshooting

### "Rate limit exceeded"

- Wait a moment and retry
- Check your usage limits in the console

### Reasoning not showing

- Ensure you're using `deepseek-reasoner`
- Some queries may not trigger extended reasoning

### Slow responses

- The reasoner model takes longer to "think"
- For faster responses, use `deepseek-chat`

## Related

- [OpenAI](/guide/ai-providers/openai/) — Alternative with reasoning models
- [Anthropic](/guide/ai-providers/anthropic/) — Alternative with extended thinking
- [Ollama](/guide/ai-providers/ollama/) — Free local alternative
