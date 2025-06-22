import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ScheduleModal = ({ isOpen, onClose, onSchedule, candidate, availableTimeSlots }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  
  // Reset the form when the modal opens with a new candidate
  useEffect(() => {
    if (isOpen) {
      setSelectedTimeSlot('');
      setSendEmail(true);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      candidateId: candidate.id,
      timeSlot: selectedTimeSlot,
      sendEmail
    });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        {/* Center modal */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Schedule Interview
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      Scheduling interview for <span className="font-medium text-gray-900">{candidate.name}</span>
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time Slot
                      </label>
                      <select
                        id="timeSlot"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        required
                      >
                        <option value="">Select a time slot</option>
                        {availableTimeSlots.map((slot, index) => (
                          <option key={index} value={slot.id}>
                            {slot.date} - {slot.time}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <input
                        id="sendEmail"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                      />
                      <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-900">
                        Send confirmation email to candidate
                      </label>
                    </div>
                    
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Schedule
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSchedule: PropTypes.func.isRequired,
  candidate: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  availableTimeSlots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ScheduleModal;
