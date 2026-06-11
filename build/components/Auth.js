import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, logIn, loading, error } = useAuthStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await logIn(email, password);
            }
            else {
                await signUp(email, password);
            }
        }
        catch (err) {
            // Error already set
        }
    };
    return (_jsx("div", { style: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }, children: _jsxs("form", { onSubmit: handleSubmit, style: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '300px' }, children: [_jsx("h2", { children: isLogin ? 'Login' : 'Sign Up' }), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: { width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' } }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: { width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' } }), error && _jsx("div", { style: { color: 'red', marginBottom: '1rem' }, children: error }), _jsx("button", { type: "submit", disabled: loading, style: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }, children: loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up') }), _jsxs("button", { type: "button", onClick: () => setIsLogin(!isLogin), style: { width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #ccc' }, children: ["Switch to ", isLogin ? 'Sign Up' : 'Login'] })] }) }));
}
