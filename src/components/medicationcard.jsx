import React from 'react';
import { Clock, Pill, MoreVertical } from 'lucide-react';

const MedicationCard = ({ medication, onEdit, onDelete, onTaken }) => {
  const isOverdue = medication.nextDose < new Date();
  
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
      isOverdue ? 'border-l-red-500' : 'border-l-green-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`p-3 rounded-lg ${
            isOverdue ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <Pill className={`h-6 w-6 ${
              isOverdue ? 'text-red-600' : 'text-green-600'
            }`} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
            <p className="text-gray-600">{medication.dosage}</p>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                {medication.frequency} at {medication.time}
              </span>
            </div>
            {medication.notes && (
              <p className="text-sm text-gray-500 mt-1">{medication.notes}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right mr-2">
            <p className="text-sm text-gray-500">Next dose</p>
            <p className={`text-sm font-medium ${
              isOverdue ? 'text-red-600' : 'text-gray-900'
            }`}>
              {medication.nextDose.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Adherence:</span>
          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{width: `${medication.adherence}%`}}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900">{medication.adherence}%</span>
        </div>
        
        <button
          onClick={() => onTaken(medication.id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Mark as Taken
        </button>
      </div>
    </div>
  );
};
export default MedicationCard;

