import React from 'react';
import { Clock, Calendar, TrendingUp, AlertCircle, Plus, Bell } from 'lucide-react';

const Dashboard = ({ medications = [] }) => {
  // Get upcoming medications (next 6 hours)
  const upcomingMeds = medications
    .filter(med => {
      if (!med.nextDose) return false;
      const now = new Date();
      const nextDose = new Date(med.nextDose);
      const timeDiff = nextDose.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff > 0 && hoursDiff <= 6;
    })
    .sort((a, b) => new Date(a.nextDose) - new Date(b.nextDose))
    .slice(0, 3);

  // Calculate average adherence
  const averageAdherence = medications.length > 0 
    ? Math.round(medications.reduce((sum, med) => sum + (med.adherence || 0), 0) / medications.length)
    : 0;

  // Count overdue medications
  const overdueCount = medications.filter(med => {
    if (!med.nextDose) return false;
    return new Date(med.nextDose) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-indigo-100">Here's your medication overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Adherence Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageAdherence}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Medications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Medications</h3>
        <div className="space-y-3">
          {upcomingMeds.length > 0 ? (
            upcomingMeds.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {med.nextDose ? new Date(med.nextDose).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : med.time}
                  </p>
                  <p className="text-xs text-gray-500">
                    {med.nextDose ? new Date(med.nextDose).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming medications in the next 6 hours</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            <Plus className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-indigo-600">Add Medication</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Clock className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-600">Log Dose</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <Bell className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-600">Set Reminder</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-600">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;