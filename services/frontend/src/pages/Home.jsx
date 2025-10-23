import React from 'react';
import Header from '../components/Header.jsx';
import RightSideMenu from '../components/RightSideMenu.jsx';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />
        <div className="p-6">
          <h2 className="text-xl font-semibold">Welcome to MedSys</h2>
          <p className="mt-2 text-gray-600">
            This is your home page. Use the buttons above to manage your profile, or pick from the menu on the right.
          </p>
        </div>
      </div>
      <RightSideMenu />
    </div>
  );
}
