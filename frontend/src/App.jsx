import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/Interviews';
import ToastContainer from './components/ToastContainer';

function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const newToast = {
      id: Date.now(),
      type,
      message,
    };
    setToasts([...toasts, newToast]);
  };

  const removeToast = (id) => {
    setToasts(toasts.filter((toast) => toast.id !== id));
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interviews" element={<Interviews />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </Router>
  );
}

export default App
