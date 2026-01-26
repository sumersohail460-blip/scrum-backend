const axios = require("axios");
const crypto = require("crypto");
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

// JazzCash Sandbox Endpoint
const JAZZCASH_URL = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase";

// Sandbox Credentials
const merchantId = "YOUR_MERCHANT_ID";
const password = "YOUR_PASSWORD";
const integritySalt = "YOUR_INTEGRITY_SALT";

// Generate unique Transaction ID
const generateTransactionID = () => "TXN" + Date.now();

// Generate secure hash
const generateSecureHash = (data, salt) => {
  const values = Object.values(data).join("|");
  return crypto.createHmac("sha256", salt).update(values).digest("hex");
};

// Calculate card payment with 5% GST
const calculateCardPayment = (req, res) => {
  const { subTotal } = req.body;

  if (!subTotal || subTotal <= 0) {
    return errorResponse(res, 'Valid subTotal is required', 400);
  }

  const gst = parseFloat((subTotal * 0.05).toFixed(2));
  const total = parseFloat((subTotal + gst).toFixed(2));

  return successResponse(res, {
    subTotal: parseFloat(subTotal),
    gst,
    total
  }, 'Card payment calculated successfully');
};

// Controller function
const makeJazzCashPayment = async (req, res) => {
    console.log(req.body)
  const { amount, customerName, customerEmail, customerMobile, cardNumber, cardExpiry, cvv } = req.body;

  if (!amount || !customerName || !cardNumber || !cardExpiry || !cvv) {
    return res.status(400).json({ error: "All required fields are mandatory" });
  }

  const transactionId = generateTransactionID();

  const paymentData = {
    MerchantID: merchantId,
    Password: password,
    Amount: amount.toString(),
    TransactionType: "SALE",
    CurrencyCode: "PKR",
    TransactionID: transactionId,
    CardNumber: cardNumber,
    CardExpiry: cardExpiry,
    CVV: cvv,
    CustomerName: customerName,
    CustomerEmail: customerEmail,
    CustomerMobile: customerMobile,
  };

  paymentData.HashValue = generateSecureHash(paymentData, integritySalt);

  try {
    const response = await axios.post(JAZZCASH_URL, paymentData);
    res.json({
      success: true,
      transactionId,
      jazzCashResponse: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = { makeJazzCashPayment, calculateCardPayment };

























// const axios = require("axios");
// const crypto = require("crypto");

// const JAZZCASH_URL =
//   "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase";

// const merchantId = "YOUR_MERCHANT_ID";
// const password = "YOUR_PASSWORD";
// const integritySalt = "YOUR_INTEGRITY_SALT";

// const generateTransactionID = () => "TXN" + Date.now();

// const generateSecureHash = (data, salt) => {
//   const sortedKeys = Object.keys(data).sort();
//   const hashString = sortedKeys.map(k => data[k]).join("&");
//   return crypto
//     .createHmac("sha256", salt)
//     .update(hashString)
//     .digest("hex");
// };

// const makeJazzCashPayment = async (req, res) => {
//   const {
//     paymentMethod,
//     amount,
//     customerName,
//     customerEmail,
//     customerMobile,
//     cardNumber,
//     cardExpiry,
//     cvv
//   } = req.body || {};

//   if (!paymentMethod || !amount || !customerName) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const transactionId = generateTransactionID();
//   let paymentData = {
//     pp_MerchantID: merchantId,
//     pp_Password: password,
//     pp_TxnRefNo: transactionId,
//     pp_Amount: amount * 100, // JazzCash uses paisa
//     pp_TxnCurrency: "PKR",
//     pp_TxnDateTime: new Date().toISOString().replace(/[-:.TZ]/g, ""),
//     pp_ReturnURL: "https://yourdomain.com/return",
//     pp_Language: "EN"
//   };

//   // 🔹 CARD PAYMENT
//   if (paymentMethod === "CARD") {
//     if (!cardNumber || !cardExpiry || !cvv) {
//       return res.status(400).json({ error: "Card details required" });
//     }

//     paymentData.pp_TxnType = "CARD";
//     paymentData.pp_CardNumber = cardNumber;
//     paymentData.pp_CardExpiry = cardExpiry;
//     paymentData.pp_CVV = cvv;
//   }

//   // 🔹 JAZZCASH WALLET PAYMENT
//   if (paymentMethod === "JAZZCASH") {
//     if (!customerMobile) {
//       return res.status(400).json({ error: "Mobile number required" });
//     }

//     paymentData.pp_TxnType = "MWALLET";
//     paymentData.pp_MobileNumber = customerMobile;
//   }

//   paymentData.pp_SecureHash = generateSecureHash(
//     paymentData,
//     integritySalt
//   );

//   try {
//     const response = await axios.post(JAZZCASH_URL, paymentData);
//     return res.json({
//       success: true,
//       transactionId,
//       paymentMethod,
//       jazzCashResponse: response.data
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.response?.data || error.message
//     });
//   }
// };

// module.exports = { makeJazzCashPayment };
