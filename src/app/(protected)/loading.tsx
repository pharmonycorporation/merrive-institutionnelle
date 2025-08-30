export default function ProtectedLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 bg-white">
            <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

