import React, { useState, useEffect } from 'react';
import api from '../api.js';
import Header from '../components/Header.jsx';
import RightSideMenu from '../components/RightSideMenu.jsx';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInv() {
      setLoading(true);
      try {
        const res = await api.get('/invoices');
        setInvoices(res.data.invoices);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchInv();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />

        <div className="p-6">
          {loading ? (
            <p>Loading invoices…</p>
          ) : (
            <table className="min-w-full bg-white shadow rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Invoice #</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-3">{inv.id}</td>
                      <td className="p-3">
                        {new Date(inv.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">${inv.amount.toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            inv.status === 'paid' ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center">
                      No invoices found.
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
