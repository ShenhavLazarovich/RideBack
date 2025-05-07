export type Locale = 'he' | 'en';

export const defaultLocale: Locale = 'he';

export const locales: Record<Locale, Record<string, string>> = {
  he: {
    // Auth
    'signin': 'התחברות',
    'signup': 'הרשמה',
    'username': 'שם משתמש',
    'password': 'סיסמה',
    'confirmPassword': 'אימות סיסמה',
    'signin.button': 'התחבר',
    'signup.button': 'הירשם',
    'auth.title': 'ברוך הבא ל-RideBack',
    'auth.description': 'האפליקציה שתעזור לך לרשום, לדווח ולמצוא אופניים גנובים',
    
    // Navigation
    'nav.home': 'דף הבית',
    'nav.register': 'רישום אופניים',
    'nav.report': 'דיווח על גניבה',
    'nav.search': 'חיפוש אופניים',
    'nav.profile': 'פרופיל',
    'nav.logout': 'התנתקות',
    
    // Dashboard
    'dashboard.welcome': 'ברוך הבא,',
    'dashboard.stats.registered': 'אופניים רשומים',
    'dashboard.stats.active': 'דיווחים פעילים',
    'dashboard.stats.recovered': 'אופניים שנמצאו',
    'dashboard.stats.alerts': 'התראות חדשות',
    'dashboard.alerts.title': 'התראות אחרונות',
    'dashboard.alerts.all': 'כל ההתראות',
    'dashboard.bikes.title': 'האופניים שלי',
    'dashboard.bikes.register': 'רשום אופניים נוספים',
    'dashboard.quick.title': 'פעולות מהירות',
    
    // Bike Registration
    'register.title': 'רישום אופניים חדשים',
    'register.info': 'פרטי האופניים',
    'register.brand': 'יצרן',
    'register.model': 'דגם',
    'register.type': 'סוג אופניים',
    'register.type.select': 'בחר סוג',
    'register.type.road': 'אופני כביש',
    'register.type.mountain': 'אופני הרים',
    'register.type.hybrid': 'אופני היברידיים',
    'register.type.electric': 'אופניים חשמליים',
    'register.type.city': 'אופני עיר',
    'register.type.other': 'אחר',
    'register.year': 'שנת ייצור',
    'register.color': 'צבע',
    'register.frameSize': 'גודל שלדה',
    'register.serial': 'מספר שלדה',
    'register.serial.help': 'איך למצוא את מספר השלדה?',
    'register.serial.description': 'מספר השלדה הוא המזהה הייחודי של האופניים. זהו מספר באורך 8-12 תווים.',
    'register.photos': 'תמונות',
    'register.additional': 'פרטים נוספים',
    'register.additional.placeholder': 'מדבקות, שריטות, התאמות מיוחדות או כל פרט שיעזור לזהות את האופניים',
    'register.button': 'רשום אופניים',
    'register.cancel': 'בטל',
    
    // Bike Theft Report
    'report.title': 'דיווח על גניבת אופניים',
    'report.select': 'בחר אופניים',
    'report.select.help': 'בחר מהאופניים הרשומים שלך או',
    'report.register.new': 'רשום אופניים חדשים',
    'report.details': 'פרטי הגניבה',
    'report.date': 'תאריך הגניבה',
    'report.location': 'מיקום הגניבה',
    'report.location.placeholder': 'עיר, רחוב, מספר או מקום ציבורי',
    'report.additional': 'פרטים נוספים',
    'report.additional.placeholder': 'תיאור האירוע ופרטים רלוונטים שיכולים לעזור במציאת האופניים',
    'report.police': 'דיווח למשטרה',
    'report.police.reported': 'דיווחתי למשטרה על הגניבה',
    'report.police.station': 'תחנת משטרה',
    'report.police.fileNumber': 'מספר תיק',
    'report.contact': 'פרטי קשר לשיתוף בדיווח הציבורי',
    'report.contact.use': 'השתמש בפרטי הקשר מהפרופיל שלי',
    'report.contact.name': 'שם איש קשר',
    'report.contact.phone': 'טלפון',
    'report.contact.email': 'דוא"ל',
    'report.visibility': 'הגדרות פרטיות',
    'report.visibility.public': 'דיווח ציבורי',
    'report.visibility.public.description': 'הדיווח יופיע במאגר החיפוש הציבורי ויעזור לאנשים לזהות את האופניים שלך',
    'report.visibility.private': 'דיווח פרטי',
    'report.visibility.private.description': 'הדיווח ישמר רק במערכת שלנו ולא יופיע בחיפוש הציבורי',
    'report.button': 'דווח על גניבה',
    
    // Search
    'search.title': 'חיפוש אופניים',
    'search.placeholder': 'חפש לפי יצרן, דגם, מספר שלדה או צבע',
    'search.button': 'חפש',
    'search.advanced': 'חיפוש מתקדם',
    'search.type': 'סוג אופניים',
    'search.type.all': 'כל הסוגים',
    'search.brand': 'יצרן',
    'search.brand.all': 'כל היצרנים',
    'search.color': 'צבע',
    'search.color.all': 'כל הצבעים',
    'search.city': 'עיר',
    'search.date': 'תאריך גניבה/מציאה',
    'search.date.all': 'כל הזמנים',
    'search.date.week': 'השבוע האחרון',
    'search.date.month': 'החודש האחרון',
    'search.date.3months': '3 החודשים האחרונים',
    'search.date.year': 'השנה האחרונה',
    'search.status': 'סטטוס',
    'search.status.all': 'הכל',
    'search.status.stolen': 'נגנב',
    'search.status.found': 'נמצא',
    'search.results': 'תוצאות חיפוש',
    'search.results.count': 'נמצאו {} אופניים',
    
    // Bike statuses
    'status.registered': 'רשום',
    'status.stolen': 'גנוב',
    'status.found': 'נמצא',
    
    // Common bike fields
    'bike.type': 'סוג',
    'bike.color': 'צבע',
    'bike.serial': 'מספר שלדה',
    'bike.year': 'שנת ייצור',
    'bike.brand': 'יצרן',
    'bike.location': 'מיקום',
    
    // Actions
    'action.details': 'פרטים מלאים',
    'action.report': 'צפה בדיווח',
    'action.edit': 'ערוך',
    'action.report.theft': 'דווח על גניבה',
    'action.contact': 'יצירת קשר',
    'action.markAsRead': 'סמן כנקרא',
  },
  
  en: {
    // Auth
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'username': 'Username',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'signin.button': 'Sign In',
    'signup.button': 'Sign Up',
    'auth.title': 'Welcome to RideBack',
    'auth.description': 'The app that helps you register, report and find stolen bicycles',
    
    // Navigation
    'nav.home': 'Home',
    'nav.register': 'Register Bike',
    'nav.report': 'Report Theft',
    'nav.search': 'Search Bikes',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.welcome': 'Welcome,',
    'dashboard.stats.registered': 'Registered Bikes',
    'dashboard.stats.active': 'Active Reports',
    'dashboard.stats.recovered': 'Recovered Bikes',
    'dashboard.stats.alerts': 'New Alerts',
    'dashboard.alerts.title': 'Recent Alerts',
    'dashboard.alerts.all': 'All Alerts',
    'dashboard.bikes.title': 'My Bicycles',
    'dashboard.bikes.register': 'Register More Bikes',
    'dashboard.quick.title': 'Quick Actions',
    
    // More translations can be added as needed
  }
};

export function translate(key: string, locale: Locale = defaultLocale): string {
  return locales[locale][key] || key;
}

// Helper function to replace placeholders in translated strings
export function translateWithVars(
  key: string,
  values: Record<string, string | number>,
  locale: Locale = defaultLocale
): string {
  let text = translate(key, locale);
  
  Object.entries(values).forEach(([key, value]) => {
    text = text.replace(`{${key}}`, String(value));
  });
  
  return text;
}
