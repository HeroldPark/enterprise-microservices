import { format } from 'date-fns'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'

const OrderList = ({ orders }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{order.id}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.createdAt && format(new Date(order.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2 mb-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {item.productName} x {item.quantity}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ${item.subtotal?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ${order.totalAmount?.toFixed(2)}
              </span>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium">Shipping to:</span> {order.shippingAddress}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderList
