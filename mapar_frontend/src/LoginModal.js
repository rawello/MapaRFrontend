import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ show, onClose, onLogin, onRegister }) => {
    const [loginTab, setLoginTab] = useState('login');

    const handleLogin = (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        onLogin(username, password);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        onRegister(username, password);
    };

    if (!show) return null;

    return (
        <div id="loginModal" className="modal">
            <div id="loginModalContent" className="modal-content">
                <div className="tab">
                    <button className={`tablinks ${loginTab === 'login' ? 'active' : ''}`} onClick={() => setLoginTab('login')}>Login</button>
                    <button className={`tablinks ${loginTab === 'register' ? 'active' : ''}`} onClick={() => setLoginTab('register')}>Register</button>
                </div>
                {loginTab === 'login' && (
                    <div id="login" className="tabcontent">
                        <h2>Please Login</h2>
                        <form id="loginForm" onSubmit={handleLogin}>
                            <label htmlFor="loginUsername">Username:</label>
                            <input type="text" id="loginUsername" name="username" /><br />
                            <label htmlFor="loginPassword">Password:</label>
                            <input type="password" id="loginPassword" name="password" /><br />
                            <button type="submit">Login</button>
                        </form>
                    </div>
                )}
                {loginTab === 'register' && (
                    <div id="register" className="tabcontent">
                        <h2>Please Register</h2>
                        <form id="registerForm" onSubmit={handleRegister}>
                            <label htmlFor="registerUsername">Username:</label>
                            <input type="text" id="registerUsername" name="username" /><br />
                            <label htmlFor="registerPassword">Password:</label>
                            <input type="password" id="registerPassword" name="password" /><br />
                            <button type="submit">Register</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginModal;