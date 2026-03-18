import React, { useEffect, useState } from 'react';
import { SEOService } from '@/services/SEOService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Basic cards
import { Loader2, PieChart, Search, CheckCircle, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOIncompletePropertiesModal from './SEOIncompletePropertiesModal';

const SEOStatusDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await SEOService.getPropertySEOStatus();
      setStats(data);
    } catch (error) {
      console.error("Failed to load SEO stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger(t => t + 1);

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-gray-500">Total de Imóveis</p>
              <h4 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h4>
           </div>
           <div className="bg-blue-50 p-3 rounded-full">
              <Search className="w-6 h-6 text-blue-600" />
           </div>
        </div>

        {/* Complete Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-gray-500">SEO Completo</p>
              <h4 className="text-3xl font-bold text-green-600 mt-1">
                 {stats.complete} <span className="text-sm text-gray-400 font-normal">({stats.percentageComplete}%)</span>
              </h4>
           </div>
           <div className="bg-green-50 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
           </div>
        </div>

         {/* Incomplete Card */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <h4 className="text-3xl font-bold text-orange-600 mt-1">{stats.incomplete}</h4>
           </div>
           <div className="bg-orange-50 p-3 rounded-full">
              <AlertOctagon className="w-6 h-6 text-orange-600" />
           </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SEOIncompletePropertiesModal onUpdate={refresh} />
      </div>
    </div>
  );
};

export default SEOStatusDashboard;