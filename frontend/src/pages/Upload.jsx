import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { uploadJobDescription, uploadResume } from '../services/api';
import { isPDF, formatFileSize } from '../utils/helpers';

const Upload = () => {
  const navigate = useNavigate();
  
  // JD Upload State
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdUploading, setJdUploading] = useState(false);
  
  // Resume Upload State
  const [resumeFiles, setResumeFiles] = useState([]);
  const [resumeUploading, setResumeUploading] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  const handleJdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isPDF(file)) {
        setJdFile(file);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please upload a PDF file'
        });
        setTimeout(() => setNotification({ show: false }), 3000);
      }
    }
  };
  
  const handleResumeFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => isPDF(file));
    
    if (validFiles.length !== files.length) {
      setNotification({
        show: true,
        type: 'warning',
        message: 'Some files were not added. Only PDF files are supported.'
      });
      setTimeout(() => setNotification({ show: false }), 3000);
    }
    
    setResumeFiles(validFiles);
  };
  
  const removeResumeFile = (index) => {
    setResumeFiles(resumeFiles.filter((_, i) => i !== index));
  };
  
  const handleJdSubmit = async (e) => {
    e.preventDefault();
    
    if (!jdFile && !jdText.trim()) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please upload a file or enter job description text'
      });
      setTimeout(() => setNotification({ show: false }), 3000);
      return;
    }
    
    setJdUploading(true);
    
    try {
      const formData = new FormData();
      
      if (jdFile) {
        formData.append('file', jdFile);
      } else {
        formData.append('text', jdText);
      }
      
      // In a real application, you'd use this:
      // await uploadJobDescription(formData);
      
      // For demo purposes, we'll simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Job description uploaded successfully!'
      });
      
      // Clear form
      setJdFile(null);
      setJdText('');
      
      setTimeout(() => {
        setNotification({ show: false });
        // If resumes are also uploaded, navigate to dashboard
        if (resumeFiles.length > 0) {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Error uploading job description:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error uploading job description. Please try again.'
      });
      setTimeout(() => setNotification({ show: false }), 3000);
    } finally {
      setJdUploading(false);
    }
  };
  
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    
    if (resumeFiles.length === 0) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please upload at least one resume'
      });
      setTimeout(() => setNotification({ show: false }), 3000);
      return;
    }
    
    setResumeUploading(true);
    
    try {
      const formData = new FormData();
      resumeFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // In a real application, you'd use this:
      // await uploadResume(formData);
      
      // For demo purposes, we'll simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotification({
        show: true,
        type: 'success',
        message: `${resumeFiles.length} resume(s) uploaded successfully!`
      });
      
      // Clear form
      setResumeFiles([]);
      
      setTimeout(() => {
        setNotification({ show: false });
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error uploading resumes:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error uploading resumes. Please try again.'
      });
      setTimeout(() => setNotification({ show: false }), 3000);
    } finally {
      setResumeUploading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 py-8 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Upload Documents</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Upload your job description and candidate resumes for AI-powered matching
          </p>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`max-w-md mx-auto mb-6 rounded-md p-4 ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {notification.message}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Job Description Upload */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Upload Job Description</h2>
              </div>
              
              <form onSubmit={handleJdSubmit}>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="jd-file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="jd-file-upload"
                              name="jd-file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf"
                              onChange={handleJdFileChange}
                              disabled={jdUploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>
                    
                    {jdFile && (
                      <div className="mt-2 flex items-center justify-between bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{jdFile.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({formatFileSize(jdFile.size)})</span>
                        </div>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500"
                          onClick={() => setJdFile(null)}
                          disabled={jdUploading}
                        >
                          <span className="sr-only">Remove file</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* OR divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  {/* Text Area */}
                  <div>
                    <label htmlFor="jd-text" className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Job Description Text
                    </label>
                    <textarea
                      id="jd-text"
                      name="jd-text"
                      rows={5}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Paste the job description here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      disabled={jdUploading || jdFile !== null}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={jdUploading}
                  >
                    {jdUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Upload Job Description'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Resume Upload */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Upload Candidate Resumes</h2>
              </div>
              
              <form onSubmit={handleResumeSubmit}>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF Files
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="resume-file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="resume-file-upload"
                              name="resume-file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf"
                              multiple
                              onChange={handleResumeFileChange}
                              disabled={resumeUploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF files up to 10MB each</p>
                      </div>
                    </div>
                    
                    {resumeFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium text-gray-700">{resumeFiles.length} file(s) selected:</p>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {resumeFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({formatFileSize(file.size)})</span>
                              </div>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => removeResumeFile(index)}
                                disabled={resumeUploading}
                              >
                                <span className="sr-only">Remove file</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={resumeUploading || resumeFiles.length === 0}
                  >
                    {resumeUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Upload Resumes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
