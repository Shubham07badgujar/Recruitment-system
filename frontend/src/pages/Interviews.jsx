import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import { getScheduledInterviews, setAvailableTimeSlots } from '../services/api';
import { formatDate } from '../utils/helpers';

// Mock data for development
const mockScheduledInterviews = [
  {
    id: 'int1',
    candidateId: '1',
    candidateName: 'John Smith',
    candidateEmail: 'john.smith@example.com',
    timeSlot: {
      date: 'June 25, 2025',
      time: '10:00 AM - 11:00 AM'
    },
    status: 'confirmed',
    scheduledAt: '2025-06-20T15:30:00Z'
  },
  {
    id: 'int2',
    candidateId: '2',
    candidateName: 'Maria Rodriguez',
    candidateEmail: 'maria.rodriguez@example.com',
    timeSlot: {
      date: 'June 26, 2025',
      time: '11:00 AM - 12:00 PM'
    },
    status: 'pending',
    scheduledAt: '2025-06-21T09:15:00Z'
  }
];

const Interviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviews, setInterviews] = useState([]);
  
  // Available time slots state
  const [availableSlots, setAvailableSlots] = useState([
    { id: Date.now(), date: '', time: '' }
  ]);
  const [isSubmittingSlots, setIsSubmittingSlots] = useState(false);
  const [slotsSuccess, setSlotsSuccess] = useState(false);
  
  // Filter interviews by status
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        // In a real application, you'd use this:
        // const response = await getScheduledInterviews();
        // setInterviews(response.data);
        
        // For demo purposes, we'll use mock data with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInterviews(mockScheduledInterviews);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setError('Failed to load scheduled interviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);
  
  const handleAddTimeSlot = () => {
    setAvailableSlots([...availableSlots, { id: Date.now(), date: '', time: '' }]);
  };
  
  const handleRemoveTimeSlot = (id) => {
    if (availableSlots.length > 1) {
      setAvailableSlots(availableSlots.filter(slot => slot.id !== id));
    }
  };
  
  const handleTimeSlotChange = (id, field, value) => {
    setAvailableSlots(
      availableSlots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };
  
  const handleSubmitTimeSlots = async (e) => {
    e.preventDefault();
    
    // Validate slots
    const validSlots = availableSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length === 0) {
      alert('Please add at least one valid time slot with both date and time.');
      return;
    }
    
    setIsSubmittingSlots(true);
    
    try {
      // In a real application, you'd use this:
      // await setAvailableTimeSlots(validSlots);
      
      // For demo purposes, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSlotsSuccess(true);
      setTimeout(() => setSlotsSuccess(false), 3000);
    } catch (error) {
      console.error('Error setting available time slots:', error);
      alert('Failed to save time slots. Please try again.');
    } finally {
      setIsSubmittingSlots(false);
    }
  };
  
  const filteredInterviews = interviews.filter(interview => {
    if (statusFilter === 'all') return true;
    return interview.status === statusFilter;
  });
  
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Scheduler</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manage your interview schedule and available time slots
        </p>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Available Time Slots Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Set Available Time Slots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Define when you're available for interviews
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmitTimeSlots}>
                  {availableSlots.map((slot, index) => (
                    <div key={slot.id} className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Slot {index + 1}</span>
                        {availableSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(slot.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmittingSlots}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label htmlFor={`date-${slot.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            id={`date-${slot.id}`}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={slot.date}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'date', e.target.value)}
                            required
                            disabled={isSubmittingSlots}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`time-${slot.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Time Range
                          </label>
                          <input
                            type="text"
                            id={`time-${slot.id}`}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g. 10:00 AM - 11:00 AM"
                            value={slot.time}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'time', e.target.value)}
                            required
                            disabled={isSubmittingSlots}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isSubmittingSlots}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Slot
                    </button>
                    
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isSubmittingSlots}
                    >
                      {isSubmittingSlots ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Time Slots'}
                    </button>
                  </div>
                  
                  {slotsSuccess && (
                    <div className="mt-3 p-2 bg-green-50 text-green-800 text-sm rounded-md">
                      Time slots saved successfully!
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          
          {/* Scheduled Interviews Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Scheduled Interviews</h3>
                  
                  <div>
                    <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                    <select
                      id="status-filter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Interviews</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {loading ? (
                  <Loader />
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : filteredInterviews.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {statusFilter !== 'all' 
                        ? `No ${statusFilter} interviews found.`
                        : 'No interviews have been scheduled yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredInterviews.map((interview) => (
                      <div 
                        key={interview.id} 
                        className={`border rounded-lg overflow-hidden shadow-sm ${
                          interview.status === 'confirmed' 
                            ? 'border-green-200' 
                            : 'border-yellow-200'
                        }`}
                      >
                        <div className={`px-4 py-3 ${
                          interview.status === 'confirmed' 
                            ? 'bg-green-50' 
                            : 'bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-center">
                            <h4 className="text-md font-medium text-gray-900">
                              Interview with {interview.candidateName}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              interview.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {interview.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="px-4 py-4 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Date</p>
                                <p className="text-sm text-gray-500">{interview.timeSlot.date}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Time</p>
                                <p className="text-sm text-gray-500">{interview.timeSlot.time}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Candidate</p>
                                <p className="text-sm text-gray-500">{interview.candidateEmail}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Scheduled on</p>
                                <p className="text-sm text-gray-500">{formatDate(interview.scheduledAt)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interviews;
