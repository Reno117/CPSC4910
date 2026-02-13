import { getCurrentUser, requireSponsorUser } from "@/lib/auth-helpers";
import CreateSponsorUserForm from "@/app/components/create-sponsorUser-form";

export default async function CreateSponsorPage() {
  // await requireSponsorUser(); // Ensure they're a sponsor
  await getCurrentUser;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Sponsor User</h1>
      <CreateSponsorUserForm sponsorId="sponsor-2" />{" "}
      {/* Replace with better way of passing in this prop.*/}
      {/* Currently sponsor-1 is the only registered sponsor -- need to get this to work dynamically. maybe w/ a invite link URL.*/}
    </div>
  );
}
