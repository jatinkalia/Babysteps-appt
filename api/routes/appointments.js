// routes/appointments.js
const router = require('express').Router();
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const { startOfDay, endOfDay, addMinutes, parse } = require('date-fns');

// GET all appointments
router.route('/').get((req, res) => {
  Appointment.find()
    .populate('doctorId', 'name')
    .then(appointments => res.json(appointments))
    .catch(err => res.status(400).json('Error: ' + err));
});

// GET a specific appointment
router.route('/:id').get((req, res) => {
  Appointment.findById(req.params.id)
    .populate('doctorId', 'name')
    .then(appointment => res.json(appointment))
    .catch(err => res.status(400).json('Error: ' + err));
});

// POST a new appointment
router.route('/').post(async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } = req.body;

    // Validate the appointment slot
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json('Doctor not found');
    }

    const appointmentDate = new Date(date);
    const appointmentEnd = addMinutes(appointmentDate, duration);

    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: appointmentDate,
        $lt: appointmentEnd,
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json('The selected time slot is not available');
    }

    const newAppointment = new Appointment({
      doctorId,
      date: appointmentDate,
      duration,
      appointmentType,
      patientName,
      notes,
    });

    newAppointment.save()
      .then(() => res.json('Appointment booked successfully!'))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// PUT (update) an existing appointment
router.route('/:id').put(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json('Appointment not found');
    }

    const { doctorId, date, duration, appointmentType, patientName, notes } = req.body;

    // Validate the new appointment slot
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json('Doctor not found');
    }

    const appointmentDate = new Date(date);
    const appointmentEnd = addMinutes(appointmentDate, duration);

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctorId,
      date: {
        $gte: appointmentDate,
        $lt: appointmentEnd,
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json('The selected time slot is not available');
    }

    appointment.doctorId = doctorId;
    appointment.date = appointmentDate;
    appointment.duration = duration;
    appointment.appointmentType = appointmentType;
    appointment.patientName = patientName;
    appointment.notes = notes;

    appointment.save()
      .then(() => res.json('Appointment updated successfully!'))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// DELETE an appointment
router.route('/:id').delete((req, res) => {
  Appointment.findByIdAndDelete(req.params.id)
    .then(() => res.json('Appointment cancelled successfully!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;