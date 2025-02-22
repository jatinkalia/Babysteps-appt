const router = require('express').Router();
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const { startOfDay, endOfDay, addMinutes, format, parse } = require('date-fns');

// GET all doctors
router.route('/').get((req, res) => {
  Doctor.find()
    .then(doctors => res.json(doctors))
    .catch(err => res.status(400).json('Error: ' + err));
});

// GET available slots for a specific doctor on a given date
router.route('/:id/slots').get(async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json('Doctor not found');
    }

    const date = parse(req.query.date, 'yyyy-MM-dd', new Date());
    const startTime = parse(doctor.workingHours.start, 'HH:mm', date);
    const endTime = parse(doctor.workingHours.end, 'HH:mm', date);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
    });

    const bookedSlots = appointments.map(app => ({
      start: app.date,
      end: addMinutes(app.date, app.duration),
    }));

    const availableSlots = [];
    let currentSlot = startTime;

    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, 30); // Assuming 30-minute slots
      const isAvailable = !bookedSlots.some(
        bookedSlot =>
          (currentSlot >= bookedSlot.start && currentSlot < bookedSlot.end) ||
          (slotEnd > bookedSlot.start && slotEnd <= bookedSlot.end)
      );

      if (isAvailable) {
        availableSlots.push(format(currentSlot, 'HH:mm'));
      }

      currentSlot = slotEnd;
    }

    res.json(availableSlots);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;