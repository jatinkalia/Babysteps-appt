import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.API_URL}/doctors`)
      .then(response => {
        setDoctors(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDoctor) {
      navigate(`/book/${selectedDoctor}`);
    }
  };

  if (loading) return <div>Loading doctors...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Select a Doctor</h2>
      <form onSubmit={handleSubmit}>
        <select 
          value={selectedDoctor} 
          onChange={handleDoctorChange}
          required
        >
          <option value="">-- Select a doctor --</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
};

export default DoctorList;