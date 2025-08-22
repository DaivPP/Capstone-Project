import React, { useState } from 'react';
import { Pill, Clock, Edit, Trash2, Check } from 'lucide-react';

const MedicationList = ({ medications, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEditing = (med) => {
    setEditingId(med.id);
    setEditForm(med);
  };

  const saveEdit = () => {
    onUpdate(editForm);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Medications</h2>
        
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {editingId === med.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Medication name"
                    />
                    <input
                      type="text"
                      value={editForm.dosage}
                      onChange={(e) => setEditForm({...editForm, dosage: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Dosage"
                    />
                    <select
                      value={editForm.frequency}
                      onChange={(e) => setEditForm({...editForm, frequency: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="As needed">As needed</option>
                    </select>
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Notes"
                    rows="2"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Pill className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{med.name}</h3>
                      <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{med.time}</span>
                      </div>
                      {med.notes && (
                        <p className="text-sm text-gray-500 mt-1">{med.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <p className="text-sm text-gray-500">Adherence</p>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${med.adherence}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{med.adherence}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditing(med)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(med.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {medications.length === 0 && (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medications added yet</p>
              <p className="text-sm text-gray-400">Start by adding your first medication</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationList;