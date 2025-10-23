import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserInjured,
  FaCalendarCheck,
  FaPills,
  FaStethoscope
} from 'react-icons/fa';

export default function Sidebar() {
  const items = [
    { to: '/patients', icon: <FaUserInjured />, label: 'Patients' },
    { to: '/appointments', icon: <FaCalendarCheck />, label: 'Appointments' },
    { to: '/prescriptions', icon: <FaPills />, label: 'Prescriptions' },
    { to: '/doctors', icon: <FaStethoscope />, label: 'Doctors' }
  ];

  return (
    <aside className="w-60 bg-gray-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold text-center bg-gray-900">
        MedSys
      </div>
      <nav className="mt-4 flex-1">
        <ul>
          {items.map(({ to, icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center px-6 py-3 hover:bg-gray-700"
              >
                <span className="mr-3">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
