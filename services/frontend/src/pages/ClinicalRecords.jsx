import React, { useState, useEffect } from 'react';
import api from '../api.js';
import Header from '../components/Header.jsx';
import RightSideMenu from '../components/RightSideMenu.jsx';

export default function ClinicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    summary: '',
    order: 'desc'
  });

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const res = await api.get('/records', {
          params: { page, limit, ...filters }
        });
        setRecords(res.data.records);
        setTotalPages(res.data.totalPages);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [page, filters]);

  const applyFilters = e => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />

        <form
          onSubmit={applyFilters}
          className="bg-white p-6 shadow flex flex-wrap items-center gap-4"
        >
          <div>
            <label className="block text-gray-700">From</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={e =>
                setFilters(f => ({ ...f, fromDate: e.target.value }))
              }
              className="mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">To</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={e =>
                setFilters(f => ({ ...f, toDate: e.target.value }))
              }
              className="mt-1 p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Summary</label>
            <input
              type="text"
              name="summary"
              placeholder="Keyword…"
              value={filters.summary}
              onChange={e =>
                setFilters(f => ({ ...f, summary: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Order</label>
            <select
              name="order"
              value={filters.order}
              onChange={e =>
                setFilters(f => ({ ...f, order: e.target.value }))
              }
              className="mt-1 p-2 border rounded"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </form>

        <div className="p-6">
          {loading ? (
            <p>Loading records…</p>
          ) : (
            <table className="min-w-full bg-white shadow rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Summary</th>
                  <th className="p-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">{rec.summary}</td>
                      <td className="p-3">
                        <button className="py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <RightSideMenu />
    </div>
  );
}
