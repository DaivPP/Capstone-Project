import React, { useState } from 'react';

function RemindersPage() {
  const [form, setForm] = useState({ medication: '', time: '' });
  const [reminders, setReminders] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.medication || !form.time) return;
    setReminders([...reminders, { id: Date.now(), ...form }]);
    setForm({ medication: '', time: '' });
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create Reminder</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Medication</label>
            <input className="w-full border rounded p-2" value={form.medication} onChange={(e)=>setForm({...form,medication:e.target.value})} placeholder="Select medication" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time</label>
            <input type="time" className="w-full border rounded p-2" value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Add Reminder</button>
          </div>
        </form>
      </div>

      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-3">Upcoming Reminders</h3>
        {reminders.length === 0 ? (
          <p className="text-sm text-gray-500">No reminders yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map(r => (
              <li key={r.id} className="border rounded p-3 flex justify-between">
                <div className="font-medium">{r.medication}</div>
                <div className="text-sm text-gray-500">{r.time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RemindersPage;


