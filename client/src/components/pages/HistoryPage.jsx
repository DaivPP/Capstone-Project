import React, { useState } from 'react';

function HistoryPage() {
  const [range, setRange] = useState('7');
  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date Range</label>
            <select className="w-full border rounded p-2" value={range} onChange={(e)=>setRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">History chart placeholder for past {range} days.</p>
      </div>
    </div>
  );
}

export default HistoryPage;


