import { useState } from 'react';
import { useMCP } from '../../hooks/useMCP.ts';
import { XIcon } from 'lucide-react';

export function MCPServersSettings() {
  const { mcpServers, addMCPServer, removeMCPServer, toggleMCPServer } = useMCP();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return;
    setIsConnecting(true);
    const result = await addMCPServer(name.trim(), url.trim(), headers);
    setIsConnecting(false);
    if (result.success) {
      setName('');
      setUrl('');
      setHeaders('');
      setShowForm(false);
    } else {
      alert(`Failed to connect: ${result.error || 'Unknown error'}`);
    }
  };

  return (
    <section className="flex flex-col gap-3 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">MCP Servers</h3>
          <p className="text-xs text-muted-foreground leading-none">External tools and data sources</p>
        </div>
        <button
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${showForm
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          title="Add server"
          onClick={() => setShowForm(!showForm)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${showForm ? 'rotate-45' : ''}`}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {showForm && (
        <div className="flex flex-col gap-3 p-3 mb-2 rounded-lg bg-secondary/30 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1 px-0.5">
            <label htmlFor="mcp-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Server Name</label>
            <input
              type="text"
              id="mcp-name"
              className="w-full h-8 px-2.5 text-xs bg-muted/40 border border-input rounded focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
              placeholder="My MCP Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 px-0.5">
            <label htmlFor="mcp-url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Server URL</label>
            <input
              type="url"
              id="mcp-url"
              className="w-full h-8 px-2.5 text-xs bg-muted/40 border border-input rounded focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
              placeholder="http://localhost:3000"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 px-0.5">
            <label htmlFor="mcp-headers" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
              Headers <span className="text-[10px] lowercase font-normal opacity-60">Key: Value (one per line)</span>
            </label>
            <textarea
              id="mcp-headers"
              rows={2}
              className="w-full p-2 text-xs bg-muted/40 border border-input rounded focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground resize-none"
              placeholder="Authorization: Bearer sk-xxx"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
            />
          </div>
          <button
            className="w-full h-9 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm active:scale-[0.98]"
            onClick={handleAdd}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            {isConnecting ? 'Connecting...' : 'Connect Server'}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {mcpServers.map((server) => {
          const isActive = server.connected && server.enabled !== false;
          return (
            <div key={server.id} className="group flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/40 hover:bg-secondary/40 transition-all">
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground/40'
                      }`}
                    title={isActive ? 'Connected' : server.enabled === false ? 'Disabled' : 'Disconnected'}
                  />
                  <span className="text-sm font-medium text-foreground truncate">{server.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate opacity-70">{server.url}</span>
                {server.toolCount ? (
                  <span className="inline-flex mt-1 px-1.5 py-0.5 w-fit rounded bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                    {server.toolCount} tools available
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={server.enabled !== false}
                    onChange={(e) => toggleMCPServer(server.id, e.target.checked)}
                  />
                  <div className="w-7 h-4 bg-muted rounded-full peer peer-checked:bg-primary transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
                </label>
                <button
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  title="Remove server"
                  onClick={() => removeMCPServer(server.id)}
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
