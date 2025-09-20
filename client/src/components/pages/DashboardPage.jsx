import React from 'react';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="card bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
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
        <h2 className="text-lg font-semibold mb-2">Welcome to MediTrack</h2>
        <p className="text-gray-600 text-sm">This is a placeholder dashboard extracted from the legacy HTML. We'll wire real data next.</p>
      </div>
    </div>
  );
}

export default DashboardPage;


