console.log('=== 1. ORDERS FILE LOADED ===')

import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { useAuthStore } from '../../app/authStore'
import OrderList from '../components/OrderList'
import { Loader } from 'lucide-react'
import { motion } from 'framer-motion'

console.log('=== 2. ORDERS IMPORTS COMPLETE ===')

const Orders = () => {
  console.log('=== 3. ORDERS COMPONENT EXECUTING ===')
  
  const { user } = useAuthStore()
  console.log('=== 4. Got user:', user)

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => {
      console.log('=== 5. Calling orderService.getOrderHistory ===')
      return orderService.getOrderHistory(user.id)
    },
    enabled: !!user?.id,
  })

  console.log('=== 6. Query state:', { isLoading, error, hasOrders: !!orders })

  if (isLoading) {
    console.log('=== 7. Rendering LOADING ===')
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    console.log('=== 7. Rendering ERROR:', error.message)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading orders: {error.message}</p>
      </div>
    )
  }

  console.log('=== 7. Rendering ORDERS LIST ===')
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Orders
      </motion.h1>
      {orders && orders.length > 0 ? (
        <>
          <p>Found {orders.length} orders</p>
          <OrderList orders={orders} />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders yet</p>
        </div>
      )}
    </div>
  )
}

console.log('=== 8. ORDERS FUNCTION DEFINED ===', typeof Orders)

export default Orders

console.log('=== 9. ORDERS EXPORTED ===')
