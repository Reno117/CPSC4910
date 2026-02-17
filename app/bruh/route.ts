export function GET() {
  return new Response("idk" + JSON.stringify(process.env));
}
