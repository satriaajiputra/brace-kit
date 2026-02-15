import { useState } from 'react';
import { useStore } from '../store/index.ts';

export function LockScreen() {
  const store = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Please enter password');
      return;
    }

    const isValid = await store.authenticate(password);
    if (!isValid) {
      setError('Invalid password');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-screen-content">
        <div className="lock-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2>Locked</h2>
        <p className="lock-hint">Enter password to unlock</p>
        <div className="lock-input-group">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            autoFocus
          />
          {error && <span className="lock-error">{error}</span>}
        </div>
        <button className="lock-button" onClick={handleUnlock}>
          Unlock
        </button>
      </div>
    </div>
  );
}
