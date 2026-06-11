// src/components/CliqueManager.tsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';

export default function CliqueManager({ onCliqueSelected }: { onCliqueSelected: () => void }) {
  const { user, logOut } = useAuthStore();
  const {
    cliques, currentClique, loadUserCliques,
    createNewClique, joinCliqueWithCode, setCurrentClique,
    lastCreatedInviteCode, clearLastInviteCode, loading, error,
  } = useCliqueStore();

  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none');
  const [newCliqueName, setNewCliqueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => { clearLastInviteCode(); }, []);
  useEffect(() => { if (user) loadUserCliques(user.uid); }, [user]);

  const handleCreate = async () => {
    if (!user || !newCliqueName.trim()) return;
    await createNewClique(newCliqueName.trim(), user.uid);
    setNewCliqueName('');
  };

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) return;
    await joinCliqueWithCode(inviteCode.trim(), user.uid);
    setInviteCode('');
    setMode('none');
  };

  const selectClique = (clique: any) => {
    setCurrentClique(clique);
    onCliqueSelected();
  };

  const inputRow = (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
      {mode === 'create' ? (
        <>
          <input
            className="uk-input"
            placeholder="Clique name, e.g. Nairobi Nights"
            value={newCliqueName}
            onChange={e => setNewCliqueName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button className="uk-btn uk-btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? '...' : 'Create'}
          </button>
          <button className="uk-btn uk-btn-ghost" onClick={() => setMode('none')}>Cancel</button>
        </>
      ) : (
        <>
          <input
            className="uk-input"
            placeholder="Invite code"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{ letterSpacing: '0.12em', fontWeight: 600 }}
          />
          <button className="uk-btn uk-btn-primary" onClick={handleJoin} disabled={loading}>
            {loading ? '...' : 'Join'}
          </button>
          <button className="uk-btn uk-btn-ghost" onClick={() => setMode('none')}>Cancel</button>
        </>
      )}
    </div>
  );

  return (
    <div className="uk-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px', padding: '1.5rem' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🌙</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#E8B86D', fontWeight: 600 }}>
            Clique Reviews
          </h1>
        </div>

        {/* Existing cliques */}
        {cliques.length > 0 && (
          <>
            <p style={{ fontSize: '0.8rem', color: '#9B8FAD', marginBottom: '0.75rem' }}>
              YOUR CLIQUES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {cliques.map(clique => (
                <button
                  key={clique.id}
                  onClick={() => selectClique(clique)}
                  style={{
                    background: '#2E1245',
                    border: '0.5px solid rgba(232,184,109,0.15)',
                    borderRadius: 'var(--uk-radius-md)',
                    padding: '0.85rem 1rem',
                    color: '#F0EAD6',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,184,109,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(232,184,109,0.15)')}
                >
                  <div style={{ fontWeight: 600, color: '#E8B86D' }}>{clique.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9B8FAD', marginTop: '0.2rem' }}>
                    {clique.members.length} members · code: <span style={{ letterSpacing: '0.1em' }}>{clique.inviteCode}</span>
                  </div>
                </button>
              ))}
            </div>
            <hr className="uk-divider" />
          </>
        )}

        {/* No cliques yet */}
        {cliques.length === 0 && (
          <p style={{ color: '#9B8FAD', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            Create a clique or join one with an invite code
          </p>
        )}

        {/* Action buttons */}
        {mode === 'none' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="uk-btn uk-btn-primary" style={{ flex: 1 }} onClick={() => setMode('create')}>
              + Create clique
            </button>
            <button className="uk-btn uk-btn-ghost" style={{ flex: 1 }} onClick={() => setMode('join')}>
              Join with code
            </button>
          </div>
        )}

        {mode !== 'none' && inputRow}

        {/* Invite code reveal after creation */}
        {lastCreatedInviteCode && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(232,184,109,0.08)',
            border: '0.5px solid rgba(232,184,109,0.35)',
            borderRadius: 'var(--uk-radius-md)',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#9B8FAD' }}>
              Clique created! Share this code:
            </p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E8B86D', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              {lastCreatedInviteCode}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="uk-btn uk-btn-primary"
                onClick={() => { navigator.clipboard.writeText(lastCreatedInviteCode); }}
              >
                Copy code
              </button>
              <button
                className="uk-btn uk-btn-ghost"
                onClick={() => { clearLastInviteCode(); setMode('none'); if (user) loadUserCliques(user.uid); }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem', color: '#E24B4A', fontSize: '0.85rem' }}>{error}</div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="uk-btn uk-btn-ghost" style={{ fontSize: '0.8rem' }} onClick={logOut}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}