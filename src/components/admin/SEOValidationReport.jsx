import React, { useState, useEffect } from 'react';
import { SEOService } from '@/services/SEOService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'; // Assuming you might have these or use standard HTML tables
import { Button } from '@/components/ui/button';
import { Loader2, Edit, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Assuming existence or standard span
import { Link } from 'react-router-dom';

const SEOValidationReport = ({ onEdit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, title, description

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await SEOService.getPropertiesWithIncompleteSEO();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch incomplete properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const getMissingFieldType = (p) => {
    if (!p.meta_title && !p.meta_description) return 'Ambos';
    if (!p.meta_title) return 'Título';
    if (!p.meta_description) return 'Descrição';
    return '-';
  };

  const filteredProperties = properties.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'title' && !p.meta_title) return true;
    if (filter === 'description' && !p.meta_description) return true;
    return false;
  });

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
           <AlertTriangle className="w-5 h-5 text-yellow-500" />
           Imóveis com SEO Pendente
           <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{properties.length}</span>
        </h3>
        
        <div className="flex items-center gap-2">
           <select 
             className="border rounded-md px-3 py-1.5 text-sm bg-gray-50"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           >
             <option value="all">Todos os problemas</option>
             <option value="title">Falta Título</option>
             <option value="description">Falta Descrição</option>
           </select>
           <Button variant="outline" size="sm" onClick={fetchProperties}>
             <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
           </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
             <p className="text-lg font-medium text-gray-900">Tudo certo!</p>
             <p>Nenhum imóvel encontrado com pendências de SEO nesta categoria.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-3">Imóvel</th>
                <th className="px-6 py-3">Problema</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProperties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 truncate max-w-[300px]">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.id.substring(0,8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {getMissingFieldType(p)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onEdit ? (
                      <Button size="sm" variant="ghost" onClick={() => onEdit(p)} className="text-blue-600 hover:text-blue-800">
                         <Edit className="w-4 h-4 mr-1" /> Editar
                      </Button>
                    ) : (
                      // Fallback if no onEdit handler provided, though usually handled by parent
                      <Link to={`/admin/properties/edit/${p.id}`} className="text-blue-600 hover:underline inline-flex items-center">
                         <Edit className="w-4 h-4 mr-1" /> Editar
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SEOValidationReport;