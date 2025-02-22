import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    setLoading(true);
    axios.get('http://localhost:5000/appointments')
      .then(response => {
        setAppointments(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
        setLoading(false);
      });
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/appointments/${editingAppointment._id}`, editingAppointment)
      .then(() => {
        fetchAppointments();
        setEditingAppointment(null);
      })
      .catch(error => {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment. Please try again.');
      });
  };

  const handleCancel = (appointmentId) => {
    axios.delete(`http://localhost:5000/appointments/${appointmentId}`)
      .then(() => {
        fetchAppointments();
      })
      .catch(error => {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      });
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>You have no appointments scheduled.</p>
      ) : (
        appointments.map(appointment => (
          <div key={appointment._id}>
            {editingAppointment && editingAppointment._id === appointment._id ? (
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={editingAppointment.patientName}
                  onChange={(e) => setEditingAppointment({...editingAppointment, patientName: e.target.value})}
                />
                <input
                  type="text"
                  value={editingAppointment.appointmentType}
                  onChange={(e) => setEditingAppointment({...editingAppointment, appointmentType: e.target.value})}
                />
                <textarea
                  value={editingAppointment.notes}
                  onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingAppointment(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <p>Dr. {appointment.doctorId.name} - {appointment.appointmentType}</p>
                <p>{format(new Date(appointment.date), 'PPpp')} - {appointment.patientName}</p>
                <button onClick={() => handleEdit(appointment)}>Edit</button>
                <button onClick={() => handleCancel(appointment._id)}>Cancel</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AppointmentManagement;