import React, { useState } from 'react';
import { Bell, Clock, AlertCircle, Check, X } from 'lucide-react';

const Notifications = ({ medications }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: 'Time to take Aspirin',
      message: 'Your 100mg Aspirin dose is due now',
      time: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      medication: 'Aspirin'
    },
    {
      id: 2,
      type: 'missed',
      title: 'Missed dose alert',
      message: 'You missed your Vitamin D dose at 8:00 AM',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      medication: 'Vitamin D'
    },
    {
      id: 3,
      type: 'refill',
      title: 'Refill reminder',
      message: 'You have 3 days of Aspirin remaining',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      medication: 'Aspirin'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'missed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'refill':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'reminder':
        return 'border-l-blue-500 bg-blue-50';
      case 'missed':
        return 'border-l-red-500 bg-red-50';
      case 'refill':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
        
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border-l-4 p-4 rounded-lg ${getNotificationColor(notif.type)} ${
                notif.read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    <p className="text-gray-700 mt-1">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {notif.time.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissNotification(notif.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Medication Reminders</p>
              <p className="text-sm text-gray-600">Get notified when it's time to take your medication</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Refill Alerts</p>
              <p className="text-sm text-gray-600">Get reminded when medication supply is low</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Missed Dose Alerts</p>
              <p className="text-sm text-gray-600">Get notified if you miss a scheduled dose</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
