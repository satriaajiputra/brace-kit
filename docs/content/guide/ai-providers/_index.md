+++
title = "AI Providers"
description = "Configure and switch between AI providers in BraceKit."
sort_by = "weight"
template = "section.html"
weight = 30

[extra]
category = "AI Providers"
+++

# AI Providers

BraceKit supports multiple AI providers, letting you switch between models instantly without leaving the sidebar. Each provider has its own configuration, and you can use multiple providers simultaneously.

## Supported Providers

| Provider | Type | Models | Special Features |
|----------|------|--------|------------------|
| **[OpenAI](/guide/ai-providers/openai/)** | Cloud | GPT-4o, o1, o3-mini | Reasoning models |
| **[Anthropic](/guide/ai-providers/anthropic/)** | Cloud | Claude 3.5, Claude 3 | Extended thinking |
| **[Gemini](/guide/ai-providers/gemini/)** | Cloud | Gemini 2.0, 1.5 Pro | Google Search, Image gen |
| **[xAI](/guide/ai-providers/xai/)** | Cloud | Grok-2 | Image generation |
| **[DeepSeek](/guide/ai-providers/deepseek/)** | Cloud | V3, R1 | Reasoning (R1) |
| **[Ollama](/guide/ai-providers/ollama/)** | Local | Any model | Offline, Private |
| **[Custom](/guide/ai-providers/custom/)** | Any | Any | OpenAI-compatible |

## Quick Setup

### Step 1: Open Settings

1. Click the **Settings** icon (⚙️) in the header
2. Navigate to **AI Provider** tab

### Step 2: Select Provider

Click on any provider card to select it. The card expands to show configuration options.

### Step 3: Enter API Key

Each provider requires an API key (except Ollama):

| Provider | Get API Key |
|----------|-------------|
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) |
| Gemini | [aistudio.google.com](https://aistudio.google.com) |
| xAI | [console.x.ai](https://console.x.ai) |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com) |

### Step 4: Select Model

Choose a model from the dropdown or type a custom model name.

### Step 5: Save

Click **Save** to store your configuration. The provider is now active.

## Switching Providers

To switch between configured providers:

1. Click the **provider button** in the input toolbar (e.g., "OpenAI ▾")
2. Select a different provider from the grid
3. Choose a model
4. Continue chatting — context is preserved

> **Note:** Your conversation context carries over when switching providers. The new provider sees the same message history.

## Provider Features

### Reasoning / Extended Thinking

Some models can show their reasoning process:

| Provider | Models | How to Enable |
|----------|--------|---------------|
| Anthropic | Claude | Click brain icon (🧠) |
| OpenAI | o1, o3 | Automatic |
| DeepSeek | R1 | Automatic |
| Ollama | With think mode | Click brain icon |

### Function Calling / Tools

Most models support tool calling for MCP and built-in tools:

| Provider | Tool Support |
|----------|--------------|
| OpenAI | ✅ Full |
| Anthropic | ✅ Full |
| Gemini | ✅ Full (some models limited) |
| xAI | ✅ Full |
| DeepSeek | ✅ Full |
| Ollama | ⚠️ Limited |

### Image Generation

Generate images directly in chat:

| Provider | Models | Aspect Ratios |
|----------|--------|---------------|
| Gemini | gemini-2.0-flash-exp-image | 1:1, 16:9, 9:16, etc. |
| xAI | grok-2-image | 1:1, 16:9, 9:16, etc. |

### Vision (Image Input)

Send images for analysis:

| Provider | Vision Models |
|----------|---------------|
| OpenAI | GPT-4o, GPT-4 Turbo |
| Anthropic | Claude 3.5, Claude 3 |
| Gemini | All Gemini models |
| xAI | Grok Vision |
| Ollama | llava, bakllava |

## API Key Security

Your API keys are:
- **Stored locally** in Chrome's extension storage
- **Encrypted** before storage
- **Never sent** to BraceKit servers
- **Only used** to authenticate with the AI provider

## Multiple API Keys

You can configure multiple providers simultaneously:

1. Set up OpenAI with your OpenAI key
2. Set up Anthropic with your Anthropic key
3. Set up Gemini with your Google key
4. Switch between them as needed

Each provider stores its own key independently.

## Custom Endpoints

For self-hosted or proxy services, use the **Custom** provider:

1. Select **Custom** from the provider list
2. Enter your base URL (e.g., `http://localhost:11434/v1`)
3. Enter an API key (or any placeholder for local services)
4. Select the format (OpenAI, Anthropic, Gemini, Ollama)

See the [Custom Provider guide](/guide/ai-providers/custom/) for details.

## Troubleshooting

### "No models available"

- Check your API key is valid
- Verify the API key has the right permissions
- Try typing a model name manually

### "API request failed"

- Check your internet connection
- Verify the API endpoint URL is correct
- Ensure your API key has sufficient credits

### "Model not responding"

- Some models (o1, o3) take longer to respond
- Check provider status pages for outages
- Try a different model

For more help, see the [Troubleshooting guide](/guide/reference/troubleshooting/).
