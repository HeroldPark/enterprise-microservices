import { useAuthStore } from '../store/authStore'
import { User, Mail, Calendar } from 'lucide-react'

const Profile = () => {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-100 rounded-full p-6">
            <User className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <label className="block text-gray-500 text-sm mb-1">Username</label>
            <p className="text-xl font-semibold text-gray-900">{user.username}</p>
          </div>

          <div className="border-b pb-4">
            <label className="block text-gray-500 text-sm mb-1">Email</label>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
          </div>

          {user.firstName && (
            <div className="border-b pb-4">
              <label className="block text-gray-500 text-sm mb-1">First Name</label>
              <p className="text-lg text-gray-900">{user.firstName}</p>
            </div>
          )}

          {user.lastName && (
            <div className="border-b pb-4">
              <label className="block text-gray-500 text-sm mb-1">Last Name</label>
              <p className="text-lg text-gray-900">{user.lastName}</p>
            </div>
          )}

          {user.phoneNumber && (
            <div className="border-b pb-4">
              <label className="block text-gray-500 text-sm mb-1">Phone</label>
              <p className="text-lg text-gray-900">{user.phoneNumber}</p>
            </div>
          )}

          <div className="border-b pb-4">
            <label className="block text-gray-500 text-sm mb-1">Role</label>
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {user.role}
            </span>
          </div>

          {user.createdAt && (
            <div>
              <label className="block text-gray-500 text-sm mb-1">Member Since</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <p className="text-lg text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
