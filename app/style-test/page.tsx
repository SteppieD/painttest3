export default function StyleTestPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Style Test Page</h1>
        <p className="text-gray-700 mb-4">If you can see this with proper styling, Tailwind is working.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Card 1</h2>
            <p className="text-gray-600">This is a test card.</p>
          </div>
          <div className="bg-blue-500 text-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Card 2</h2>
            <p>This has a blue background.</p>
          </div>
          <div className="bg-green-500 text-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Card 3</h2>
            <p>This has a green background.</p>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}