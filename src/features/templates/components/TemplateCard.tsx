/**
 * TemplateCard component
 * Displays a saved template with actions
 */

import React, { useState } from 'react';
import { useTemplates } from '../context/TemplateContext';
import { Template } from '../types/template.types';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { formatCurrency } from '@/features/invoice/services/invoiceCalculations';
import { Card, Button } from '@/shared/components/ui';
import { Clock, Trash2, Edit2, ChevronDown, ChevronUp, FileUp } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onLoadTemplate: (templateId: string) => void;
}

const TemplateCard = ({ template, onLoadTemplate }: TemplateCardProps) => {
  const { updateTemplate, deleteTemplate } = useTemplates();
  const { enterprise } = useEnterprise();
  const [expanded, setExpanded] = useState(false);
  
  // Format currency
  const formatAmount = (amount: number) => {
    return formatCurrency(
      amount,
      enterprise.settings.currency.code,
      enterprise.settings.currency.decimals
    );
  };
  
  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never used';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    
    // Fallback to regular date for older dates
    return date.toLocaleDateString();
  };
  
  // Calculate total value of all products
  const calculateTotal = () => {
    return template.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  };
  
  // Handle template deletion with confirmation
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(template.id);
    }
  };
  
  // Toggle expanded state
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-primary-900">
              {template.name}
            </h3>
            {template.category && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded mt-1">
                {template.category}
              </span>
            )}
          </div>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={toggleExpand}
              className="p-1.5 text-neutral-500 hover:text-primary-700 hover:bg-neutral-100 rounded transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-neutral-500 hover:text-danger-700 hover:bg-danger-50 rounded transition-colors"
              aria-label="Delete template"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 mb-1">
          <div className="flex items-center text-xs text-neutral-500">
            <Clock size={14} className="mr-1" />
            <span>
              {formatRelativeTime(template.metadata.lastUsed)}
            </span>
            {template.metadata.useCount > 0 && (
              <span className="ml-1">
                • Used {template.metadata.useCount} {template.metadata.useCount === 1 ? 'time' : 'times'}
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-primary-800">
            {formatAmount(calculateTotal())}
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-3 border-t border-neutral-100">
            <h4 className="text-xs font-medium text-primary-700 mb-2">Products:</h4>
            <ul className="space-y-2 text-sm text-primary-800">
              {template.products.map(product => (
                <li key={product.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="text-neutral-500 ml-2">
                      {product.quantity} × {formatAmount(product.price)}
                    </span>
                  </div>
                  <span>{formatAmount(product.quantity * product.price)}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full mt-4"
              leftIcon={<FileUp size={16} />}
              onClick={() => onLoadTemplate(template.id)}
            >
              Load Template
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TemplateCard;