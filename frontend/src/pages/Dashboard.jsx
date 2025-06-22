import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import CandidateCard from '../components/CandidateCard';
import ScheduleModal from '../components/ScheduleModal';
import Loader from '../components/Loader';
import { getCandidates, scheduleInterview } from '../services/api';

// Mock data for development
const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    matchScore: 0.92,
    summary: 'Senior software engineer with 8+ years of experience in web development and cloud architecture. Proficient in React, Node.js, and AWS.',
    skills: ['React', 'Node.js', 'JavaScript', 'AWS', 'MongoDB'],
    strengths: 'Strong frontend and backend experience with modern JavaScript frameworks. Has led teams of 5-7 developers.',
    missingSkills: ['GraphQL', 'Docker']
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    matchScore: 0.86,
    summary: 'Full stack developer with 5 years experience specializing in React and Python. Passionate about creating scalable and maintainable code.',
    skills: ['React', 'Python', 'Django', 'PostgreSQL', 'Redux'],
    strengths: 'Excellent problem solving skills and experience with complex data visualization.',
    missingSkills: ['AWS', 'Kubernetes']
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david.chen@example.com',
    matchScore: 0.78,
    summary: 'Frontend developer with 3 years of experience in building responsive web applications. Specializes in modern UI frameworks.',
    skills: ['React', 'TypeScript', 'CSS', 'SASS', 'Webpack'],
    strengths: 'Strong UI/UX sensibilities and experience with design systems.',
    missingSkills: ['Node.js', 'Express', 'Backend development']
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    matchScore: 0.67,
    summary: 'DevOps engineer with experience in CI/CD pipelines, container orchestration, and cloud infrastructure management.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    strengths: 'Infrastructure automation and containerization expertise.',
    missingSkills: ['React', 'Frontend development', 'UI frameworks']
  }
];

// Mock available time slots
const mockTimeSlots = [
  { id: 'ts1', date: 'June 25, 2025', time: '10:00 AM - 11:00 AM' },
  { id: 'ts2', date: 'June 25, 2025', time: '2:00 PM - 3:00 PM' },
  { id: 'ts3', date: 'June 26, 2025', time: '11:00 AM - 12:00 PM' },
  { id: 'ts4', date: 'June 27, 2025', time: '9:00 AM - 10:00 AM' },
  { id: 'ts5', date: 'June 27, 2025', time: '3:00 PM - 4:00 PM' },
];

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeSlots] = useState(mockTimeSlots);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('matchScore');
  
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        // In a real application, you'd use this:
        // const response = await getCandidates();
        // setCandidates(response.data);
        
        // For demo purposes, we'll use mock data with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCandidates(mockCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError('Failed to load candidates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);
  
  useEffect(() => {
    // Filter candidates based on search term
    let filtered = candidates;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = candidates.filter(
        candidate =>
          candidate.name.toLowerCase().includes(term) ||
          candidate.email.toLowerCase().includes(term) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    
    // Sort candidates
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === 'matchScore') {
        return b.matchScore - a.matchScore;
      } else if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, sortOption]);
  
  const handleScheduleInterview = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };
  
  const handleScheduleSubmit = async (data) => {
    try {
      // In a real application, you'd use this:
      // await scheduleInterview(data.candidateId, data.timeSlot);
      
      // For demo purposes, we'll just log the data
      console.log('Scheduled interview:', data);
      
      // Show success message (in a real app, you'd use a toast notification)
      alert(`Interview scheduled with ${selectedCandidate.name}`);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      // Show error message
      alert('Failed to schedule interview. Please try again.');
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage potential candidates matched to your job description
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload More Documents
            </Link>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search Candidates
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name, email, or skills"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <label htmlFor="sort" className="sr-only">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="matchScore">Sort by Match Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No candidates match your search criteria.' 
                : 'Upload a job description and resumes to see matched candidates.'}
            </p>
            {searchTerm && (
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setSearchTerm('')}
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
              {searchTerm && ' matching your search'}
            </p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onScheduleInterview={handleScheduleInterview}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Schedule Interview Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSchedule={handleScheduleSubmit}
        candidate={selectedCandidate || {}}
        availableTimeSlots={timeSlots}
      />
    </div>
  );
};

export default Dashboard;
