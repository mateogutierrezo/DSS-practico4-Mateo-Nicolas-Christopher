import React from 'react';
import StatsCard from './StatsCard.jsx';
import PatientList from './PatientList.jsx';

export default function Dashboard() {
  return (
    <>
      <div className="flex mb-6">
        <StatsCard count={1200} label="Patients" />
        <StatsCard count={75} label="Appointments" />
        <StatsCard count={24} label="Doctors" />
      </div>
      <PatientList />
    </>
  );
}
