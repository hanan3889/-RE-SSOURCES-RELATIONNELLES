import { Role } from './role.enum';

export interface User {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: Role;
  photoUrl?: string;
  bio?: string;
  telephone?: string;
  dateNaissance?: Date;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  
  // Statut
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  
  // Préférences
  preferences?: UserPreferences;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Relations
  progression?: UserProgression;
  statistics?: UserStatistics;
}

export interface UserPreferences {
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showProfile: boolean;
  };
}

export interface UserProgression {
  userId: number;
  resourcesCompleted: number;
  totalProgress: number; 
  lastActivityAt?: Date;
}

export interface UserStatistics {
  userId: number;
  totalResourcesViewed: number;
  totalResourcesFavorited: number;
  totalResourcesCompleted: number;
  totalTimeSpent: number; 
  averageRating: number;
}

export interface UserRegistration {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  acceptTerms: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserUpdate {
  nom?: string;
  prenom?: string;
  bio?: string;
  telephone?: string;
  dateNaissance?: Date;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  photoUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
