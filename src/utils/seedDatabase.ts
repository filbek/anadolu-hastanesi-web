import { supabase } from '../lib/supabase';
import { 
  createHospital, 
  createDepartment, 
  createDoctor, 
  createHealthArticle 
} from '../services';

// Sample data for seeding the database
const hospitals = [
  {
    name: 'Anadolu Merkez Hastanesi',
    slug: 'anadolu-merkez-hastanesi',
    description: 'Modern teknoloji ve uzman kadrosuyla hizmet veren ana hastanemiz.',
    address: 'Atatürk Bulvarı No:123, Şişli, İstanbul',
    phone: '0212 123 45 67',
    email: 'info@anadolumerkezhastanesi.com',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
    emergency_hours: '24 saat hizmet vermektedir.',
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    name: 'Anadolu Avrupa Hastanesi',
    slug: 'anadolu-avrupa-hastanesi',
    description: 'Avrupa yakasında bulunan modern ve tam donanımlı hastanemiz.',
    address: 'Bağdat Caddesi No:456, Kadıköy, İstanbul',
    phone: '0216 987 65 43',
    email: 'info@anadoluavrupahastanesi.com',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 20:00, Pazar: 08:00 - 18:00',
    emergency_hours: '24 saat hizmet vermektedir.',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

const departments = [
  {
    name: 'Kardiyoloji',
    slug: 'kardiyoloji',
    icon: 'bi-heart-pulse-fill',
    description: 'Kalp ve damar hastalıklarının tanı ve tedavisi',
    category: 'dahili',
  },
  {
    name: 'Nöroloji',
    slug: 'noroloji',
    icon: 'bi-brain',
    description: 'Sinir sistemi hastalıklarının tanı ve tedavisi',
    category: 'dahili',
  },
  {
    name: 'Ortopedi',
    slug: 'ortopedi',
    icon: 'bi-person-standing',
    description: 'Kemik, kas ve eklem hastalıklarının tanı ve tedavisi',
    category: 'cerrahi',
  },
];

// This function can be called to seed the database with initial data
export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Insert hospitals
    for (const hospital of hospitals) {
      const { data, error } = await createHospital(hospital);
      if (error) {
        console.error(`Error creating hospital ${hospital.name}:`, error);
      } else {
        console.log(`Created hospital: ${hospital.name}`);
      }
    }
    
    // Insert departments
    for (const department of departments) {
      const { data, error } = await createDepartment(department);
      if (error) {
        console.error(`Error creating department ${department.name}:`, error);
      } else {
        console.log(`Created department: ${department.name}`);
      }
    }
    
    console.log('Database seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}
