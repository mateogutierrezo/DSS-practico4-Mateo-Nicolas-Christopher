import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', error: false });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg({ text: 'Check your inbox for reset instructions.', error: false });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error sending reset email', error: true });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Reset Link
        </button>
        {msg.text && (
          <p className={`${msg.error ? 'text-red-500' : 'text-green-500'} mt-4`}>
            {msg.text}
          </p>
        )}
        <Link to="/login" className="block text-blue-600 mt-4 hover:underline">
          Back to Login
        </Link>
      </form>
    </div>
  );
}

