import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cryptoKey, setCryptoKey] = useState(null); 

    // Проверяем наличие токена, но без cryptoKey мы все равно не сможем ничего расшифровать.
    // Если страница обновлена, пользователю ПРИДЕТСЯ заново ввести мастер-пароль.
    // Это правильное поведение для менеджера паролей.
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
        }
    }, []);

    const login = (key, token) => {
        setCryptoKey(key);
        setIsLoggedIn(true);
        localStorage.setItem('token', token); 
    };

    const logout = () => {
        setCryptoKey(null);
        setIsLoggedIn(false);
        localStorage.removeItem('token'); 
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, cryptoKey, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};