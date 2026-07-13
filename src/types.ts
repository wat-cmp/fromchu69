export interface Patient {
  id: string;
  nationalId?: string;
  name: string;
  phone: string;
  gender: 'female' | 'male';
  age: number;
  birthDate?: string; // YYYY-MM-DD
  password: string; // 4 uppercase letters + 4-6 digits (e.g. ABCD1234)
  registeredAt: string;
  hn?: string;
  pdpaConsent?: boolean;
  pdpaConsentAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  basicProgramName: string;
  basicProgramPrice: number;
  selectedBasicTests?: string[]; // Test IDs chosen from the basic program
  specialTests: string[];
  totalCost: number;
  status: 'pending' | 'completed' | 'cancelled' | 'pending_results';
  patientType?: 'walk-in' | 'agency'; // Walk-in or On behalf of Faculty/Agency
  agencyName?: string; // Specify if agency
  medicalCoverage?: string; // Treatment Benefit / Insurance
  confirmedServiceDate?: string; // Confirmed date in Thailand local format YYYY-MM-DD or formatted string
}

export interface LM6Assessment {
  id: string;
  patientId: string;
  date: string;
  scores: {
    nutrition: number; // Max 15
    physicalActivity: number; // Max 15
    stressManagement: number; // Max 15
    avoidSubstances: number; // Max 15
    restorativeSleep: number; // Max 15
    socialConnection: number; // Max 15
  };
  answers: Record<string, number>;
  recommendations: string[];
}

export interface AttachedFile {
  id: string;
  category: string; // e.g. "Chest X-Ray", "CBC", "Lipid Profile"
  name: string;
  size: string;
  type: string;
  url: string; // base64 or objectUrl placeholder
  uploadedAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  appointmentId: string;
  examDate: string;
  doctorName: string;
  doctorLicense?: string;
  doctorSignature?: string; // Base64 signature image
  status: 'pending' | 'completed';
  
  // Physical Exam
  physical: {
    weight: number;
    height: number;
    bloodPressure: string;
    heartRate: number;
    bmi: number;
    bmiStatus: string;
    generalStatus: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ';
    notes: string;
    waistline?: number;
  };

  // Chest X-Ray
  chestXray: {
    status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ';
    description: string;
    declined?: boolean;
  };

  // Lab parameters
  parameters: Record<string, {
    value: string;
    status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ';
    declined?: boolean;
  }>;

  attachedFiles: AttachedFile[];
  summary: string;
  recommendations: string[];
}
