export default function BusyScreen({ name }) {
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
      
      <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold">
        {name?.charAt(0)}
      </div>

      <h2 className="mt-4 text-xl font-semibold">{name}</h2>

      <p className="text-red-500 mt-2 animate-pulse">
        User is on another call
      </p>
    </div>
  );
}