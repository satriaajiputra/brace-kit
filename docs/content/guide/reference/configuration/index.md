+++
title = "Configuration"
description = "Complete guide to all BraceKit settings."
weight = 51
template = "page.html"

[extra]
category = "Reference"
+++

# Configuration

This guide covers all BraceKit settings and how to configure them.

## Accessing Settings

1. Click the **Settings** icon (⚙️) in the header
2. Navigate between tabs:
   - **AI** — Provider and model settings
   - **Chat** — Chat behavior
   - **Compact** — Auto-compact settings
   - **Memory** — Memory system
   - **MCP** — MCP servers
   - **Data** — Import/export
   - **Safety** — Security settings

---

## AI Provider Settings

Configure your AI providers and API keys.

### Provider Selection

Select from available providers:
- OpenAI
- Anthropic (Claude)
- Google Gemini
- xAI (Grok)
- DeepSeek
- Ollama
- Custom

### API Key

Enter your API key for each provider:
- Keys are stored encrypted
- Never sent to BraceKit servers
- Unique per provider

### Model Selection

Choose a model:
- Select from dropdown (fetched automatically)
- Or type a model name manually

### Custom Providers

Add custom OpenAI-compatible endpoints:
- **Name**: Display name
- **Base URL**: API endpoint
- **API Key**: Authentication (if needed)
- **Format**: OpenAI, Anthropic, Gemini, or Ollama

---

## Chat Settings

Control chat behavior.

### System Prompt

Default:
```
You are BraceKit, a helpful AI assistant. When the user shares
page content or selected text, help them understand and work
with it. Be concise and helpful.
```

Customize for:
- Response style
- Domain expertise
- Output format

### Temperature

| Value | Behavior |
|-------|----------|
| 0.0 | Deterministic, consistent |
| 0.3 | Conservative, factual |
| 0.7 | Balanced (default) |
| 1.0 | Creative, varied |
| 2.0 | Maximum randomness |

### Max Tokens

Maximum response length:
- Leave blank for provider default
- Higher = longer responses
- Affects API costs

### Streaming

- **Enabled** (default): Responses appear token-by-token
- **Disabled**: Wait for complete response

### Google Search Tool

Enable for non-Gemini providers:
- Requires Google API key
- AI can search the web
- Results included in context

---

## Compact Settings

Configure auto-compact behavior.

### Enable Auto-Compact

- **On**: Automatically summarize long conversations
- **Off**: Manual compact only

### Threshold

Percentage of context window to trigger compact:
- **80%**: More frequent compacts
- **90%**: Balanced (default)
- **95%**: Less frequent

### Context Window

Set to match your model:

| Model | Tokens |
|-------|--------|
| GPT-4o | 128000 |
| Claude 3.5 | 200000 |
| Gemini 1.5 Pro | 2000000 |
| Ollama | Varies |

### Summary Prompt

Custom instructions for summarization:
```
Summarize the conversation, preserving:
- Key decisions
- Code snippets
- Important conclusions
```

---

## Memory Settings

Configure the memory system.

### Enable Memory

- **On**: Extract and store memories
- **Off**: No persistent memory

### Categories

Toggle categories to remember:
- Personal
- Goals
- Interests
- Expertise
- Preferences
- Style
- Habits
- Context
- Dislikes

### Max Memories

Maximum memories to store (default: 100).

### Sampling

Memories to inject per conversation:
- Conservative: 3-5
- Balanced: 5-10
- Comprehensive: 10-20

---

## MCP Server Settings

Manage MCP servers.

### Server List

View connected servers:
- Status indicator
- Available tools
- Logs

### Add Server

Configure new servers:
- Name
- Command
- Arguments
- Environment variables

### Server Configuration

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@scope/server-package"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

---

## Data Settings

Manage your data.

### Export

Export all data:
- Conversations (JSON)
- Settings
- Memories

### Import

Import previously exported data.

### Clear Data

Remove all data:
- Conversations
- Settings
- API keys
- Memories

> **Warning**: This cannot be undone.

---

## Safety Settings

Security and PIN protection.

### Enable PIN Lock

Set a 4-8 digit PIN:
- Required to open sidebar
- Protects API keys
- Protects conversations

### PIN Timeout

Auto-lock after inactivity:
- Immediate
- 5 minutes
- 15 minutes (default)
- 30 minutes
- Never

### Change PIN

Update your PIN:
1. Enter current PIN
2. Enter new PIN
3. Confirm

---

## Preferences

Display preferences.

### Tool Message Display

How tool calls appear:
- **Detailed**: Full arguments and results
- **Compact**: Minimal display

### Text Selection UI

- **Enable**: Show quick actions on selection
- **Minimum length**: Characters needed to trigger

---

## Model Parameters

Provider-specific parameters.

### Ollama-Specific

| Parameter | Description |
|-----------|-------------|
| `num_ctx` | Context window size |
| `num_predict` | Max tokens |
| `keep_alive` | Model keep-alive time |
| `min_p` | Minimum probability |

### Accessing

Some parameters available in Settings → Chat → Model Parameters.

---

## Storage Locations

Where data is stored:

| Data | Location |
|------|----------|
| Settings | chrome.storage.local |
| API Keys | chrome.storage.local (encrypted) |
| Conversations | IndexedDB |
| Images | IndexedDB |
| Memories | chrome.storage.local |

---

## Related

- [Keyboard Shortcuts](/guide/reference/shortcuts/)
- [Troubleshooting](/guide/reference/troubleshooting/)
- [AI Providers](/guide/ai-providers/)
