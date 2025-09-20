import React, { useState } from 'react';

function MedicationsPage() {
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', time: '' });
  const [items, setItems] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    setItems([...items, { id: Date.now(), ...form }]);
    setForm({ name: '', dosage: '', frequency: '', time: '' });
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add Medication</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Medication Name</label>
            <input className="w-full border rounded p-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Enter medication name" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dosage</label>
            <input className="w-full border rounded p-2" value={form.dosage} onChange={(e)=>setForm({...form,dosage:e.target.value})} placeholder="e.g., 10mg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Frequency</label>
            <select className="w-full border rounded p-2" value={form.frequency} onChange={(e)=>setForm({...form,frequency:e.target.value})}>
              <option value="">Select frequency</option>
              <option>Daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>Weekly</option>
              <option>As needed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time</label>
            <input type="time" className="w-full border rounded p-2" value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
          </div>
        </form>
      </div>

      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-3">Medications</h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No medications added yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map(m => (
              <li key={m.id} className="border rounded p-3 flex justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-500">{m.dosage} • {m.frequency} • {m.time}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MedicationsPage;


