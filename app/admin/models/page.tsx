'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Activity, Database } from 'lucide-react';

interface ModelStatus {
  model: string;
  working: boolean;
  available: boolean;
}

interface HealthData {
  status: string;
  timestamp: string;
  apiKeyValid: boolean;
  availableModels: number;
  configuredModels: {
    conversation: ModelStatus;
    quick: ModelStatus;
    fallbackConversation: ModelStatus;
    fallbackQuick: ModelStatus;
  };
  warnings: string[];
  recommendations: string[];
}

export default function ModelDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/models');
      const data = await response.json();
      setHealthData(data);
      setLastChecked(new Date().toLocaleString());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (working: boolean, available: boolean) => {
    if (working && available) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (available && !working) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (working: boolean, available: boolean) => {
    if (working && available) return 'Working';
    if (available && !working) return 'Available but failing';
    return 'Not available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Health Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor Groq model availability and performance</p>
        </div>
        
        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      {healthData && (
        <div className={`p-6 rounded-lg border-2 ${getStatusColor(healthData.status)}`}>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Overall Status: {healthData.status.toUpperCase()}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>API Key:</strong> {healthData.apiKeyValid ? '✅ Valid' : '❌ Invalid'}
            </div>
            <div>
              <strong>Available Models:</strong> {healthData.availableModels}
            </div>
            <div>
              <strong>Last Checked:</strong> {lastChecked}
            </div>
          </div>
        </div>
      )}

      {/* Model Status Grid */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(healthData.configuredModels).map(([type, config]) => (
            <div key={type} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                {getStatusIcon(config.working, config.available)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{config.model}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    config.working && config.available ? 'text-green-600' :
                    config.available ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getStatusText(config.working, config.available)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings and Recommendations */}
      {healthData && (healthData.warnings.length > 0 || healthData.recommendations.length > 0) && (
        <div className="space-y-4">
          {healthData.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Warnings</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                {healthData.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {healthData.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                {healthData.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('https://console.groq.com', '_blank')}
            className="flex items-center gap-2 p-3 bg-white rounded border hover:bg-gray-50"
          >
            <Database className="w-4 h-4" />
            Open Groq Console
          </button>
          
          <button
            onClick={() => navigator.clipboard.writeText('npm run check-models')}
            className="flex items-center gap-2 p-3 bg-white rounded border hover:bg-gray-50"
          >
            📋 Copy Check Command
          </button>
          
          <button
            onClick={() => navigator.clipboard.writeText('npm run validate-models')}
            className="flex items-center gap-2 p-3 bg-white rounded border hover:bg-gray-50"
          >
            ✅ Copy Validate Command
          </button>
        </div>
      </div>

      {/* Developer Info */}
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🔧 Developer Commands</h3>
        <div className="space-y-2 font-mono text-sm">
          <div><span className="text-green-400">npm run check-models</span> - Check model health</div>
          <div><span className="text-green-400">npm run validate-models</span> - Validate codebase</div>
          <div><span className="text-green-400">npm run test-models</span> - Run both checks</div>
          <div><span className="text-green-400">curl localhost:3000/api/health/models</span> - API health check</div>
        </div>
      </div>
    </div>
  );
}