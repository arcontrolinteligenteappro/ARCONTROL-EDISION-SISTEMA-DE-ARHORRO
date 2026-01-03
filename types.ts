export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export interface DepositRecord {
  value: number;
  timestamp: string;
  type?: 'deposit' | 'withdrawal'; // New field to distinguish transaction types
}

export interface SavingsState {
  selectedNumbers: number[];
  loanedNumbers: number[]; // Numbers that were saved but withdrawn
  totalSaved: number;
}

export interface ChatMessage {
  role: 'user' | 'system' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChallengeConfig {
  id: string;
  name: string;
  description: string;
  startNumber: number;
  endNumber: number;
  totalItems: number;
  goalAmount: number;
}