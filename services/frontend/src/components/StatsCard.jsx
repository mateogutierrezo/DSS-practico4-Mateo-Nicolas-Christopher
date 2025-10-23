import React from 'react';

export default function StatsCard({ count, label }) {
  return (
    <div className="bg-white shadow rounded p-5 flex-1 mr-4 last:mr-0">
      <div className="text-2xl font-bold text-gray-800">{count}</div>
      <div className="text-gray-500 mt-1">{label}</div>
    </div>
  );
}
