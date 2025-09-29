import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import '../../styles/index.css';

function Sidebar() {
  return (
    <aside className="sidebar bg-neutral-900 text-white p-4 fixed h-screen overflow-y-auto">
      <div className="logo mb-6">
        <span className="logo-icon mr-2">💊</span>
        <span className="logo-text font-bold">MediTrack</span>
      </div>
      <ul className="nav-menu space-y-2">
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app" end>
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app/medications">
            Medications
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app/reminders">
            Reminders
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app/history">
            History
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app/reports">
            Reports
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link block px-3 py-2 rounded" to="/app/doctors">
            Doctors
          </NavLink>
        </li>
        <li className="nav-item">
  <a 
    className="nav-link block px-3 py-2 rounded" 
    href="https://meditrack-complete-medication-management.onrender.com" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    Disease Prediction
  </a>
</li>

      </ul>
    </aside>
  );
}

function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="header flex justify-between items-center p-4">
      <h1 className="page-title text-xl font-semibold">MediTrack</h1>
      <div 
        className="user-profile relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <div 
            className="user-avatar bg-indigo-600 overflow-hidden"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #e5e7eb'
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format&q=100"
              alt="User Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </div>
          <span className="user-name text-sm">User</span>
        </div>
        
        {isHovered && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
            style={{
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            <Link
              to="/login"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Login
              
            </Link>
            <div className="border-t border-gray-100"></div>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                // Add logout functionality here
                console.log('Logout clicked');
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content p-4">
        <Header />
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}

export default Layout;


