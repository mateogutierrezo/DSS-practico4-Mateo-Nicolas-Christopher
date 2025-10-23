import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function Topbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center space-x-4 text-gray-600">
        <FaBell className="cursor-pointer" />
        <FaUserCircle className="cursor-pointer" />
        <FaSignOutAlt
          className="cursor-pointer text-red-600 hover:text-red-800"
          size={20}
          onClick={handleLogout}
          title="Logout"
        />
      </div>
    </div>
  );
}
