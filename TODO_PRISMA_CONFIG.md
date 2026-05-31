# Prisma Configuration Update TODO

## Task: Remove DATABASE_URL from schema.prisma and create prisma.config.ts

### Steps:
- [x] 1. Modify schema.prisma - remove `url = env("DATABASE_URL")` line
- [x] 2. Create backend/prisma/prisma.config.ts
- [x] 3. Update backend/config/database.js to use new config
- [ ] 4. Generate Prisma client
- [ ] 5. Test the setup

### PowerShell Commands:
```powershell
# Generate Prisma client
npx prisma generate --schema "backend\prisma\schema.prisma"

# Run migrations
npx prisma migrate dev --schema "backend\prisma\schema.prisma" --name init
```

