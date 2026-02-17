export function GET() {
  return new Response("idk" + process.env.BETTER_AUTH_SECRET);
}
