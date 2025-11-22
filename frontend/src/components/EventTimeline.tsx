'use client';

import { useEffect, useState } from 'react';

interface Delivery {
  deliveryId: string;
  orderId: string;
  customerName: string;
  status: string;
  items: string[];
  startedAt?: string;
  completedAt?: string;
  statusHistory: string[];
  createdAt: string;
  updatedAt: string;
}

interface EventTimelineProps {
  orderId?: string;
}

export default function EventTimeline({ orderId }: EventTimelineProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDeliveries = async () => {
    try {
      const trackingServiceUrl = process.env.NEXT_PUBLIC_TRACKING_SERVICE_URL || 'http://localhost:3003';
      const url = orderId 
        ? `${trackingServiceUrl}/tracking/order/${orderId}`
        : `${trackingServiceUrl}/tracking`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (orderId) {
        // Single delivery response
        setDeliveries(data.success && data.delivery ? [data.delivery] : []);
      } else {
        // Multiple deliveries response
        setDeliveries(data.success ? data.deliveries : []);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to fetch delivery events. Ensure tracking service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    
    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchDeliveries, 2000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return '📦';
      case 'IN_TRANSIT':
        return '🚚';
      case 'DELIVERED':
        return '✅';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement des événements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📊 Événements Kafka
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>Aucun événement de livraison pour le moment.</p>
          <p className="text-sm mt-2">Créez une commande pour voir les événements en temps réel!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          📊 Événements Kafka en Temps Réel
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Mise à jour automatique</span>
        </div>
      </div>

      <div className="space-y-6">
        {deliveries.map((delivery) => (
          <div
            key={delivery.deliveryId}
            className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{getStatusIcon(delivery.status)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Livraison: {delivery.deliveryId}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Commande: <span className="font-mono">{delivery.orderId}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Client: <span className="font-medium">{delivery.customerName}</span>
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  delivery.status
                )}`}
              >
                {delivery.status}
              </span>
            </div>

            {/* Items */}
            {delivery.items && delivery.items.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Articles:</p>
                <div className="flex flex-wrap gap-2">
                  {delivery.items.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                📈 Historique des Événements
              </h4>
              <div className="space-y-3">
                {delivery.statusHistory && delivery.statusHistory.length > 0 ? (
                  delivery.statusHistory.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        {index < delivery.statusHistory.length - 1 && (
                          <div className="w-0.5 h-8 bg-indigo-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm text-gray-800 font-medium">{event}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucun événement enregistré</p>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs text-gray-500">
              {delivery.startedAt && (
                <div>
                  <span className="font-medium">Début:</span>{' '}
                  {new Date(delivery.startedAt).toLocaleString('fr-FR')}
                </div>
              )}
              {delivery.completedAt && (
                <div>
                  <span className="font-medium">Terminé:</span>{' '}
                  {new Date(delivery.completedAt).toLocaleString('fr-FR')}
                </div>
              )}
              <div>
                <span className="font-medium">Créé:</span>{' '}
                {new Date(delivery.createdAt).toLocaleString('fr-FR')}
              </div>
              <div>
                <span className="font-medium">Mis à jour:</span>{' '}
                {new Date(delivery.updatedAt).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>💡 Note:</strong> Les événements sont mis à jour automatiquement toutes les 2 secondes.
          Les données proviennent de MongoDB via le Tracking Service qui consomme les événements Kafka.
        </p>
      </div>
    </div>
  );
}

