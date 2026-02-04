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

Basic flow of the site:

Starting off in the root directory, 

We have basic config files (pretty much can ignore)

We then have a bunch of different directories that do different things:
 /prisma just manages the database schema (don't have to worry about that I got it)
 /public is just public pictures we imported, nothing too crazy there
 /src -- Don't worry and don't touch it
 /lib -- Handles all the authentication stuff -- also don't need to worry about it unless you really
 want to see how user auth works.

 /app -- OH BOY this one is a doozy. This is where we need to lock in.
    Directly inside of this folder we have page.tsx (the home page) as well as the layout.tsx file which is layout of the entire app. Everything added to this will affect every page of the whole site. Navbar is in there, which is why it's everywhere in the site and don't need to import it for every page.
    *Breather*
    inside of the app folder we have more folders.
    /about: This is just a page that is our about page -- nothing crazy here.

    /actions: This is the server functions that will interact with the database and where a alot of the logic of the app is. It's split into:
          /sponsor
          /driver
    Basically everything in the /sponsor are functions only the sponsors have access to, and everything in /driver are the functions that drivers need (like submitting an application) 

    /admin is a folder for admin stuff -- haven't done too much here but I'll probably just copy all the sponsor stuff here and change permissions. I should keep in mind that I should be able to do everything w/ the admin role as well.

    /api -- don't worry about that for now.
    /components -- This folder has all of the client visual stuff that we see on the front end, should be coded as a reusable pieces. Pretty straightforward.
    
    /driver -- This has page.tsx which is just the default page and the dashboard. Everything pertaining to what the driver sees will be here. Remember the functions for drivers and stuff are in the app / actions / driver folder, not here necessarily.

    /login -- just our login page.
    /signup -- just the signup page.


    /sponsor -- This is important. 
      Page.tsx -- This is just the sponsor dashboard.

      Inside of this page is /create-driver, /create-sponsor-user, and other stuff.
      These are just web pages that we see, which is why each of the contents of these folders are a page.tsx file. These pages will call functions from other folders (namely the actions / sposnors  folder.)

      This is what I got so far. Let me know if you have questions -- I know this is a lot. Good work so far y'all.

    










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

