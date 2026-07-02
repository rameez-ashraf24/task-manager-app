"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        Task Manager App — Frontend Started! 🚀
      </h1>
    </div>
  );
}