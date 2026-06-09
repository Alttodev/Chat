import React from "react";

export default function CallingScreen({ name, onCancel }) {

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* CENTER CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* avatar */}
        <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold">
          {name?.charAt(0)}
        </div>

        {/* name */}
        <h2 className="mt-4 text-2xl font-semibold">{name}</h2>

        {/* status */}
        <p className="text-gray-400 mt-2 animate-pulse">Calling...</p>

        {/* animated dots */}
        <div className="flex gap-2 mt-8">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-150"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>

      {/* BOTTOM ACTION AREA */}
      <div className="pb-8 flex justify-center">
        <button
          onClick={onCancel}
          className="bg-red-600 px-8 py-3 rounded-full text-white font-medium cursor-pointer"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
