import React from 'react';
import { Link } from 'react-router-dom';

export default function RightSideMenu() {
  const links = [
    { to: '/home', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/patients', label: 'Patients' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/prescriptions', label: 'Prescriptions' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/records', label: 'Clinical Records' },
    { to: '/invoices', label: 'Invoices' }
  ];

  return (
    <aside className="w-52 bg-white border-l p-6 flex-shrink-0">
      <nav className="flex flex-col space-y-4">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-blue-600 hover:underline" >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
