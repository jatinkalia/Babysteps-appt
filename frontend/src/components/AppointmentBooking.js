import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays } from 'date-fns';

const AppointmentBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/doctors/${String(doctorId)}`)
      .then(response => {
        setDoctor(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching doctor:', error);
        setError('Failed to load doctor information. Please try again later.');
        setLoading(false);
      });
  }, [doctorId]);

  useEffect(() => {
    if (doctor) {
      axios.get(`http://localhost:5000/doctors/${String(doctorId)}/slots?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        .then(response => setAvailableSlots(response.data))
        .catch(error => console.error('Error fetching available slots:', error));
    }
  }, [doctorId, selectedDate, doctor]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const appointmentData = {
      doctorId,
      date: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot}`,
      duration: 30,
      appointmentType,
      patientName,
      notes,
    };

    axios.post('http://localhost:5000/appointments', appointmentData)
      .then(response => {
        alert('Appointment booked successfully!');
        navigate('/appointments');
      })
      .catch(error => {
        console.error('Error booking appointment:', error);
        alert('Failed to book appointment. Please try again.');
      });
  };

  if (loading) return <div>Loading doctor information...</div>;
  if (error) return <div>{error}</div>;
  if (!doctor) return <div>Doctor not found.</div>;

  return (
    <div>
      <h2>Book an Appointment with Dr. {doctor.name}</h2>
      <div>
        {[...Array(7)].map((_, index) => {
          const date = addDays(new Date(), index);
          return (
            <button key={index} onClick={() => handleDateChange(date)}>
              {format(date, 'MMM d')}
            </button>
          );
        })}
      </div>
      <div>
        <select 
          value={selectedSlot} 
          onChange={(e) => setSelectedSlot(e.target.value)}
          required
        >
          <option value="">-- Select a time slot --</option>
          {availableSlots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="patientName">Patient Name:</label>
          <input
            id="patientName"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="appointmentType">Appointment Type:</label>
          <input
            id="appointmentType"
            type="text"
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" disabled={!selectedSlot}>Book Appointment</button>
      </form>
    </div>
  );
};

export default AppointmentBooking;