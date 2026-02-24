'use client'

import { fireDriver } from "@/app/actions/sponsor/fire-driver";

interface FireDriverProps {
  driver: {
    id: string;
    sponsorId: string | null;
    status: string;
    pointsBalance: number;
    user: {
      name: string;
    };
  };
}

export default function FireDriverButton({ driver }: FireDriverProps) {
    async function handleClick() {
        await fireDriver(driver.id)
    }
  return (
    <>
      <button
        onClick= { handleClick }
        style={{
          backgroundColor: '#f70000',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Fire Driver
      </button>
    </>
  );
}