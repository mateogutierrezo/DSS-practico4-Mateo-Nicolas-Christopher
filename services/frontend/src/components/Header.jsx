import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalDataModal from './PersonalDataModal.jsx';
import ChangePasswordModal from './ChangePasswordModal.jsx';

export default function Header() {
  const [showProfile, setShowProfile]     = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <div className="flex items-center bg-white shadow py-4 px-6 mb-6 space-x-4">
        <button
          onClick={() => setShowProfile(true)}
          className="btn-primary hover:bg-blue-700"
        >
          Edit Profile
        </button>
        <button
          onClick={() => setShowPassword(true)}
          className="btn-primary hover:bg-blue-700"
        >
          Change Password
        </button>
        <button
          onClick={handleLogout}
          className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {showProfile  && <PersonalDataModal onClose={() => setShowProfile(false)} />}
      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
    </>
  );
}
