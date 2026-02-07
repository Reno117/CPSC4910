'use client'
import PointsManagementModal from "./Sponsor-PointChanger";
import React,{ useState } from 'react';

interface ManagePointsButtonProps {
  driver: {
    id: string;
    user: {
      name: string;
    };
  };
}

export default function ManagePointsButton({ driver }: ManagePointsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Manage Points
      </button>

      <PointsManagementModal 
        driver={isModalOpen ? driver : null}
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}