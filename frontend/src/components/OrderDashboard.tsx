'use client';

import { useState } from 'react';
import EventTimeline from './EventTimeline';

interface Order {
  orderId: string;
  customerName: string;
  items: string[];
  status: string;
  createdAt: string;
}

export default function OrderDashboard() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderServiceUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${orderServiceUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          items: items.split(',').map(item => item.trim()).filter(item => item),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders([data, ...orders]);
      
      setCustomerName('');
      setCustomerEmail('');
      setItems('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create order. Please ensure the order service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
          Systeme de Gestion de Livraisons
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Architecture orientée événements avec Apache Kafka
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Créer une nouvelle commande
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du client
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="john.doe@gmail.com"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Articles (séparés par des virgules)
              </label>
              <input
                type="text"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Ordinateur portable, Souris, Clavier"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? 'Création de la commande...' : 'Créer la commande'}
            </button>
          </form>
        </div>

        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Commandes récentes
            </h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID de la commande: {order.orderId}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Articles: {order.items.join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Timeline - Visualisation des événements Kafka */}
        <EventTimeline />

        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Architecture du système
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="font-semibold min-w-[180px]">Service de commandes:</span>
              <span>Crée une commande et publie l'événement order.created sur le topic orders</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold min-w-[180px]">Delivery Service:</span>
              <span>Consomme l'événement order.created, publie delivery.started et delivery.completed sur le topic deliveries</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold min-w-[180px]">Tracking Service:</span>
              <span>Met à jour MongoDB avec les changements de statut de livraison</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold min-w-[180px]">Notification Service:</span>
              <span>Envoie une notification lorsque la livraison est complétée</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}