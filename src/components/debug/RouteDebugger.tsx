import { useLocation } from 'react-router-dom';

const RouteDebugger = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🔍 Route Debug</h4>
      <div className="space-y-1">
        <div><strong>Pathname:</strong> {location.pathname}</div>
        <div><strong>Search:</strong> {location.search || 'none'}</div>
        <div><strong>Hash:</strong> {location.hash || 'none'}</div>
        <div><strong>State:</strong> {location.state ? JSON.stringify(location.state) : 'none'}</div>
        <div><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <h5 className="font-bold mb-1">Test Links:</h5>
        <div className="space-y-1">
          <a href="/test-new-page" className="block text-blue-300 hover:text-blue-100">Test Page</a>
          <a href="/hakkimizda/kalite-belgeleri" className="block text-green-300 hover:text-green-100">Kalite Belgeleri</a>
          <a href="/saglik-rehberi/videolar" className="block text-yellow-300 hover:text-yellow-100">Videolar</a>
          <a href="/admin/login" className="block text-red-300 hover:text-red-100">Admin</a>
        </div>
      </div>
    </div>
  );
};

export default RouteDebugger;
