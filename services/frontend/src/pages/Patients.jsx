// src/pages/Patients.jsx
import React, { useState, useEffect } from 'react';
import api from '../api.js';
import Header from '../components/Header.jsx';
import RightSideMenu from '../components/RightSideMenu.jsx';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      try {
        const res = await api.get('/patients');
        // assume API returns { patients: [...] }
        setPatients(res.data.patients);
      } catch (err) {
        console.error('Failed to load patients', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />

        <div className="p-6">
          {loading ? (
            <p>Loading patients…</p>
          ) : (
            <table className="min-w-full bg-white shadow rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Age</th>
                  <th className="p-3 text-left">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3">{p.id}</td>
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{p.age}</td>
                      <td className="p-3">
                        {new Date(p.lastVisit).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center">
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <RightSideMenu />
    </div>
  );
}
