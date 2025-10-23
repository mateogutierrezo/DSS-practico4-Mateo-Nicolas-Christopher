import React from 'react';

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white p-6 rounded-lg w-11/12 max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
