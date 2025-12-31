import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { Package, Calendar, DollarSign, XCircle, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const OrderList = ({ orders }) => {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState(null)

  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders'])
      alert('Order cancelled successfully')
    },
  })

  const handleCancel = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(orderId)
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Package className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No orders yet</p>
        <p className="text-gray-400 text-sm mt-2">Start shopping to see your orders here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status || 'Pending'}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {expandedId === order.id ? 'Hide Details' : 'Show Details'}
                </motion.button>

                {order.status?.toLowerCase() === 'pending' && (
                  <motion.button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancelMutation.isPending}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === order.id && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Product ID:</dt>
                        <dd className="font-medium">{order.productId}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Quantity:</dt>
                        <dd className="font-medium">{order.quantity}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Unit Price:</dt>
                        <dd className="font-medium">
                          ${((order.totalAmount || 0) / (order.quantity || 1)).toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Ordered:</dt>
                        <dd className="font-medium">
                          {new Date(order.createdAt || order.orderDate).toLocaleString()}
                        </dd>
                      </div>
                      {order.updatedAt && order.updatedAt !== order.createdAt && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Last Updated:</dt>
                          <dd className="font-medium">
                            {new Date(order.updatedAt).toLocaleString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default OrderList
