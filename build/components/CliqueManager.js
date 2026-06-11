import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/CliqueManager.tsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
export default function CliqueManager({ onCliqueSelected }) {
    const { user, logOut } = useAuthStore();
    const { cliques, currentClique, loadUserCliques, createNewClique, joinCliqueWithCode, setCurrentClique, lastCreatedInviteCode, clearLastInviteCode, loading, error, } = useCliqueStore();
    const [mode, setMode] = useState('none');
    const [newCliqueName, setNewCliqueName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    useEffect(() => { clearLastInviteCode(); }, []);
    useEffect(() => { if (user)
        loadUserCliques(user.uid); }, [user]);
    const handleCreate = async () => {
        if (!user || !newCliqueName.trim())
            return;
        await createNewClique(newCliqueName.trim(), user.uid);
        setNewCliqueName('');
    };
    const handleJoin = async () => {
        if (!user || !inviteCode.trim())
            return;
        await joinCliqueWithCode(inviteCode.trim(), user.uid);
        setInviteCode('');
        setMode('none');
    };
    const selectClique = (clique) => {
        setCurrentClique(clique);
        onCliqueSelected();
    };
    const inputRow = (_jsx("div", { style: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }, children: mode === 'create' ? (_jsxs(_Fragment, { children: [_jsx("input", { className: "uk-input", placeholder: "Clique name, e.g. Nairobi Nights", value: newCliqueName, onChange: e => setNewCliqueName(e.target.value), onKeyDown: e => e.key === 'Enter' && handleCreate() }), _jsx("button", { className: "uk-btn uk-btn-primary", onClick: handleCreate, disabled: loading, children: loading ? '...' : 'Create' }), _jsx("button", { className: "uk-btn uk-btn-ghost", onClick: () => setMode('none'), children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx("input", { className: "uk-input", placeholder: "Invite code", value: inviteCode, onChange: e => setInviteCode(e.target.value.toUpperCase()), onKeyDown: e => e.key === 'Enter' && handleJoin(), style: { letterSpacing: '0.12em', fontWeight: 600 } }), _jsx("button", { className: "uk-btn uk-btn-primary", onClick: handleJoin, disabled: loading, children: loading ? '...' : 'Join' }), _jsx("button", { className: "uk-btn uk-btn-ghost", onClick: () => setMode('none'), children: "Cancel" })] })) }));
    return (_jsx("div", { className: "uk-screen", style: { display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsxs("div", { style: { width: '100%', maxWidth: '480px', padding: '1.5rem' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '2rem' }, children: [_jsx("div", { style: { fontSize: '2rem', marginBottom: '0.4rem' }, children: "\uD83C\uDF19" }), _jsx("h1", { style: { margin: 0, fontSize: '1.5rem', color: '#E8B86D', fontWeight: 600 }, children: "Clique Reviews" })] }), cliques.length > 0 && (_jsxs(_Fragment, { children: [_jsx("p", { style: { fontSize: '0.8rem', color: '#9B8FAD', marginBottom: '0.75rem' }, children: "YOUR CLIQUES" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }, children: cliques.map(clique => (_jsxs("button", { onClick: () => selectClique(clique), style: {
                                    background: '#2E1245',
                                    border: '0.5px solid rgba(232,184,109,0.15)',
                                    borderRadius: 'var(--uk-radius-md)',
                                    padding: '0.85rem 1rem',
                                    color: '#F0EAD6',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.15s',
                                }, onMouseEnter: e => (e.currentTarget.style.borderColor = 'rgba(232,184,109,0.4)'), onMouseLeave: e => (e.currentTarget.style.borderColor = 'rgba(232,184,109,0.15)'), children: [_jsx("div", { style: { fontWeight: 600, color: '#E8B86D' }, children: clique.name }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#9B8FAD', marginTop: '0.2rem' }, children: [clique.members.length, " members \u00B7 code: ", _jsx("span", { style: { letterSpacing: '0.1em' }, children: clique.inviteCode })] })] }, clique.id))) }), _jsx("hr", { className: "uk-divider" })] })), cliques.length === 0 && (_jsx("p", { style: { color: '#9B8FAD', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }, children: "Create a clique or join one with an invite code" })), mode === 'none' && (_jsxs("div", { style: { display: 'flex', gap: '0.75rem' }, children: [_jsx("button", { className: "uk-btn uk-btn-primary", style: { flex: 1 }, onClick: () => setMode('create'), children: "+ Create clique" }), _jsx("button", { className: "uk-btn uk-btn-ghost", style: { flex: 1 }, onClick: () => setMode('join'), children: "Join with code" })] })), mode !== 'none' && inputRow, lastCreatedInviteCode && (_jsxs("div", { style: {
                        marginTop: '1.25rem',
                        background: 'rgba(232,184,109,0.08)',
                        border: '0.5px solid rgba(232,184,109,0.35)',
                        borderRadius: 'var(--uk-radius-md)',
                        padding: '1rem',
                    }, children: [_jsx("p", { style: { margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#9B8FAD' }, children: "Clique created! Share this code:" }), _jsx("div", { style: { fontSize: '2rem', fontWeight: 700, color: '#E8B86D', letterSpacing: '0.2em', marginBottom: '0.75rem' }, children: lastCreatedInviteCode }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("button", { className: "uk-btn uk-btn-primary", onClick: () => { navigator.clipboard.writeText(lastCreatedInviteCode); }, children: "Copy code" }), _jsx("button", { className: "uk-btn uk-btn-ghost", onClick: () => { clearLastInviteCode(); setMode('none'); if (user)
                                        loadUserCliques(user.uid); }, children: "Done" })] })] })), error && (_jsx("div", { style: { marginTop: '1rem', color: '#E24B4A', fontSize: '0.85rem' }, children: error })), _jsx("div", { style: { marginTop: '2rem', textAlign: 'center' }, children: _jsx("button", { className: "uk-btn uk-btn-ghost", style: { fontSize: '0.8rem' }, onClick: logOut, children: "Logout" }) })] }) }));
}
