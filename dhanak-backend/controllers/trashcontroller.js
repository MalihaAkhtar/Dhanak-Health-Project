// controllers/trashcontroller.js
import Patient from '../models/Patient.js';
import Visit from '../models/visits.js';
import Medicine from '../models/medicine.js';

export const getTrash = async (req, res) => {
  try {
    const patients = await Patient.find({ deleted: true });
    const visits = await Visit.find({ deleted: true });
    const medicines = await Medicine.find({ deleted: true });

    res.status(200).json({ patients, visits, medicines });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trash data', error: err });
  }
};
