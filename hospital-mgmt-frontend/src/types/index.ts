import { ReactNode } from "react";

export interface Patient {
  emailAddress: ReactNode;
  phoneNumber: ReactNode;
  id: string;
  name: string;
  pid: string;
  gender: "Male" | "Female";
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  status: "Active" | "Inactive";
  avatar: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPid: string;
  avatar: string;
  doctor: string;
  doctorSpecialty: string;
  department: string;
  dateTime: string;
  purpose: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export interface StatCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down";
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}