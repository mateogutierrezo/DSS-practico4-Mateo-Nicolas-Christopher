import React from 'react';

export default function PatientList() {
  const patients = [
    { id: '#001', name: 'John Doe', age: 29, lastVisit: '2025-07-01' },
    { id: '#002', name: 'Jane Smith', age: 45, lastVisit: '2025-07-07' },
    { id: '#003', name: 'Bob Johnson', age: 60, lastVisit: '2025-06-30' }
  ];

  return (
    <table className="min-w-full bg-white shadow rounded overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="text-left p-3">ID</th>
          <th className="text-left p-3">Name</th>
          <th className="text-left p-3">Age</th>
          <th className="text-left p-3">Last Visit</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(p => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="p-3">{p.id}</td>
            <td className="p-3">{p.name}</td>
            <td className="p-3">{p.age}</td>
            <td className="p-3">{p.lastVisit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
