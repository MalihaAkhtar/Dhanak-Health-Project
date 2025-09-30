import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ------------------- PATIENTS -------------------
export const fetchPatients = async () => {
  const res = await fetch(`${API_URL}/patients`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
};

export const addPatient = async (data: any) => {
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add patient");
  return res.json();
};

export const updatePatient = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update patient");
  return res.json();
};

export const deletePatient = async (id: string) => {
  const res = await fetch(`${API_URL}/patients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete patient");
  return res.json();
};

export const fetchDeletedPatients = async () => {
  const res = await fetch(`${API_URL}/patients/deleted`);
  if (!res.ok) throw new Error("Failed to fetch deleted patients");
  return res.json();
};

export const restorePatient = async (id: string) => {
  const res = await fetch(`${API_URL}/patients/${id}/restore`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to restore patient");
  return res.json();
};

export const permanentlyDeletePatient = async (id: string) => {
  const res = await fetch(`${API_URL}/patients/${id}/permanent`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete patient");
  return res.json();
};

// ------------------- VISITS -------------------
export const fetchVisits = async () => {
  const res = await fetch(`${API_URL}/visits`);
  if (!res.ok) throw new Error("Failed to fetch visits");
  return res.json();
};

export const addVisit = async (data: any) => {
  const res = await fetch(`${API_URL}/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add visit");
  return res.json();
};

export const updateVisit = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/visits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update visit");
  return res.json();
};

export const deleteVisit = async (id: string) => {
  const res = await fetch(`${API_URL}/visits/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete visit");
  return res.json();
};

export const fetchDeletedVisits = async () => {
  const res = await fetch(`${API_URL}/visits/deleted`);
  if (!res.ok) throw new Error("Failed to fetch deleted visits");
  return res.json();
};

export const restoreVisit = async (id: string) => {
  const res = await fetch(`${API_URL}/visits/${id}/restore`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to restore visit");
  return res.json();
};

export const permanentlyDeleteVisit = async (id: string) => {
  const res = await fetch(`${API_URL}/visits/${id}/permanent`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete visit");
  return res.json();
};

// ------------------- PAYMENTS -------------------
export const fetchPayments = async () => {
  const res = await fetch(`${API_URL}/payments`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
};

export const addPayment = async (data: any) => {
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add payment");
  return res.json();
};

export const updatePayment = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/payments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payment");
  return res.json();
};

export const markPaymentAndVisitsAsPaid = async (paymentId: string, mrNo: string) => {
  const res = await fetch(`${API_URL}/payments/${paymentId}/mark-paid`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mrNo }),
  });
  if (!res.ok) throw new Error("Failed to mark payment and visits as paid");
  return res.json();
};

// ------------------- MEDICINES -------------------
export const fetchMedicines = async () => {
  const res = await fetch(`${API_URL}/medicines`);
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
};

export const addMedicine = async (data: any) => {
  const res = await fetch(`${API_URL}/medicines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add medicine");
  return res.json();
};

export const updateMedicine = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/medicines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update medicine");
  return res.json();
};

export const deleteMedicine = async (id: string) => {
  const res = await fetch(`${API_URL}/medicines/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete medicine");
  return res.json();
};

// Updated: reduce stock using _id directly
export const updateMedicineStock = async (medicineId: string, usedQty: number) => {
  const res = await fetch(`${API_URL}/medicines/${medicineId}`);
  if (!res.ok) throw new Error("Medicine not found");
  const medicine = await res.json();
  const newStock = medicine.stock - usedQty;
  return updateMedicine(medicineId, { stock: newStock });
};

// ------------------- TRASH -------------------
export const fetchTrash = async () => {
  const res = await fetch(`${API_URL}/trash`);
  if (!res.ok) throw new Error("Failed to fetch trash");
  return res.json();
};

export const fetchDeletedMedicines = async () => {
  const res = await fetch(`${API_URL}/medicines/deleted`);
  if (!res.ok) throw new Error("Failed to fetch deleted medicines");
  return res.json();
};

export const restoreMedicine = async (id: string) => {
  const res = await fetch(`${API_URL}/medicines/${id}/restore`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to restore medicine");
  return res.json();
};

export const permanentlyDeleteMedicine = async (id: string) => {
  const res = await fetch(`${API_URL}/medicines/${id}/permanent`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete medicine");
  return res.json();
};

// ------------------- OTHER -------------------
export const getVisitsByMrNo = async (mrNo: string) => {
  const res = await fetch(`${API_URL}/visits?mrNo=${mrNo}`);
  if (!res.ok) throw new Error("Failed to fetch visits by MR No");
  return res.json();
};
