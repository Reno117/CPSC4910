'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  sponsorId: string | null;
  sponsorOrganization: string | null;
  driverId: string | null;
  driverPointsBalance: number | null;
  driverStatus: string | null;
  driverSponsorOrganization: string | null;
};

interface ActiveUsersListProps {
  users: ActiveUser[];
}

export default function ActiveUsersList({ users }: ActiveUsersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatches = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
      const searchMatches =
        normalizedSearch.length === 0 ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      return roleMatches && searchMatches;
    });
  }, [users, roleFilter, normalizedSearch]);

  const isDefaultAllUsersView = roleFilter === 'all' && normalizedSearch.length === 0;

  const displayedUsers = useMemo(() => {
    if (isDefaultAllUsersView) {
      return filteredUsers.slice(0, 15);
    }

    return filteredUsers;
  }, [filteredUsers, isDefaultAllUsersView]);

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const formatStatus = (status: string | null) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <section className="w-full max-w-5xl bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">All Active Users</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full md:flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-blue-400"
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="w-full md:w-52 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
        >
          <option value="all">All Roles</option>
          <option value="driver">Driver</option>
          <option value="sponsor">Sponsor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Showing {displayedUsers.length}
        {isDefaultAllUsersView ? ` of ${filteredUsers.length}` : ''} users
      </p>

      {displayedUsers.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
          No active users found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Role</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="py-3 pr-4 text-sm text-gray-900">{user.name}</td>
                  <td className="py-3 pr-4 text-sm text-gray-700">{user.email}</td>
                  <td className="py-3 pr-4 text-sm text-gray-700">{formatRole(user.role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-gray-200 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User Information</h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Name:</span> {selectedUser.name}</p>
              <p><span className="font-semibold text-gray-900">Email:</span> {selectedUser.email}</p>
              <p><span className="font-semibold text-gray-900">Role:</span> {formatRole(selectedUser.role)}</p>
              <p>
                <span className="font-semibold text-gray-900">Email Verified:</span>{' '}
                {selectedUser.emailVerified ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Joined:</span>{' '}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>

              {selectedUser.role.toLowerCase() === 'driver' && (
                <>
                  <p>
                    <span className="font-semibold text-gray-900">Driver ID:</span>{' '}
                    {selectedUser.driverId ?? 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Sponsor Organization:</span>{' '}
                    {selectedUser.driverSponsorOrganization ?? 'Unassigned'}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Points Balance:</span>{' '}
                    {selectedUser.driverPointsBalance ?? 0}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Status:</span>{' '}
                    {formatStatus(selectedUser.driverStatus)}
                  </p>
                  {selectedUser.driverId && (
                    <div className="pt-3">
                      <Link
                        href={`/admin/${selectedUser.driverId}`}
                        className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Edit Driver Profile
                      </Link>
                    </div>
                  )}
                </>
              )}

              {selectedUser.role.toLowerCase() === 'sponsor' && (
                <>
                  <p>
                    <span className="font-semibold text-gray-900">Sponsor ID:</span>{' '}
                    {selectedUser.sponsorId ?? 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Sponsor Organization:</span>{' '}
                    {selectedUser.sponsorOrganization ?? 'Unassigned'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
