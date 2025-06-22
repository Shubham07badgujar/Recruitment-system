import PropTypes from 'prop-types';
import { calculateMatchPercentage } from '../utils/helpers';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const CandidateCard = ({ candidate, onScheduleInterview }) => {
  const matchPercentage = calculateMatchPercentage(candidate.matchScore);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
            <p className="text-gray-600">{candidate.email}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              matchPercentage >= 80 
                ? 'bg-green-100 text-green-800' 
                : matchPercentage >= 60 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {matchPercentage}% Match
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-900">Summary</h4>
          <p className="mt-1 text-sm text-gray-600 line-clamp-3">
            {candidate.summary}
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-900">Skills</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.map((skill, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-900">Matching Analysis</h4>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Strengths</p>
                <p className="text-gray-600">{candidate.strengths}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Missing Skills</p>
                <p className="text-gray-600">{candidate.missingSkills.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => onScheduleInterview(candidate.id)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
};

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    matchScore: PropTypes.number.isRequired,
    summary: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    strengths: PropTypes.string.isRequired,
    missingSkills: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onScheduleInterview: PropTypes.func.isRequired
};

export default CandidateCard;
