/**
 * Dashboard page component
 * Main application interface for invoice creation
 */

import React, { useState } from 'react';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { useInvoice } from '@/features/invoice/context/InvoiceContext';
import { usePDF } from '@/features/pdf/context/PDFContext';
import { ProductForm } from '@/features/invoice/components/ProductForm';
import { ProductList } from '@/features/invoice/components/ProductList';
import { InvoicePreview } from '@/features/invoice/components/InvoicePreview';
import { InvoiceSettings } from '@/features/invoice/components/InvoiceSettings';
import { CustomerForm } from '@/features/invoice/components/CustomerForm';
import { TemplateManager } from '@/features/templates/components/TemplateManager';
import { Modal, Button, Card, FloatingActionButton, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui';
import { Plus, FileDown, Settings, User, BookTemplate as Template, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { enterprise, isInitialized } = useEnterprise();
  const { invoice, hasProducts, resetInvoice } = useInvoice();
  const { generatePDF, lastGeneratedPDF } = usePDF();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  // Mobile view state
  const [activeView, setActiveView] = useState<'products' | 'preview'>('products');
  
  // Redirect to setup if not initialized
  React.useEffect(() => {
    if (!isInitialized) {
      window.history.pushState({}, '', '/setup');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [isInitialized]);
  
  // Handle PDF generation
  const handleGeneratePDF = async () => {
    try {
      setIsPdfGenerating(true);
      const result = await generatePDF(invoice);
      
      // Open PDF in new tab
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  // Open modal
  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };
  
  // Close modal
  const closeModal = () => {
    setActiveModal(null);
  };
  
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-900">PDF Receipt Generator</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => {
                if (confirm('Are you sure you want to reset the current invoice? All changes will be lost.')) {
                  resetInvoice();
                }
              }}
            >
              Reset
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              leftIcon={<FileDown size={16} />}
              onClick={handleGeneratePDF}
              loading={isPdfGenerating}
              disabled={!hasProducts}
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile View Toggle */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 flex">
        <button
          className={cn(
            "flex-1 text-center py-3 font-medium text-sm border-b-2 transition-colors",
            activeView === 'products' 
              ? "border-accent-500 text-accent-700"
              : "border-transparent text-neutral-600 hover:text-neutral-800"
          )}
          onClick={() => setActiveView('products')}
        >
          Products
        </button>
        <button
          className={cn(
            "flex-1 text-center py-3 font-medium text-sm border-b-2 transition-colors",
            activeView === 'preview' 
              ? "border-accent-500 text-accent-700"
              : "border-transparent text-neutral-600 hover:text-neutral-800"
          )}
          onClick={() => setActiveView('preview')}
        >
          Preview
        </button>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Products Panel */}
          <div className={cn(
            'space-y-6',
            activeView !== 'products' && 'hidden lg:block'
          )}>
            <Card>
              <CardHeader>
                <CardTitle>Products & Services</CardTitle>
                <CardDescription>Add the items to include in your invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  leftIcon={<Template size={16} />}
                  onClick={() => openModal('templates')}
                >
                  Templates
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => openModal('addProduct')}
                >
                  Add Product
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Preview Panel */}
          <div className={cn(
            'space-y-6',
            activeView !== 'preview' && 'hidden lg:block'
          )}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice Preview</CardTitle>
                  <CardDescription>Preview your invoice before generating</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Settings size={16} />}
                    onClick={() => openModal('invoiceSettings')}
                  >
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<User size={16} />}
                    onClick={() => openModal('customer')}
                  >
                    Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InvoicePreview />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="primary"
                  leftIcon={<FileDown size={16} />}
                  onClick={handleGeneratePDF}
                  loading={isPdfGenerating}
                  disabled={!hasProducts}
                >
                  Generate PDF
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button (mobile only) */}
      <FloatingActionButton
        className="lg:hidden"
        icon={<Plus size={24} />}
        onClick={() => openModal('addProduct')}
        tooltip="Add Product"
      />
      
      {/* Modals */}
      <Modal
        isOpen={activeModal === 'addProduct'}
        onClose={closeModal}
        title="Add Product"
        size="md"
      >
        <ProductForm onSubmit={closeModal} />
      </Modal>
      
      <Modal
        isOpen={activeModal === 'customer'}
        onClose={closeModal}
        title="Customer Information"
        size="md"
      >
        <CustomerForm onSubmit={closeModal} />
      </Modal>
      
      <Modal
        isOpen={activeModal === 'invoiceSettings'}
        onClose={closeModal}
        title="Invoice Settings"
        size="md"
      >
        <InvoiceSettings onSubmit={closeModal} />
      </Modal>
      
      <Modal
        isOpen={activeModal === 'templates'}
        onClose={closeModal}
        title="Template Manager"
        size="lg"
      >
        <TemplateManager onClose={closeModal} />
      </Modal>
    </div>
  );
};

// Import the cn function from utils
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Dashboard;