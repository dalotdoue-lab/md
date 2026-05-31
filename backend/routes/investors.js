const express = require('express');
const router = express.Router();

// In-memory mock data
let investors = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Smith Capital',
    investmentInterest: 'Equity Investment',
    message: 'Interested in learning more about investment opportunities',
    createdAt: '2024-02-01'
  }
];

/**
 * POST /api/investors
 * Submit investor inquiry
 */
router.post('/', (req, res) => {
  const { name, email, company, investmentInterest, message } = req.body;

  // Validate required fields
  if (!name || !email || !company || !investmentInterest || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: name, email, company, investmentInterest, message'
    });
  }

  const newInvestor = {
    id: String(investors.length + 1), // simple auto-increment
    name: name.trim(),
    email: email.trim(),
    company: company.trim(),
    investmentInterest: investmentInterest.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString().split('T')[0]
  };

  investors.push(newInvestor);

  res.status(201).json({
    success: true,
    investor: newInvestor,
    message: 'Investor inquiry submitted successfully'
  });
});

/**
 * GET /api/investors
 * List all investor inquiries
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: investors.length,
    investors
  });
});

module.exports = router;