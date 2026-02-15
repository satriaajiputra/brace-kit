import { useState } from 'react';
import { useStore } from '../../store/index.ts';
import { Toggle } from '../ui/Toggle.tsx';
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
    <section className="settings-section">
      <h3>Security</h3>

      <div className="toggle-row">
        <div className="toggle-info">
          <span className="toggle-title">Enable Lock</span>
          <span className="toggle-hint">Require password when opening sidebar</span>
        </div>
        <Toggle
          checked={store.security.isLockEnabled}
          onChange={handleToggleLock}
        />
      </div>

      {store.security.isLockEnabled && (
        <div className="security-password-section">
          {!store.security.passwordHash && (
            <div className="security-warning">
              <span className="warning-icon">⚠️</span>
              <span>Please set a password to enable lock</span>
            </div>
          )}

          <div className="form-group">
            <label>Set Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setSuccess('');
              }}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
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

          {error && <span className="form-error">{error}</span>}
          {success && <span className="form-success">{success}</span>}

          <button
            className="btn btn-primary"
            onClick={handleSavePassword}
            disabled={!password || !confirmPassword}
          >
            Save Password
          </button>

          {store.security.passwordHash && (
            <p className="password-status">
              <span className="status-dot active"></span>
              Password is set
            </p>
          )}
        </div>
      )}
    </section>
  );
}
