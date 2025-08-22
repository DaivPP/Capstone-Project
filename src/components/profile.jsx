import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Edit, Save } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    birthDate: '1985-06-15',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    allergies: 'Penicillin, Shellfish',
    conditions: 'Hypertension, Type 2 Diabetes',
    pharmacy: 'CVS Pharmacy - Main Street'
  });

  const handleSave = () => {
    setIsEditing(false);
    // for backend  team to persist changes
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
            {isEditing ? (
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.birthDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.emergencyContact}</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
            {isEditing ? (
              <textarea
                value={profile.allergies}
                onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="2"
              />
            ) : (
              <p className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {profile.allergies}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
            {isEditing ? (
              <textarea
                value={profile.conditions}
                onChange={(e) => setProfile({...profile, conditions: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="2"
              />
            ) : (
              <p className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                {profile.conditions}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Pharmacy</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.pharmacy}
                onChange={(e) => setProfile({...profile, pharmacy: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{profile.pharmacy}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;