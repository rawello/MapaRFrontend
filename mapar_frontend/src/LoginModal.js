import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ show, onClose, onLogin, onRegister }) => {
    const [loginTab, setLoginTab] = useState('login');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const result = await onLogin(username, password, setLoginError);
        if (result === false) {
            setLoginError('Ошибка входа. Проверьте логин и пароль.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const result = await onRegister(username, password, setRegisterError);
        if (result === false) {
            setRegisterError('Ошибка регистрации. Попробуйте другой логин.');
        }
    };

    if (!show) return null;

    return (
        <div id="loginModal" className="modal">
            <div id="loginModalContent" className="modal-content">
                <div className="tab">
                    <button className={`tablinks${loginTab === 'login' ? ' active' : ''}`} onClick={() => setLoginTab('login')}>Вход</button>
                    <button className={`tablinks${loginTab === 'register' ? ' active' : ''}`} onClick={() => setLoginTab('register')}>Регистрация</button>
                </div>
                {loginTab === 'login' && (
                    <div id="login" className="tabcontent">
                        <h2>Войдите</h2>
                        <form id="loginForm" onSubmit={handleLogin} autoComplete="on">
                            <label htmlFor="loginUsername">Логин:</label>
                            <input type="text" id="loginUsername" name="username" autoComplete="username" />
                            <label htmlFor="loginPassword">Пароль:</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    id="loginPassword"
                                    name="password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-eye"
                                    tabIndex={-1}
                                    aria-label="Показать пароль"
                                    onMouseDown={() => setShowLoginPassword(true)}
                                    onMouseUp={() => setShowLoginPassword(false)}
                                    onMouseLeave={() => setShowLoginPassword(false)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="8" ry="5"/><circle cx="12" cy="12" r="2.5"/></svg>
                                </button>
                            </div>
                            {loginError && <div style={{ color: '#e74c3c', marginTop: 8, fontSize: 15 }}>{loginError}</div>}
                            <button type="submit">Вход</button>
                        </form>
                    </div>
                )}
                {loginTab === 'register' && (
                    <div id="register" className="tabcontent">
                        <h2>Зарегистрируйтесь</h2>
                        <form id="registerForm" onSubmit={handleRegister} autoComplete="on">
                            <label htmlFor="registerUsername">Логин:</label>
                            <input type="text" id="registerUsername" name="username" autoComplete="username" />
                            <label htmlFor="registerPassword">Пароль:</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showRegisterPassword ? 'text' : 'password'}
                                    id="registerPassword"
                                    name="password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-eye"
                                    tabIndex={-1}
                                    aria-label="Показать пароль"
                                    onMouseDown={() => setShowRegisterPassword(true)}
                                    onMouseUp={() => setShowRegisterPassword(false)}
                                    onMouseLeave={() => setShowRegisterPassword(false)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="8" ry="5"/><circle cx="12" cy="12" r="2.5"/></svg>
                                </button>
                            </div>
                            {registerError && <div style={{ color: '#e74c3c', marginTop: 8, fontSize: 15 }}>{registerError}</div>}
                            <button type="submit">Регистрация</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginModal;