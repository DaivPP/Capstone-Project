import React, { useState, useEffect } from 'react';
import { getMedications, markAsTaken } from '../services/api';

function MedicationList() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await getMedications();
      setMedications(response.data.data.medications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (id) => {
    try {
      await markAsTaken(id);
      // Update the specific medication in state instead of refetching all
      setMedications(medications.map(med => 
        med._id === id 
          ? {...med, adherence: [...med.adherence, {date: new Date(), taken: true, timeTaken: new Date()}]}
          : med
      ));
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card medication-list">
      <h2 className="section-title">Current Medications</h2>
      {medications.map(medication => (
        <div key={medication._id} className="medication-item">
          <div className="medication-color" style={{ backgroundColor: medication.colorCode || '#4361ee' }}></div>
          <div className="medication-info">
            <div className="medication-name">{medication.name}</div>
            <div className="medication-details">
              {medication.dosage.value} {medication.dosage.unit} • {medication.frequency} • {medication.purpose}
            </div>
          </div>
          <div className="medication-time">{medication.reminders && medication.reminders[0]?.time}</div>
          <button 
            className="btn btn-primary"
            onClick={() => handleMarkAsTaken(medication._id)}
          >
            Mark Taken
          </button>
        </div>
      ))}
    </div>
  );
}

export default MedicationList;