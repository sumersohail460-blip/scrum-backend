const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

const isPhone = (input) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(input.replace(/\s+/g, ''));
};

const detectContactType = (input) => {
  if (isEmail(input)) return 'email';
  if (isPhone(input)) return 'phone';
  return null;
};

const normalizePhone = (phone) => {
  // Remove spaces and ensure + prefix for international format
  const cleaned = phone.replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

module.exports = {
  isEmail,
  isPhone,
  detectContactType,
  normalizePhone
};