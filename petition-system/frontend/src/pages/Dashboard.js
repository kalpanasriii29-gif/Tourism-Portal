import React from 'react';
import { BarChart3 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Official Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Manage and respond to citizen petitions
          </p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <p className="text-gray-500">
              Dashboard implementation coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;