export function GET() {
return new Response(JSON.stringify({
    authSecret: process.env.AUTH_SECRET,
    dbUrl: process.env.DATABASE_URL,
    // list your specific vars here
  }));
}
