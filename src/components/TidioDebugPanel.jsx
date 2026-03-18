import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

const TidioDebugPanel = () => {
  // Only show in development mode
  const isDev = import.meta.env.MODE === 'development';
  
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('Checking...');
  const [lastContext, setLastContext] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [eventLog, setEventLog] = useState([]);

  const addLog = (msg) => {
    setEventLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (!isDev) return;

    const interval = setInterval(() => {
      setStatus(window.tidioChatApi ? 'Loaded' : 'Not Loaded');
    }, 1000);

    // Patch setVisitorData to intercept calls for debugging
    if (window.tidioChatApi && !window.tidioChatApi._patched) {
        const originalSetVisitorData = window.tidioChatApi.setVisitorData;
        window.tidioChatApi.setVisitorData = function(data) {
            console.debug('Tidio Debug Intercept:', data);
            setLastContext(data);
            setLastUpdate(new Date().toLocaleTimeString());
            addLog('setVisitorData called');
            return originalSetVisitorData.apply(this, arguments);
        };
        window.tidioChatApi._patched = true;
        addLog('API Intercepted');
    }

    return () => clearInterval(interval);
  }, [isDev]);

  if (!isDev) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700 hover:bg-gray-800 transition-all flex items-center gap-2 font-mono"
      >
        <span className={cn("w-2 h-2 rounded-full", status === 'Loaded' ? "bg-green-500" : "bg-red-500")}></span>
        Tidio Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-80 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden text-xs flex flex-col max-h-[500px]">
      <div className="bg-gray-900 text-white px-3 py-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", status === 'Loaded' ? "bg-green-400" : "bg-red-500")}></span>
            <span className="font-bold">Tidio Integration Debug</span>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={() => setEventLog([])} className="hover:text-gray-300 p-1" title="Clear Log"><RefreshCw size={12}/></button>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 p-1"><ChevronDown size={14}/></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
        {/* Status Section */}
        <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
          <div className="flex justify-between border-b border-gray-100 pb-1 mb-1">
            <span className="text-gray-500 font-semibold">API Status</span>
            <span className={cn("font-bold", status === 'Loaded' ? "text-green-600" : "text-red-500")}>
              {status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Update</span>
            <span className="font-mono text-gray-700">{lastUpdate || 'Never'}</span>
          </div>
        </div>
        
        {/* Context Data Section */}
        <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
          <span className="text-gray-500 font-semibold block mb-1 border-b border-gray-100 pb-1">Last Context Sent</span>
          {lastContext ? (
            <div className="space-y-1">
                {Object.entries(lastContext).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                        <span className="text-gray-400 text-[10px] uppercase">{key}</span>
                        <span className="font-mono text-gray-800 break-words">{String(value)}</span>
                    </div>
                ))}
            </div>
          ) : (
            <span className="text-gray-400 italic py-2 block text-center">No data sent yet</span>
          )}
        </div>

        {/* Event Log */}
        <div className="bg-gray-900 rounded border border-gray-800 shadow-inner p-2">
            <span className="text-gray-400 font-semibold block mb-1 text-[10px] uppercase tracking-wider">Event Log</span>
            <div className="font-mono text-[10px] text-green-400 space-y-1 h-24 overflow-y-auto">
                {eventLog.length === 0 && <span className="text-gray-600 italic">Waiting for events...</span>}
                {eventLog.map((log, i) => (
                    <div key={i} className="border-b border-gray-800 last:border-0 pb-0.5">{log}</div>
                ))}
            </div>
        </div>

        <div className="pt-1">
          <button 
            onClick={() => {
                if(window.tidioChatApi) {
                    window.tidioChatApi.open();
                    addLog('Forced chat open');
                } else {
                    alert('Tidio API not ready');
                    addLog('Failed to open chat');
                }
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold shadow-sm"
          >
            Force Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default TidioDebugPanel;