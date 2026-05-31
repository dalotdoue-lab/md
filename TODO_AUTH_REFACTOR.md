# Authentication & Registration Refactor - TODO

## Steps
- [x] 1. Analyze relevant files (auth.js, authController.js, register.js, seed.js, validate.js)
- [x] 2. Create comprehensive edit plan
- [x] 3. Edit `backend/routes/auth.js` - Apply Joi validation middleware to POST /register
- [x] 4. Edit `backend/controllers/authController.js` - Remove weak/duplicate validation, trust middleware, add role restriction comments
- [x] 5. Edit `frontend/pages/register.js` - Implement real-time password validation matching Joi rules
- [x] 6. Edit `backend/prisma/seed.js` - Use env vars for admin credentials, hash passwords, remove hardcoded credentials
- [x] 7. Verify no hardcoded credentials remain in source files
- [x] 8. Final review and cleanup

