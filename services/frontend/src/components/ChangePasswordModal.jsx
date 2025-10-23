import React, { useState } from 'react';
import Modal from './Modal.jsx';
import api from '../api.js';

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [msg, setMsg] = useState({ text: '', error: false });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ text: "New passwords don't match", error: true });
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setMsg({ text: 'Password changed successfully.', error: false });
      setTimeout(onClose, 1200);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Change failed.', error: true });
    }
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update
        </button>
        {msg.text && (
          <p className={`${msg.error ? 'text-red-500' : 'text-green-500'} mt-2`}>
            {msg.text}
          </p>
        )}
      </form>
    </Modal>
  );
}
