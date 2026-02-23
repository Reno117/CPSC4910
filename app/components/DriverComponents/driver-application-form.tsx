"use client";

import { useState } from "react";
import { applyToSponsor } from "@/app/actions/driver/apply-to-sponsor";

interface ApplicationFormProps {
  sponsors: Array<{
    id: string;
    name: string;
  }>;
  driverProfileId: string;
  existingApplications?: Array<{
    id: string;
    sponsorId: string;
    status: string;
  }>;
}

export default function ApplicationForm({ 
  sponsors, 
  driverProfileId,
  existingApplications = []
}: ApplicationFormProps) {
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSponsorId) {
      setError("Please select a sponsor");
      return;
    }

    setLoading(true);

    try {
      await applyToSponsor(driverProfileId, selectedSponsorId);
      setSuccess("Application submitted successfully!");
      setSelectedSponsorId("");
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // Get map of sponsor IDs to their application status
  const appStatusBySponsor = new Map(
    existingApplications.map((app) => [app.sponsorId, app.status])
  );

  // Filter out sponsors where driver has an approved application
  const availableSponsos = sponsors.filter((sponsor) => {
    const status = appStatusBySponsor.get(sponsor.id);
    return status !== "approved"; // Allow pending, dropped, rejected, or no application
  });

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Sponsor Company
          </label>
          <select
            value={selectedSponsorId}
            onChange={(e) => setSelectedSponsorId(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Choose a sponsor --</option>
            {availableSponsos.map((sponsor) => {
              const appStatus = appStatusBySponsor.get(sponsor.id);
              const label = appStatus ? `${sponsor.name} (${appStatus} - reapply)` : sponsor.name;
              return (
                <option key={sponsor.id} value={sponsor.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}