import React, { useState } from 'react'; // eslint-disable-line no-unused-vars
import { Clock, Pill, User, Plus, Bell, Home, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MedicationList from './components/MedicationList';
import AddMedication from './components/AddMedication';
import Profile from './components/Profile';
import Notifications from './components/Notifications';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Daily',
      time: '09:00',
      notes: 'Take with food',
      nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000),
      adherence: 85
    },
    {
      id: 2,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      time: '08:00',
      notes: 'Take in morning',
      nextDose: new Date(Date.now() + 1 * 60 * 60 * 1000),
      adherence: 92
    }
  ]);

  const addMedication = (medication) => {
    const newMedication = {
      ...medication,
      id: Date.now(),
      adherence: 100,
      nextDose: new Date()
    };
    setMedications([...medications, newMedication]);
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (updatedMed) => {
    setMedications(medications.map(med => 
      med.id === updatedMed.id ? updatedMed : med
    ));
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'add', label: 'Add Med', icon: Plus },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard medications={medications} />;
    case "medications":
      return (
        <MedicationList 
          medications={medications}
          onDelete={deleteMedication}
          onUpdate={updateMedication}
        />
      );
    case "add":
      return <AddMedication onAdd={addMedication} />;
    case "notifications":
      return <Notifications medications={medications} />;
    case "profile":
      return <Profile />;
    default:
      return <Dashboard medications={medications} />;
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">MedTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-indigo-600" />
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
