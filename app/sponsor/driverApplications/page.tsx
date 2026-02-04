import { prisma } from "@/lib/prisma";
import { requireSponsorUser } from "@/lib/auth-helpers";
//import ApplicationCard from "@/components/application-card"; 
//make a component for application card to keep code clean

export default async function ApplicationsPage() {
  const sponsorUser = await requireSponsorUser();
  const sponsorId = sponsorUser.sponsorUser!.sponsorId;

  const applications = await prisma.driverApplication.findMany({
    where: {
      sponsorId: sponsorId,
      status: "pending",
    },
    include: {
      driverProfile: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pending Applications</h1>
      
      {applications.length === 0 ? (
        <p className="text-gray-500">No pending applications</p>
      ) : (
        <div className="space-y-4">
            reminder to make ApplicationCard component
            {applications.map((app) => (
              <div key={app.id} className="p-4 border rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">
                    {app.driverProfile.user.name}

                </h2>
                </div>
            ))}
          {/*applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))*/}
        </div>
      )}
    </div>
  );
}