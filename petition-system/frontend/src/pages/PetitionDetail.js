import React from 'react';
import { FileText } from 'lucide-react';

const PetitionDetail = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Petition Details
          </h1>
          <p className="text-gray-600 mb-8">
            View and manage petition details
          </p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <p className="text-gray-500">
              Petition detail page implementation coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetail;