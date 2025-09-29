import React, { useState, useEffect } from 'react';
import { createReminder, getReminders, deleteReminder } from '../services/Api.js';

function RemindersPage() {
  const [form, setForm] = useState({ medication: '', time: '' });
  const [reminders, setReminders] = useState([]);

  // Load reminders on mount
  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const res = await getReminders();
      setReminders(res.data);
    } catch (err) {
      console.error("Error loading reminders:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.medication || !form.time) return;

    try {
      await createReminder(form); // sends { medication, time }
      setForm({ medication: '', time: '' });
      loadReminders(); // refresh list after adding
    } catch (err) {
      console.error("Error creating reminder:", err.response?.data || err.message);
    }
  };

  const remove = async (id) => {
    try {
      await deleteReminder(id);
      loadReminders();
    } catch (err) {
      console.error("Error deleting reminder:", err.response?.data || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create Reminder</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Medication</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={form.medication}
              onChange={(e) => setForm({ ...form, medication: e.target.value })}
              placeholder="Enter medication"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">Add Reminder</button>
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
              <li key={r._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.medication}</div>
                  <div className="text-sm text-gray-500">{r.time}</div>
                </div>
                <button
                  onClick={() => remove(r._id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RemindersPage;
