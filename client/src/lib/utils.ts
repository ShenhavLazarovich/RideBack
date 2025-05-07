import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date in format DD/MM/YYYY
export function formatDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Format date to relative time (e.g. "2 hours ago", "3 days ago")
export function formatRelativeTime(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('he', { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

// Gets the user's first name from the full name
export function getFirstName(fullName: string): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

// Mask a serial number for privacy (e.g. AB***1234)
export function maskSerialNumber(serialNumber: string): string {
  if (!serialNumber || serialNumber.length <= 4) return serialNumber;
  
  const prefix = serialNumber.substring(0, 2);
  const suffix = serialNumber.substring(serialNumber.length - 4);
  return `${prefix}***${suffix}`;
}

// Translates bike type to Hebrew
export function translateBikeType(type: string): string {
  switch (type) {
    case 'road':
      return 'אופני כביש';
    case 'mountain':
      return 'אופני הרים';
    case 'hybrid':
      return 'אופני היברידיים';
    case 'electric':
      return 'אופניים חשמליים';
    case 'city':
      return 'אופני עיר';
    default:
      return 'אחר';
  }
}
