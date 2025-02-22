import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DoctorList from './components/DoctorList';
import AppointmentBooking from './components/AppointmentBooking';
import AppointmentManagement from './components/AppointmentManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/appointments">My Appointments</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<DoctorList />} />
          <Route path="/book/:doctorId" element={<AppointmentBooking />} />
          <Route path="/appointments" element={<AppointmentManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// 