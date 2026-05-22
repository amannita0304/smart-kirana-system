/** Bilingual labels for shopkeepers */
export const LABELS = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  customers: { en: 'Customers', hi: 'ग्राहक' },
  products: { en: 'Products', hi: 'सामान' },
  sales: { en: 'Sales', hi: 'बिक्री' },
  udhaar: { en: 'Udhaar', hi: 'उधार' },
  suppliers: { en: 'Suppliers', hi: 'सप्लायर' },
  purchases: { en: 'Purchases', hi: 'खरीद' },
  reports: { en: 'Reports', hi: 'रिपोर्ट' },
  notifications: { en: 'Alerts', hi: 'सूचनाएं' },
  login: { en: 'Login', hi: 'लॉगिन' },
  register: { en: 'Register', hi: 'रजिस्टर' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  add: { en: 'Add', hi: 'जोड़ें' },
  save: { en: 'Save', hi: 'सेव करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  search: { en: 'Search', hi: 'खोजें' },
  totalSales: { en: 'Total Sales', hi: 'कुल बिक्री' },
  totalProfit: { en: 'Total Profit', hi: 'कुल मुनाफा' },
  pendingUdhaar: { en: 'Pending Udhaar', hi: 'बकाया उधार' },
  lowStock: { en: 'Low Stock', hi: 'कम स्टॉक' },
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash / नकद' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card / कार्ड' },
  { value: 'udhaar', label: 'Udhaar / उधार' },
];

export const STOCK_STATUS = {
  in_stock: { label: 'In Stock', color: 'green' },
  low_stock: { label: 'Low Stock', color: 'amber' },
  out_of_stock: { label: 'Out of Stock', color: 'red' },
};
