import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
export default function CliqueManager({ onCliqueSelected }) {
    const { user, logOut } = useAuthStore();
    const { cliques, currentClique, loadUserCliques, createNewClique, joinCliqueWithCode, setCurrentClique, lastCreatedInviteCode, clearLastInviteCode, loading, error } = useCliqueStore();
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
        if (!user)
            return;
        try {
            await createNewClique(newCliqueName, user.uid);
            setNewCliqueName('');
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleJoin = async () => {
        if (!user)
            return;
        try {
            await joinCliqueWithCode(inviteCode, user.uid);
            setInviteCode('');
            setShowJoin(false);
        }
        catch (err) {
            console.error(err);
        }
    };
    const selectClique = (clique) => {
        setCurrentClique(clique);
        onCliqueSelected();
    };
    if (!currentClique && cliques.length === 0) {
        return (_jsxs("div", { style: { padding: '2rem', maxWidth: '500px', margin: '0 auto' }, children: [_jsx("div", { style: { textAlign: 'right' }, children: _jsx("button", { onClick: logOut, children: "Logout" }) }), _jsx("h2", { children: "Welcome! Create or join a clique" }), !showCreate && !showJoin && (_jsxs("div", { children: [_jsx("button", { onClick: () => setShowCreate(true), style: { marginRight: '1rem' }, children: "Create New Clique" }), _jsx("button", { onClick: () => setShowJoin(true), children: "Join Existing Clique" })] })), showCreate && (_jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("h3", { children: "Create Clique" }), _jsx("input", { type: "text", placeholder: "Clique name (e.g., Nairobi Nights)", value: newCliqueName, onChange: (e) => setNewCliqueName(e.target.value), style: { width: '100%', padding: '0.5rem', marginBottom: '1rem' } }), _jsx("button", { onClick: handleCreate, disabled: loading, children: "Create" }), _jsx("button", { onClick: () => setShowCreate(false), style: { marginLeft: '0.5rem' }, children: "Cancel" }), lastCreatedInviteCode && (_jsxs("div", { style: { marginTop: '1rem', padding: '1rem', background: '#e0f7fa', borderRadius: '4px' }, children: [_jsx("p", { children: _jsx("strong", { children: "Clique created!" }) }), _jsx("p", { children: "Share this invite code with friends:" }), _jsx("code", { style: { fontSize: '1.5rem', fontWeight: 'bold', display: 'block', margin: '0.5rem 0' }, children: lastCreatedInviteCode }), _jsx("button", { onClick: () => {
                                        navigator.clipboard.writeText(lastCreatedInviteCode);
                                        alert('Code copied!');
                                    }, children: "Copy Code" }), _jsx("button", { onClick: () => {
                                        clearLastInviteCode();
                                        setShowCreate(false);
                                        if (user)
                                            loadUserCliques(user.uid);
                                    }, style: { marginLeft: '0.5rem' }, children: "Done" })] }))] })), showJoin && (_jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("h3", { children: "Join Clique" }), _jsx("input", { type: "text", placeholder: "Enter invite code", value: inviteCode, onChange: (e) => setInviteCode(e.target.value.toUpperCase()), style: { width: '100%', padding: '0.5rem', marginBottom: '1rem' } }), _jsx("button", { onClick: handleJoin, disabled: loading, children: "Join" }), _jsx("button", { onClick: () => setShowJoin(false), style: { marginLeft: '0.5rem' }, children: "Cancel" })] })), error && _jsx("p", { style: { color: 'red', marginTop: '1rem' }, children: error })] }));
    }
    if (!currentClique && cliques.length > 0) {
        return (_jsxs("div", { style: { padding: '2rem', maxWidth: '500px', margin: '0 auto' }, children: [_jsx("div", { style: { textAlign: 'right' }, children: _jsx("button", { onClick: logOut, children: "Logout" }) }), _jsx("h2", { children: "Select a Clique" }), cliques.map(clique => (_jsx("div", { style: { marginBottom: '1rem' }, children: _jsxs("button", { onClick: () => selectClique(clique), style: { width: '100%', textAlign: 'left', padding: '1rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }, children: [_jsx("strong", { children: clique.name }), _jsx("br", {}), _jsxs("small", { children: ["Members: ", clique.members.length] }), _jsx("br", {}), _jsxs("small", { children: ["Invite code: ", clique.inviteCode] })] }) }, clique.id))), _jsx("hr", {}), _jsx("button", { onClick: () => setShowCreate(true), children: "Create New Clique" }), _jsx("button", { onClick: () => setShowJoin(true), style: { marginLeft: '1rem' }, children: "Join Another Clique" }), showCreate && (_jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("input", { type: "text", placeholder: "Clique name", value: newCliqueName, onChange: (e) => setNewCliqueName(e.target.value), style: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem' } }), _jsx("button", { onClick: handleCreate, children: "Create" }), _jsx("button", { onClick: () => setShowCreate(false), children: "Cancel" })] })), showJoin && (_jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("input", { type: "text", placeholder: "Invite code", value: inviteCode, onChange: (e) => setInviteCode(e.target.value.toUpperCase()), style: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem' } }), _jsx("button", { onClick: handleJoin, children: "Join" }), _jsx("button", { onClick: () => setShowJoin(false), children: "Cancel" })] })), error && _jsx("p", { style: { color: 'red' }, children: error })] }));
    }
    return null;
}
