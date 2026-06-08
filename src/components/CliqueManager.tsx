import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';

export default function CliqueManager({ onCliqueSelected }: { onCliqueSelected: () => void }) {
  const { user, logOut } = useAuthStore();
  const { 
    cliques, 
    currentClique, 
    loadUserCliques, 
    createNewClique, 
    joinCliqueWithCode, 
    setCurrentClique,
    lastCreatedInviteCode,
    clearLastInviteCode,
    loading,
    error 
  } = useCliqueStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newCliqueName, setNewCliqueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  useEffect(() => {
    clearLastInviteCode();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserCliques(user.uid);
    }
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createNewClique(newCliqueName, user.uid);
      setNewCliqueName('');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleJoin = async () => {
    if (!user) return;
    try {
      await joinCliqueWithCode(inviteCode, user.uid);
      setInviteCode('');
      setShowJoin(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const selectClique = (clique: any) => {
    setCurrentClique(clique);
    onCliqueSelected();
  };

  if (!currentClique && cliques.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'right' }}>
          <button onClick={logOut}>Logout</button>
        </div>
        <h2>Welcome! Create or join a clique</h2>
        
        {!showCreate && !showJoin && (
          <div>
            <button onClick={() => setShowCreate(true)} style={{ marginRight: '1rem' }}>Create New Clique</button>
            <button onClick={() => setShowJoin(true)}>Join Existing Clique</button>
          </div>
        )}
        
        {showCreate && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Create Clique</h3>
            <input
              type="text"
              placeholder="Clique name (e.g., Nairobi Nights)"
              value={newCliqueName}
              onChange={(e) => setNewCliqueName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <button onClick={handleCreate} disabled={loading}>Create</button>
            <button onClick={() => setShowCreate(false)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
            
            {lastCreatedInviteCode && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#e0f7fa', borderRadius: '4px' }}>
                <p><strong>Clique created!</strong></p>
                <p>Share this invite code with friends:</p>
                <code style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block', margin: '0.5rem 0' }}>
                  {lastCreatedInviteCode}
                </code>
                <button onClick={() => {
                  navigator.clipboard.writeText(lastCreatedInviteCode);
                  alert('Code copied!');
                }}>Copy Code</button>
                <button onClick={() => {
                  clearLastInviteCode();
                  setShowCreate(false);
                  if (user) loadUserCliques(user.uid);
                }} style={{ marginLeft: '0.5rem' }}>Done</button>
              </div>
            )}
          </div>
        )}
        
        {showJoin && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Join Clique</h3>
            <input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <button onClick={handleJoin} disabled={loading}>Join</button>
            <button onClick={() => setShowJoin(false)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
          </div>
        )}
        
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    );
  }

  if (!currentClique && cliques.length > 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'right' }}>
          <button onClick={logOut}>Logout</button>
        </div>
        <h2>Select a Clique</h2>
        {cliques.map(clique => (
          <div key={clique.id} style={{ marginBottom: '1rem' }}>
            <button onClick={() => selectClique(clique)} style={{ width: '100%', textAlign: 'left', padding: '1rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
              <strong>{clique.name}</strong><br />
              <small>Members: {clique.members.length}</small><br />
              <small>Invite code: {clique.inviteCode}</small>
            </button>
          </div>
        ))}
        <hr />
        <button onClick={() => setShowCreate(true)}>Create New Clique</button>
        <button onClick={() => setShowJoin(true)} style={{ marginLeft: '1rem' }}>Join Another Clique</button>
        
        {showCreate && (
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Clique name"
              value={newCliqueName}
              onChange={(e) => setNewCliqueName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        )}
        
        {showJoin && (
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
            <button onClick={handleJoin}>Join</button>
            <button onClick={() => setShowJoin(false)}>Cancel</button>
          </div>
        )}
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return null;
}