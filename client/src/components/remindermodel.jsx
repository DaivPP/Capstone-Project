import React, { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

const ReminderModal = ({ isOpen, onClose, medication, onSetReminder }) => {
  const [reminderTime, setReminderTime] = useState('15');
  const [reminderType, setReminderType] = useState('minutes');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetReminder({
      medicationId: medication.id,
      time: reminderTime,
      type: reminderType
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Set Reminder</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">Setting reminder for:</p>
          <p className="font-medium text-gray-900">{medication?.name} - {medication?.dosage}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remind me before:
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReminderModal;
