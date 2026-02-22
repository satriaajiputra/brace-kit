import { useState } from 'react';
import { useStore } from '../../store/index.ts';
import { sha256 } from '../../utils/crypto.ts';

export function SecuritySettings() {
  const store = useStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSavePassword = async () => {
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const hash = await sha256(password);
    store.setSecurity({ passwordHash: hash });
    await store.saveToStorage();
    setSuccess('Password saved successfully');
    setPassword('');
    setConfirmPassword('');

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleLock = (checked: boolean) => {
    store.setSecurity({ isLockEnabled: checked });
    store.saveToStorage();

    // If disabling lock, also reset authentication state
    if (!checked) {
      store.setIsAuthenticated(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 py-3 border-b border-border last:border-0">
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Security</h3>
        <p className="text-xs text-muted-foreground leading-none">Protect your conversations with a password</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
          <div className="flex flex-col gap-0.5 pr-2">
            <span className="text-sm font-medium text-foreground">Enable Lock</span>
            <span className="text-xs text-muted-foreground leading-tight">Require password when opening sidebar</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={store.security.isLockEnabled}
              onChange={(e) => handleToggleLock(e.target.checked)}
            />
            <div className="w-8 h-4.5 bg-muted rounded-full peer peer-checked:bg-primary transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5"></div>
          </label>
        </div>

        {store.security.isLockEnabled && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {!store.security.passwordHash && (
              <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-md text-warning text-xs">
                <span className="shrink-0">⚠️</span>
                <span>Please set a password to enable lock</span>
              </div>
            )}

            <div className="flex flex-col gap-3 px-0.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Set Password</label>
                <input
                  type="password"
                  className="w-full h-8 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Confirm Password</label>
                <input
                  type="password"
                  className="w-full h-8 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Confirm new password"
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePassword()}
                />
              </div>

              {error && (
                <div className="px-2 py-1 text-xs text-destructive bg-destructive/10 rounded border border-destructive/20 animate-in shake-1 duration-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-2 py-1 text-xs text-success bg-success/10 rounded border border-success/20 animate-in fade-in duration-200">
                  {success}
                </div>
              )}

              <button
                className="w-full h-9 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                onClick={handleSavePassword}
                disabled={!password || !confirmPassword}
              >
                Save Password
              </button>

              {store.security.passwordHash && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                  <p className="text-xs text-muted-foreground">Password is set</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
