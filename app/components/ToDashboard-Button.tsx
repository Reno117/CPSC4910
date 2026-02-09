'use client';

import { useRouter } from 'next/navigation';

export default function ToDashBoard({ href }: { href: string }) {
  const router = useRouter();
  
  return (
    <button onClick={() => router.push(href)}
    style={{
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        width: '100px',
        height: '60px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
    > Back to Dashboard
    </button>
  );
}