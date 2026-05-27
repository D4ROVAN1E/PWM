import React, { useState } from 'react';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => /^(?=.*\d)(?=.*[A-Z]).{8,}$/.test(password);

const AccountForm = ({ initialData, onSubmit, submitText, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { service: '', login: '', password: '' });
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (!formData.service.trim()) errors.service = "Название сервиса обязательно";
        if (!validateEmail(formData.login)) errors.login = "Введите корректный email адрес";
        if (!validatePassword(formData.password)) errors.password = "От 8 символов, 1 цифра, 1 заглавная буква";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Название сервиса:</label>
                <input 
                    type="text" 
                    name="service"
                    className="form-control"
                    value={formData.service} 
                    onChange={handleChange} 
                />
                {validationErrors.service && <span className="error-text">{validationErrors.service}</span>}
            </div>
            
            <div className="form-group">
                <label>Логин (Email):</label>
                <input 
                    type="text" 
                    name="login"
                    className="form-control"
                    value={formData.login} 
                    onChange={handleChange} 
                />
                {validationErrors.login && <span className="error-text">{validationErrors.login}</span>}
            </div>
            
            <div className="form-group">
                <label>Пароль:</label>
                <input 
                    type="text" 
                    name="password"
                    className="form-control"
                    value={formData.password} 
                    onChange={handleChange} 
                />
                {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">{submitText}</button>
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ marginLeft: "10px" }}>Отмена</button>
                )}
            </div>
        </form>
    );
};

export default AccountForm;
