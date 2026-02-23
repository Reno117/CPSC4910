'use client';

interface User {
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ user, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-6">User Settings</h2>

          <div className="flex flex-col items-center gap-4">

            {/* Profile Picture or Fallback */}
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info Rows */}
            <div className="w-full space-y-3">
              <SettingRow label="Name" value={user.name} />
              <SettingRow label="Email" value={user.email} />
              <SettingRow label="Role" value={user.role} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
    </div>
  );
}