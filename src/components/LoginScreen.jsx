import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import '../styles/LoginScreen.css';

function LoginScreen() {
    const { login } = usePrivy();

    const handleLogin = (isEnterprise) => {
        localStorage.setItem('isEnterprise', isEnterprise);
        login();
    };

    return (
        <div className="login-container">
            <h1>Welcome to DeForms</h1>
            <p>Please choose your login type:</p>
            <div className="login-buttons">
                <button onClick={() => handleLogin(true)}>Enterprise Login</button>
                <button onClick={() => handleLogin(false)}>User Login</button>
            </div>
        </div>
    );
}

export default LoginScreen;
