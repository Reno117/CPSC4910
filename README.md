This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Here is the tentative prisma database schema:

model User {
  id        String   @id
  name      String
  email     String   @unique
  role      String   // "driver" | "sponsorUser" | "admin"
  sponsorId String?  // only for driver or sponsorUser
  points    Int      @default(0) // only for drivers

  sessions Session[]
  accounts Account[]
}

model Sponsor {
  id        String   @id
  name      String
  pointValue Float   @default(0.01)
  users     User[]
  products  Product[]
}

model Product {
  id           String @id
  sponsorId    String
  sponsor      Sponsor @relation(fields: [sponsorId], references: [id])
  name         String
  description  String
  priceInPoints Int
  externalId   String?
  available    Boolean @default(true)
  imageUrls    String?  // JSON string array maybe
}

model Purchase {
  id         String @id
  driverId   String
  driver     User @relation(fields: [driverId], references: [id])
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  quantity   Int
  totalPoints Int
  status     String // "pending", "completed", "cancelled"
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model PointHistory {
  id         String @id
  driverId   String
  sponsorId  String
  driver     User @relation(fields: [driverId], references: [id])
  sponsor    Sponsor @relation(fields: [sponsorId], references: [id])
  change     Int
  reason     String
  createdAt  DateTime @default(now())
}

model DriverApplication {
  id        String @id
  driverId  String
  sponsorId String
  status    String // "pending", "accepted", "rejected"
  reason    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id           String @id
  actorUserId  String
  targetUserId String?
  actionType   String
  details      String
  createdAt    DateTime @default(now())
}

model DriverProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  sponsorId         String?
  sponsor           Sponsor? @relation(fields: [sponsorId], references: [id])

  pointsBalance     Int      @default(0)
  status            String   @default("pending")
  // pending | active | dropped

  joinedAt          DateTime?
  droppedAt         DateTime?

  alertsPoints      Boolean  @default(true)
  alertsOrders      Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

