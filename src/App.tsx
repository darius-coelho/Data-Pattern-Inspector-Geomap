import { useState, useEffect } from 'react';
import { UploadPage } from './pages/UploadPage';
import { DashboardPage } from './pages/DashboardPage';
import { hasStoredData, clearData } from './utils/indexedDB';

type AppPage = 'upload' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('upload');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have stored data and navigate accordingly
    const checkForStoredData = async () => {
      try {
        const hasData = await hasStoredData();
        setCurrentPage(hasData ? 'dashboard' : 'upload');
      } catch (error) {
        console.error('Failed to check for stored data:', error);
        setCurrentPage('upload');
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('beforeunload', clearData);

    checkForStoredData();

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', clearData);
    };
  }, []);

  const navigateToUpload = () => {
    setCurrentPage('upload');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Application</h2>
          <p className="text-gray-600">Initializing Data Pattern Inspector...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === 'upload' ? (
        <UploadPage onNavigateToDashboard={navigateToDashboard} />
      ) : (
        <DashboardPage onNavigateToUpload={navigateToUpload} />
      )}
    </div>
  );
}

export default App;
