 import React, { useState, useEffect } from 'react';
import { Sun, Moon, Download } from 'lucide-react';
import './App.css';

function App() {
  const [machines, setMachines] = useState([]);
  const [filterOS, setFilterOS] = useState("All");
  const [sortField, setSortField] = useState("machine_id");
  const [sortAsc, setSortAsc] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/machines')
      .then(res => res.json())
      .then(data => setMachines(data))
      .catch(err => console.error('Error fetching machines:', err));
  }, []);

  const handleFilterOS = (e) => setFilterOS(e.target.value);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const displayedMachines = machines
    .filter(m => filterOS === "All" || m.os.toLowerCase() === filterOS.toLowerCase())
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return (valA < valB ? (sortAsc ? -1 : 1) : valA > valB ? (sortAsc ? 1 : -1) : 0);
    });

  const exportCSV = () => {
    const header = ["Machine ID","OS","Encrypted","Up-to-Date","Antivirus","Sleep Timeout","Last Check-In"];
    const rows = displayedMachines.map(m => [
      m.machine_id,
      m.os,
      m.disk_encrypted ? "Yes" : "No",
      m.os_up_to_date ? "Yes" : "No",
      m.antivirus_installed ? "Yes" : "No",
      `${m.sleep_timeout_min} min`,
      m.last_check_in || m.timestamp
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'machines_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">🖥️ System Health Dashboard</h1>
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <label className="flex items-center space-x-2">
            <span>Filter by OS:</span>
            <select
              value={filterOS}
              onChange={handleFilterOS}
              className="p-2 rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option>All</option>
              <option>Windows</option>
              <option>Darwin</option>
              <option>Linux</option>
            </select>
          </label>
          <button
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full rounded-md shadow-md bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-300 dark:bg-gray-700">
                {["machine_id", "os", "disk_encrypted", "os_up_to_date", "antivirus_installed", "sleep_timeout_min", "last_check_in"].map(field => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="text-left px-4 py-2 cursor-pointer select-none"
                  >
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {sortField === field && (sortAsc ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedMachines.length > 0 ? (
                displayedMachines.map(m => (
                  <tr key={m.machine_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 font-semibold">{m.machine_id}</td>
                    <td className="px-4 py-2">{m.os}</td>
                    <td className={`px-4 py-2 ${m.disk_encrypted ? 'text-green-500' : 'text-red-500'}`}>{m.disk_encrypted ? 'Yes' : 'No'}</td>
                    <td className={`px-4 py-2 ${m.os_up_to_date ? 'text-green-500' : 'text-red-500'}`}>{m.os_up_to_date ? 'Yes' : 'No'}</td>
                    <td className={`px-4 py-2 ${m.antivirus_installed ? 'text-green-500' : 'text-red-500'}`}>{m.antivirus_installed ? 'Yes' : 'No'}</td>
                    <td className={`px-4 py-2 ${m.sleep_timeout_min > 15 ? 'text-red-500' : ''}`}>{m.sleep_timeout_min} min</td>
                    <td className="px-4 py-2">{m.last_check_in || m.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">No machine data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;