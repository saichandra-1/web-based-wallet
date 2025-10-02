"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export  function RedirectWithLoading() {
  const navigate = useRouter();

  useEffect(() => {
      navigate.push('/home');
  }, [navigate]);

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );

}
