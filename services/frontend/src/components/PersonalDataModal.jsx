import React, { useState } from 'react';
import Modal from './Modal.jsx';
import api from '../api.js';

export default function PersonalDataModal({ onClose }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [msg, setMsg] = useState({ text: '', error: false });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.put('/auth/update-profile', form);
      setMsg({ text: 'Profile updated successfully.', error: false });
      setTimeout(onClose, 1200);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed.', error: true });
    }
  };

  return (
    <Modal title="Update Personal Data" onClose={onClose}>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-3 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
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
