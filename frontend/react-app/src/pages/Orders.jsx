import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { useAuthStore } from '../store/authStore'
import OrderList from '../components/OrderList'
import { Loader } from 'lucide-react'

const Orders = () => {
  const { user } = useAuthStore()

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderService.getOrderHistory(user.id),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading orders</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>
      <OrderList orders={orders} />
    </div>
  )
}

export default Orders
