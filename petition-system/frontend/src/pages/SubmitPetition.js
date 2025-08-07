import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Send, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicPetitionAPI, DEPARTMENTS, handleAPIError } from '../utils/api';

const SubmitPetition = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from_name: '',
    to_department: '',
    whatsapp_number: '',
    petition_text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from_name.trim()) {
      newErrors.from_name = 'Name is required';
    } else if (formData.from_name.trim().length < 2) {
      newErrors.from_name = 'Name must be at least 2 characters';
    }

    if (!formData.to_department) {
      newErrors.to_department = 'Please select a department';
    }

    if (!formData.whatsapp_number.trim()) {
      newErrors.whatsapp_number = 'WhatsApp number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.petition_text.trim()) {
      newErrors.petition_text = 'Petition text is required';
    } else if (formData.petition_text.trim().length < 10) {
      newErrors.petition_text = 'Petition text must be at least 10 characters';
    } else if (formData.petition_text.trim().length > 5000) {
      newErrors.petition_text = 'Petition text must not exceed 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await publicPetitionAPI.submit(formData);
      
      if (response.data.success) {
        setSubmissionResult(response.data.data);
        toast.success('Petition submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSubmission = () => {
    setFormData({
      from_name: '',
      to_department: '',
      whatsapp_number: '',
      petition_text: ''
    });
    setSubmissionResult(null);
    setErrors({});
  };

  // Success screen
  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Petition Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Your petition has been received and assigned a unique ID.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Your Petition ID
              </h2>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {submissionResult.petition_id}
              </div>
              <p className="text-sm text-green-700">
                Please save this ID to track your petition status
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Petition Details:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {submissionResult.from_name}</div>
                <div><strong>Department:</strong> {submissionResult.to_department}</div>
                <div><strong>Status:</strong> <span className="status-badge status-pending">Pending</span></div>
                <div><strong>Submitted:</strong> {new Date(submissionResult.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(`/track`)}
                className="btn-primary"
              >
                Track This Petition
              </button>
              
              <button
                onClick={handleNewSubmission}
                className="btn-secondary"
              >
                Submit Another Petition
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Submit New Petition
          </h1>
          <p className="text-gray-600">
            Fill out the form below to submit your petition to the relevant department.
            No registration required.
          </p>
        </div>

        {/* Information Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Important Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All fields are mandatory</li>
                <li>You will receive a unique petition ID after submission</li>
                <li>Use your WhatsApp number for future communication</li>
                <li>Keep your petition ID safe for tracking purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Petition Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="from_name"
              name="from_name"
              value={formData.from_name}
              onChange={handleInputChange}
              className={`input-field ${errors.from_name ? 'border-red-500' : ''}`}
              placeholder="Enter your full name"
              maxLength={100}
            />
            {errors.from_name && (
              <p className="mt-1 text-sm text-red-600">{errors.from_name}</p>
            )}
          </div>

          {/* Department Field */}
          <div className="mb-6">
            <label htmlFor="to_department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              id="to_department"
              name="to_department"
              value={formData.to_department}
              onChange={handleInputChange}
              className={`input-field ${errors.to_department ? 'border-red-500' : ''}`}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.to_department && (
              <p className="mt-1 text-sm text-red-600">{errors.to_department}</p>
            )}
          </div>

          {/* WhatsApp Number Field */}
          <div className="mb-6">
            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number *
            </label>
            <input
              type="tel"
              id="whatsapp_number"
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
              className={`input-field ${errors.whatsapp_number ? 'border-red-500' : ''}`}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
            {errors.whatsapp_number && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter your 10-digit mobile number (e.g., 9876543210)
            </p>
          </div>

          {/* Petition Text Field */}
          <div className="mb-6">
            <label htmlFor="petition_text" className="block text-sm font-medium text-gray-700 mb-2">
              Petition Details *
            </label>
            <textarea
              id="petition_text"
              name="petition_text"
              value={formData.petition_text}
              onChange={handleInputChange}
              rows={8}
              className={`input-field resize-none ${errors.petition_text ? 'border-red-500' : ''}`}
              placeholder="Describe your petition in detail. Include relevant facts, dates, and any supporting information."
              maxLength={5000}
            />
            {errors.petition_text && (
              <p className="mt-1 text-sm text-red-600">{errors.petition_text}</p>
            )}
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>Minimum 10 characters required</span>
              <span>{formData.petition_text.length}/5000 characters</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary flex items-center space-x-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Petition</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help filling out this form?{' '}
            <a href="/" className="text-primary-600 hover:text-primary-700">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmitPetition;