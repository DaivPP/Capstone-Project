import React, { useState, useEffect } from 'react';
import { createDoctor, getDoctors, deleteDoctor } from '../services/Api.js';

function DoctorsPage() {
  const [form, setForm] = useState({ name: '', specialty: '' });
  const [doctors, setDoctors] = useState([]);

  // 🔹 Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data); // assuming backend returns array
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty) return;

    try {
      await createDoctor(form);
      setForm({ name: '', specialty: '' });
      loadDoctors(); // refresh list after add
    } catch (err) {
      console.error("Error creating doctor:", err);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoctor(id);
      loadDoctors(); // refresh after delete
    } catch (err) {
      console.error("Error deleting doctor:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Doctors</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Doctor's Name:</label>
            <input
              className="w-full border rounded p-2"
              value={form.name}
              onChange={(e)=>setForm({...form, name: e.target.value})}
              placeholder="Enter doctor's name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Specialty:</label>
            <input
              className="w-full border rounded p-2"
              value={form.specialty}
              onChange={(e)=>setForm({...form, specialty: e.target.value})}
              placeholder="e.g., Cardiologist"
            />
          </div>
          <div className="md:col-span-3">
            <button className="btn btn-primary">Add Doctor</button>
          </div>
        </form>
      </div>

      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-3">Your Doctors</h3>
        {doctors.length === 0 ? (
          <p className="text-sm text-gray-500">No doctors added yet.</p>
        ) : (
          <ul className="space-y-2">
            {doctors.map(d => (
              <li key={d._id || d.id} className="border rounded p-3 flex justify-between">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-500">{d.specialty}</div>
                </div>
                <button
                  onClick={() => remove(d._id || d.id)}
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

export default DoctorsPage;


