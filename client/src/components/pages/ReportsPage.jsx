import React, { useState } from 'react';

function ReportsPage() {
  const [type, setType] = useState('adherence');
  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Generate Report</label>
            <select className="w-full border rounded p-2" value={type} onChange={(e)=>setType(e.target.value)}>
              <option value="adherence">Adherence Report</option>
              <option value="usage">Medication Usage</option>
              <option value="summary">Monthly Summary</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">Report preview placeholder: {type}</p>
      </div>
    </div>
  );
}

export default ReportsPage;


