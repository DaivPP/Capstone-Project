import React from 'react';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="card bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm text-app-violet">{title}</h3>
      <div className="text-2xl font-semibold text-app-white">{value}</div>
      {subtitle && <div className="text-xs text-app-white mt-1 opacity-80">{subtitle}</div>}
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Medications" value="6" subtitle="Active medications" />
        <StatCard title="Adherence" value="92%" subtitle="Last 7 days" />
        <StatCard title="Upcoming" value="3" subtitle="Next 24 hours" />
        <StatCard title="Reminders" value="12" subtitle="This week" />
      </div>
      <div className="card bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-app-violet">Welcome to MediTrack</h2>
        <p className="text-app-white text-sm">
          Welcome to MediTrack – your intelligent healthcare companion. MediTrack is designed to simplify the way you manage health records, monitor treatments, and track wellness progress. With an intuitive interface and powerful tools, it brings together patients, doctors, and caregivers on a single platform, ensuring accurate, real-time access to medical information. Whether it’s organizing prescriptions, keeping up with appointments, or monitoring vitals, MediTrack empowers you to take control of your health with confidence and ease.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;


