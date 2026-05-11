import type { Appointment } from "@/types";

export const appointments: Appointment[] = [
  { id: "1", patientName: "Rahul Sharma", patientPid: "PT001245", avatar: "", doctor: "Dr. Amit Verma", doctorSpecialty: "Cardiologist", department: "Cardiology", dateTime: "20 May 2024\n10:00 AM", purpose: "Regular Checkup", status: "Confirmed" },
  { id: "2", patientName: "Priya Patel", patientPid: "PT001244", avatar: "", doctor: "Dr. Neha Singh", doctorSpecialty: "General Physician", department: "General Medicine", dateTime: "20 May 2024\n11:30 AM", purpose: "Fever & Headache", status: "Confirmed" },
  { id: "3", patientName: "Vikram Joshi", patientPid: "PT001243", avatar: "", doctor: "Dr. Rajesh Kumar", doctorSpecialty: "Orthopedic", department: "Orthopedics", dateTime: "20 May 2024\n02:00 PM", purpose: "Knee Pain", status: "Pending" },
  { id: "4", patientName: "Anjali Gupta", patientPid: "PT001242", avatar: "", doctor: "Dr. Pooja Mehta", doctorSpecialty: "Pediatrician", department: "Pediatrics", dateTime: "20 May 2024\n04:30 PM", purpose: "Child Vaccination", status: "Confirmed" },
  { id: "5", patientName: "Sandeep Verma", patientPid: "PT001241", avatar: "", doctor: "Dr. Amit Verma", doctorSpecialty: "Cardiologist", department: "Cardiology", dateTime: "21 May 2024\n09:30 AM", purpose: "ECG Test", status: "Confirmed" },
  { id: "6", patientName: "Meera Nair", patientPid: "PT001240", avatar: "", doctor: "Dr. Neha Singh", doctorSpecialty: "General Physician", department: "General Medicine", dateTime: "21 May 2024\n11:00 AM", purpose: "Diabetes Consultation", status: "Confirmed" },
  { id: "7", patientName: "Amit Kumar", patientPid: "PT001239", avatar: "", doctor: "Dr. Rajesh Kumar", doctorSpecialty: "Orthopedic", department: "Orthopedics", dateTime: "21 May 2024\n03:00 PM", purpose: "Back Pain", status: "Cancelled" },
  { id: "8", patientName: "Neha Singh", patientPid: "PT001238", avatar: "", doctor: "Dr. Pooja Mehta", doctorSpecialty: "Pediatrician", department: "Pediatrics", dateTime: "21 May 2024\n04:00 PM", purpose: "Skin Allergy", status: "Pending" },
];

export const recentAppointments = appointments.slice(0, 4);