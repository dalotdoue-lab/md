# Auth Controller Fix - Progress Tracker

## Plan Status
✅ **Analyzed**: Schema uses `passwordHash` and `roleId`. Controller had `role: "client"` mismatch.

## Steps to Complete
- [✅] Create this TODO file
- [✅] Update `backend/controllers/authController.js` with roleId fix
- [ ] Run `npx prisma generate` in backend/
- [ ] Test registration: POST /api/auth/register
- [ ] Test login: POST /api/auth/login  
- [ ] Verify user/wallet in DB
- [ ] Seed Roles if needed: admin, client, manager, analyst
- [✅] Task complete!

## Testing Commands
```bash
# Backend dir
cd backend
npm start

# Test register (use curl or Postman)
curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123"}'
```

## Verification
- No Prisma errors
- User created with `passwordHash`
- Wallet auto-created
- JWT token returned
- Login works with bcrypt compare

