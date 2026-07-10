import type { IconType } from 'react-icons';
import {
  FaUserShield,
  FaHandHoldingHeart,
  FaGraduationCap,
  FaBuilding,
  FaClipboardCheck,
  FaRadiation,
  FaAppleAlt,
  FaHeartbeat,
  FaTint,
  FaPills,
  FaComments,
  FaUserCheck,
  FaRunning,
  FaWalking,
  FaExclamationTriangle,
  FaShieldAlt,
  FaStethoscope,
  FaUserMd,
  FaUsers,
  FaFlask,
  FaAmbulance,
  FaBalanceScale,
  FaFireExtinguisher,
  FaBroom,
  FaBaby,
} from 'react-icons/fa';

export interface QualityCommittee {
  id: number;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  hospital_id?: number | string | null;
  created_at?: string;
  updated_at?: string;
}

// Komite kartlarında seçilebilen ikonlar; DB'de anahtar adı (ör. "FaUserShield") tutulur
export const COMMITTEE_ICONS: Record<string, IconType> = {
  FaUserShield,
  FaHandHoldingHeart,
  FaGraduationCap,
  FaBuilding,
  FaClipboardCheck,
  FaRadiation,
  FaAppleAlt,
  FaHeartbeat,
  FaTint,
  FaPills,
  FaComments,
  FaUserCheck,
  FaRunning,
  FaWalking,
  FaExclamationTriangle,
  FaShieldAlt,
  FaStethoscope,
  FaUserMd,
  FaUsers,
  FaFlask,
  FaAmbulance,
  FaBalanceScale,
  FaFireExtinguisher,
  FaBroom,
  FaBaby,
};

export const DEFAULT_COMMITTEE_ICON = 'FaClipboardCheck';
