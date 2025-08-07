import React, { useState } from 'react';
import { Search, FileText, Clock, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { publicPetitionAPI, STATUS_CONFIG, PRIORITY_CONFIG, handleAPIError } from '../utils/api';

const TrackPetition = () => {
  const [petitionId, setPetitionId] = useState('');
  const [petitionData, setPetitionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!petitionId.trim()) {
      setError('Please enter a petition ID');
      return;
    }

    if (!/^TNK-\d{4}-\d{3}$/.test(petitionId.trim())) {
      setError('Invalid petition ID format. Expected format: TNK-YYYY-XXX');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await publicPetitionAPI.track(petitionId.trim());
      
      if (response.data.success) {
        setPetitionData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch petition');
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      if (error.response?.status === 404) {
        setError('Petition not found. Please check your petition ID.');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
      setPetitionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPetitionId('');
    setPetitionData(null);
    setError('');
  };

  const StatusTimeline = ({ petition, responses }) => {
    const getStatusColor = (status) => {
      return STATUS_CONFIG[status]?.color || 'gray';
    };

    const getStatusIcon = (status) => {
      return STATUS_CONFIG[status]?.icon || '⚪';
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
        
        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-${getStatusColor(petition.status)}-500`}></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(petition.status)}</span>
                <span className={`status-badge status-${petition.status}`}>
                  {STATUS_CONFIG[petition.status]?.label || petition.status}
                </span>
                {petition.priority !== 'normal' && (
                  <span className={`status-badge priority-${petition.priority}`}>
                    {PRIORITY_CONFIG[petition.priority]?.icon} {PRIORITY_CONFIG[petition.priority]?.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {STATUS_CONFIG[petition.status]?.description}
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {format(new Date(petition.updated_at), 'PPpp')}
              </p>
            </div>
          </div>

          {/* Submission */}
          <div className="flex items-center space-x-3 opacity-75">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📝</span>
                <span className="font-medium text-gray-900">Submitted</span>
              </div>
              <p className="text-sm text-gray-600">Petition received and assigned ID</p>
              <p className="text-xs text-gray-500">
                {format(new Date(petition.created_at), 'PPpp')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ResponsesSection = ({ responses }) => {
    if (!responses || responses.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Official Responses</h3>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No responses yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Officials will respond to your petition once it's reviewed
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Official Responses ({responses.length})
        </h3>
        
        <div className="space-y-4">
          {responses.map((response, index) => (
            <div key={index} className="border-l-4 border-primary-500 pl-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary-500" />
                  <span className="font-medium text-gray-900">
                    Official Response {index + 1}
                  </span>
                  {response.is_final && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Final Response
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(response.response_date), 'PPp')}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {response.response_text}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Petition
          </h1>
          <p className="text-gray-600">
            Enter your petition ID to view the current status and any official responses
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="petitionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Petition ID
                </label>
                <input
                  type="text"
                  id="petitionId"
                  value={petitionId}
                  onChange={(e) => setPetitionId(e.target.value.toUpperCase())}
                  className={`input-field ${error ? 'border-red-500' : ''}`}
                  placeholder="Enter petition ID (e.g., TNK-2025-001)"
                  maxLength={12}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Format: TNK-YYYY-XXX (e.g., TNK-2025-001)
                </p>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn-primary flex items-center space-x-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Track</span>
                    </>
                  )}
                </button>
                
                {petitionData && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Petition Details */}
        {petitionData && (
          <div className="space-y-6">
            {/* Petition Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Petition Details
                </h2>
                <span className="text-2xl font-bold text-primary-600">
                  {petitionData.petition.petition_id}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted by</p>
                      <p className="text-gray-900">{petitionData.petition.from_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-gray-900">{petitionData.petition.to_department}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted on</p>
                      <p className="text-gray-900">
                        {format(new Date(petitionData.petition.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last updated</p>
                      <p className="text-gray-900">
                        {format(new Date(petitionData.petition.updated_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Petition Description</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {petitionData.petition.petition_text}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <StatusTimeline 
              petition={petitionData.petition} 
              responses={petitionData.responses} 
            />

            {/* Responses */}
            <ResponsesSection responses={petitionData.responses} />
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Need Help?</p>
                <p>
                  If you can't find your petition or need assistance, please contact the 
                  relevant department directly or visit the district collectorate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPetition;