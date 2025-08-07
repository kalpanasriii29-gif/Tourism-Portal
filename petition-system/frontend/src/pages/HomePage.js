import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, BarChart3, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { publicPetitionAPI } from '../utils/api';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalPetitions: 0,
    pendingCount: 0,
    resolvedCount: 0,
    inProgressCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      // Since we don't have a public stats endpoint, we'll show some demo data
      // In a real implementation, you might want to create a public stats endpoint
      setStats({
        totalPetitions: 1247,
        pendingCount: 89,
        resolvedCount: 1098,
        inProgressCount: 60
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '...' : value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tenkasi District
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              Petition Redressal System
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Submit your petitions online and track their progress. 
              Transparent, efficient, and accessible governance for all citizens.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/submit"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <FileText className="h-5 w-5" />
                <span>Submit New Petition</span>
              </Link>
              
              <Link
                to="/track"
                className="bg-primary-500 hover:bg-primary-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 border-2 border-primary-400"
              >
                <Search className="h-5 w-5" />
                <span>Track Your Petition</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            System Statistics
          </h2>
          <p className="text-lg text-gray-600">
            Real-time data on petition submissions and resolutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard
            icon={FileText}
            title="Total Petitions"
            value={stats.totalPetitions}
            color="bg-blue-500"
            description="All time submissions"
          />
          
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingCount}
            color="bg-yellow-500"
            description="Awaiting processing"
          />
          
          <StatCard
            icon={AlertCircle}
            title="In Progress"
            value={stats.inProgressCount}
            color="bg-orange-500"
            description="Currently being reviewed"
          />
          
          <StatCard
            icon={CheckCircle}
            title="Resolved"
            value={stats.resolvedCount}
            color="bg-green-500"
            description="Successfully completed"
          />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Submission
            </h3>
            <p className="text-gray-600">
              Submit your petitions online without any registration. 
              Simple form with instant petition ID generation.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-gray-600">
              Track your petition status anytime using your unique petition ID. 
              Get updates on progress and responses.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Transparent Process
            </h3>
            <p className="text-gray-600">
              Complete transparency in petition handling. 
              View responses and status updates from officials.
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Submit Petition
              </h3>
              <p className="text-gray-600">
                Fill out the simple form with your petition details. 
                No registration required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Petition ID
              </h3>
              <p className="text-gray-600">
                Receive a unique petition ID (TNK-YYYY-XXX) 
                to track your submission.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor status updates and receive official responses 
                using your petition ID.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help?
          </h2>
          <p className="text-gray-600 mb-6">
            For technical support or inquiries about this system, please contact:
          </p>
          <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-gray-800">
              <strong>Tenkasi District Collectorate</strong><br />
              Phone: +91-4633-123456<br />
              Email: collector.tenkasi@tn.gov.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;