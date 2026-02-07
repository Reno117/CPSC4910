import { useState } from 'react';

interface PointsManagementModalProps {
  driver: {
    id: string;
    user: {
      name: string;
    };
  } | null;
  onClose: () => void;
}

export default function PointsManagementModal({ driver, onClose }: PointsManagementModalProps) {
  if (!driver) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Manage Points - {driver.user.name}</h3>
        
        {/* Your points management UI will go here */}
        
        <button 
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}