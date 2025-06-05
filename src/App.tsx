import React from 'react';
import { EnterpriseProvider } from '@/features/enterprise/context/EnterpriseContext';
import { InvoiceProvider } from '@/features/invoice/context/InvoiceContext';
import { TemplateProvider } from '@/features/templates/context/TemplateContext';
import { PDFProvider } from '@/features/pdf/context/PDFContext';
import Dashboard from '@/pages/Dashboard';
import EnterpriseSetup from '@/pages/EnterpriseSetup';

function App() {
  // Simple routing based on path
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  // Set up routing
  React.useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/setup') {
        setCurrentPage('setup');
      } else {
        setCurrentPage('dashboard');
      }
    };

    // Handle initial route
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <EnterpriseProvider>
      <TemplateProvider>
        <InvoiceProvider>
          <PDFProvider>
            <div className="min-h-screen bg-neutral-50">
              {currentPage === 'setup' ? <EnterpriseSetup /> : <Dashboard />}
            </div>
          </PDFProvider>
        </InvoiceProvider>
      </TemplateProvider>
    </EnterpriseProvider>
  );
}

export default App;