import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import { useAuthStore } from '../../app/authStore'
import { User, Mail, Edit, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })

  const updateMutation = useMutation({
    mutationFn: (userData) => userService.updateUser(user.id, userData),
    onSuccess: (data) => {
      updateUser(data)
      queryClient.invalidateQueries(['user', user.id])
      setIsEditing(false)
      alert('Profile updated successfully')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Update failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Information</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">User ID:</dt>
                <dd className="font-medium">{user?.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Member Since:</dt>
                <dd className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          {isEditing && (
            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="h-5 w-5" />
                <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}

export default Profile
