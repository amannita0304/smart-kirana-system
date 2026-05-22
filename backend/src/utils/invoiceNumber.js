/**
 * Generate unique invoice numbers per shop.
 * Format: INV-YYYYMMDD-XXXX (random 4 digits)
 */
const generateInvoiceNumber = (prefix = 'INV') => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${d}-${random}`;
};

const generatePurchaseInvoiceNumber = () => generateInvoiceNumber('PUR');

module.exports = { generateInvoiceNumber, generatePurchaseInvoiceNumber };
