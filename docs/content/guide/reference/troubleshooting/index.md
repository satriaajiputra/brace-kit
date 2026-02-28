+++
title = "Troubleshooting"
description = "Solutions to common BraceKit problems."
weight = 53
template = "page.html"

[extra]
category = "Reference"
+++

# Troubleshooting

Solutions to common problems with BraceKit.

## Installation Issues

### Extension not loading

**Symptoms:**
- "Manifest file is invalid" error
- Extension doesn't appear after loading

**Solutions:**

1. **Check the folder**: Make sure you selected `dist/`, not the project root

2. **Rebuild the extension:**
   ```bash
   bun run build
   ```

3. **Check Chrome version**: Requires Chrome 109 or later

4. **Clear and reload:**
   - Remove the extension
   - Restart Chrome
   - Load unpacked again

### Build errors

**Symptoms:**
- `bun run build` fails
- Missing dependencies errors

**Solutions:**

```bash
# Clear and reinstall
rm -rf node_modules bun.lockb
bun install
bun run build
```

### Sidebar not appearing

**Symptoms:**
- Click icon but nothing happens
- Sidebar is blank

**Solutions:**

1. **Refresh the page**: Sometimes the content script needs a refresh

2. **Check console errors:**
   - Open DevTools (F12)
   - Check Console tab
   - Look for red errors

3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click refresh on BraceKit

---

## API Errors

### "Invalid API key"

**Symptoms:**
- 401 Unauthorized errors
- "Invalid API key" message

**Solutions:**

1. **Verify the key:**
   - Check for typos
   - Ensure no extra spaces
   - Confirm key is active

2. **Check provider console:**
   - OpenAI: platform.openai.com
   - Anthropic: console.anthropic.com
   - Others: Check respective dashboards

3. **Regenerate key:**
   - Create a new key
   - Update in BraceKit settings

### "Insufficient quota"

**Symptoms:**
- 429 Too Many Requests
- "Rate limit exceeded"

**Solutions:**

1. **Wait and retry:** Rate limits usually reset quickly

2. **Check usage:**
   - Review your API usage dashboard
   - Ensure you have credits

3. **Upgrade plan:** Some limits require plan upgrade

4. **Switch models:** Use smaller/faster models

### "Context length exceeded"

**Symptoms:**
- "Context window full" error
- Request fails on long conversations

**Solutions:**

1. **Use `/compact`:** Summarize the conversation

2. **Enable auto-compact:** Settings → Compact

3. **Start new conversation:** Sometimes the simplest solution

4. **Use larger context model:** Switch to Claude or Gemini

### "Model not found"

**Symptoms:**
- "Model does not exist" error
- Model name rejected

**Solutions:**

1. **Check model name:** Verify spelling

2. **Type manually:** Some models aren't in dropdown

3. **Check availability:** Some models require special access

---

## Connection Issues

### "Connection refused" (Ollama/Local)

**Symptoms:**
- Can't connect to localhost
- Ollama not working

**Solutions:**

1. **Ensure server is running:**
   ```bash
   ollama serve
   ```

2. **Check URL:** Should be `http://localhost:11434/v1`

3. **Check firewall:** Allow localhost connections

4. **Verify port:** Default is 11434

### MCP server won't connect

**Symptoms:**
- Server shows as disconnected
- Tools not available

**Solutions:**

1. **Check command:**
   ```bash
   which npx
   npx -y @modelcontextprotocol/server-filesystem --help
   ```

2. **Check environment variables:** Ensure required env vars are set

3. **Check logs:**
   - Settings → MCP Servers
   - Click server name
   - View logs

4. **Restart server:** Disconnect and reconnect

---

## Performance Issues

### Slow responses

**Symptoms:**
- Responses take very long
- Streaming is laggy

**Solutions:**

1. **Check network:** Slow internet affects API calls

2. **Check provider status:**
   - OpenAI status
   - Anthropic status
   - Google Cloud status

3. **Try different model:** Some models are faster

4. **Reduce context:** Use `/compact` to shorten history

### High memory usage

**Symptoms:**
- Browser slow
- Extension using lots of memory

**Solutions:**

1. **Clear old conversations:** Delete unused chats

2. **Clear images:** Remove old generated images

3. **Restart browser:** Sometimes helps

4. **Disable memory system:** If not needed

### Extension crashes

**Symptoms:**
- Sidebar goes blank
- Extension stops working

**Solutions:**

1. **Reload extension:** chrome://extensions → Refresh

2. **Check console:** Look for error messages

3. **Clear data:** Settings → Data → Clear (last resort)

4. **Report bug:** If reproducible, file an issue

---

## Data Issues

### Conversations disappeared

**Symptoms:**
- History is empty
- Can't find previous chats

**Solutions:**

1. **Check filters:** Make sure no filter is hiding conversations

2. **Check search:** Clear search query

3. **Data corruption:** Rare, but may need to restore from backup

### Images not loading

**Symptoms:**
- Images show as broken
- Gallery is empty

**Solutions:**

1. **Check IndexedDB:** Browser may have cleared storage

2. **Regenerate images:** If generated, create new ones

3. **Check storage quota:** May be out of space

### Settings reset

**Symptoms:**
- API keys gone
- Settings back to default

**Solutions:**

1. **Check Chrome storage:** May have been cleared

2. **Re-enter keys:** Unfortunately, need to reconfigure

3. **Export settings:** In future, export for backup

---

## PIN Issues

### Forgot PIN

**Symptoms:**
- Can't unlock sidebar
- PIN not accepted

**Solutions:**

> **Warning:** There is no PIN recovery. You must reset.

1. **Remove extension:**
   - Go to `chrome://extensions/`
   - Click "Remove" on BraceKit

2. **Reinstall:**
   - Load unpacked again
   - All data is lost
   - Reconfigure everything

### PIN not working

**Symptoms:**
- Correct PIN rejected
- "Invalid PIN" error

**Solutions:**

1. **Check for typos:** Type slowly

2. **Check keyboard layout:** Ensure correct number keys

3. **Try different input:** Use number row, not numpad

---

## General Tips

### When in doubt

1. **Reload the extension:** Fixes many issues
2. **Refresh the page:** Helps with content script issues
3. **Check the console:** Error messages are helpful
4. **Try a new conversation:** Isolates the problem

### Getting help

1. **Check documentation:** You're here, good start!

2. **Search issues:** [GitHub Issues](https://github.com/your-org/brace-kit/issues)

3. **Open an issue:** Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Console errors (if any)
   - Browser version
   - BraceKit version

### Debug mode

For detailed logging:

1. Open DevTools (F12)
2. Go to Console
3. Look for `[BraceKit]` prefixed messages
4. Include relevant logs in bug reports

---

## Related

- [Configuration](/guide/reference/configuration/)
- [Installation](/guide/getting-started/installation/)
- [Security](/guide/advanced/security/)
