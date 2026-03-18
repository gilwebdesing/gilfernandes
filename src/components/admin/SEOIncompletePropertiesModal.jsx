import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Assuming standard badge
import { Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import SEOValidationReport from '@/components/admin/SEOValidationReport';
import PropertyForm from '@/components/admin/PropertyForm';

const SEOIncompletePropertiesModal = ({ onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (property) => {
    setEditingProperty(property);
  };

  const handleSuccess = () => {
    setEditingProperty(null);
    setRefreshKey(k => k + 1); // Refresh list
    if (onUpdate) onUpdate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          Ver Pendências
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             {editingProperty ? 'Editando SEO do Imóvel' : 'Gerenciamento de Pendências SEO'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 py-4">
          {editingProperty ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                 <span className="text-sm text-blue-800">Editando: <b>{editingProperty.title}</b></span>
                 <Button size="sm" variant="ghost" onClick={() => setEditingProperty(null)}>
                   <X className="w-4 h-4 mr-1" /> Cancelar
                 </Button>
              </div>
              {/* Reuse PropertyForm but focused on edit mode. 
                  Ideally we'd strip it down, but reusing is safer to ensure all data loads. 
                  We pass initialData. */}
              <PropertyForm 
                 mode="edit" 
                 initialData={editingProperty} 
                 onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <SEOValidationReport key={refreshKey} onEdit={handleEdit} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SEOIncompletePropertiesModal;