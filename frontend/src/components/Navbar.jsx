// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuthStore } from './app/authStore'
// import { ShoppingCart, User, LogOut, Home, Package, MessageSquare, ChevronDown } from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'

// const Navbar = () => {
//   const navigate = useNavigate()
//   const { isAuthenticated, user, logout } = useAuthStore()
//   const [isModelsOpen, setIsModelsOpen] = useState(false)

//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//   }

//   const models = [
//     {
//       name: 'Isolation Forest',
//       subtitle: '격리 숲',
//       description: '이상치는 정상보다 쉽게 격리된다',
//       application: '비정상적인 센서 조합 즉시 감지',
//       strengths: '실시간 이상 탐지, 빠른 속도',
//       weaknesses: '시계열 패턴 무시',
//       path: '/models/isolation-forest'
//     },
//     {
//       name: 'LSTM',
//       subtitle: '장단기 메모리',
//       description: '게이트 메커니즘으로 장기 기억 유지',
//       application: '30분~1시간 전 패턴 학습',
//       strengths: '복잡한 시계열 의존성 포착',
//       weaknesses: '학습 시간 길고 데이터 많이 필요',
//       path: '/models/lstm'
//     },
//     {
//       name: 'GRU',
//       subtitle: '게이트 순환 유닛',
//       description: 'LSTM 간소화 버전 (2개 게이트)',
//       application: '5~15분 단기 급변 감지',
//       strengths: 'LSTM보다 빠르고 효율적',
//       weaknesses: '매우 긴 시퀀스에서 성능 저하',
//       path: '/models/gru'
//     },
//     {
//       name: 'Random Forest',
//       subtitle: '랜덤 포레스트',
//       description: '여러 결정트리의 투표/평균',
//       application: '센서 특징의 통계적 분석',
//       strengths: '특징 중요도 제공, 과적합 방지',
//       weaknesses: '시간적 순서 고려 못함',
//       path: '/models/random-forest'
//     },
//     {
//       name: 'XGBoost',
//       subtitle: '극한 그래디언트 부스팅',
//       description: '이전 오류를 학습하며 순차적 개선',
//       application: '복잡한 센서 간 상호작용 학습',
//       strengths: '최고 수준 정확도, 빠른 속도',
//       weaknesses: '하이퍼파라미터 튜닝 복잡',
//       path: '/models/xgboost'
//     }
//   ]

//   return (
//     <motion.nav 
//       className="bg-white shadow-lg relative z-50"
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
//     >
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           <Link to="/" className="flex items-center space-x-2 group">
//             <motion.div
//               whileHover={{ rotate: 360 }}
//               transition={{ duration: 0.5 }}
//             >
//               <Package className="h-8 w-8 text-blue-600" />
//             </motion.div>
//             <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
//               Enterprise
//             </span>
//           </Link>

//           <div className="flex items-center space-x-6">
//             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//               <Link
//                 to="/"
//                 className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//               >
//                 <Home className="h-5 w-5" />
//                 <span>Home</span>
//               </Link>
//             </motion.div>

//             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//               <Link
//                 to="/boards"
//                 className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//               >
//                 <MessageSquare className="h-5 w-5" />
//                 <span>Boards</span>
//               </Link>
//             </motion.div>

//             {isAuthenticated ? (
//               <>
//                 {/* Models Dropdown */}
//                 <div 
//                   className="relative"
//                   onMouseEnter={() => setIsModelsOpen(true)}
//                   onMouseLeave={() => setIsModelsOpen(false)}
//                 >
//                   <motion.button
//                     className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <MessageSquare className="h-5 w-5" />
//                     <span>Models</span>
//                     <motion.div
//                       animate={{ rotate: isModelsOpen ? 180 : 0 }}
//                       transition={{ duration: 0.2 }}
//                     >
//                       <ChevronDown className="h-4 w-4" />
//                     </motion.div>
//                   </motion.button>

//                   <AnimatePresence>
//                     {isModelsOpen && (
//                       <motion.div
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         transition={{ duration: 0.2 }}
//                         className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
//                       >
//                         <div className="p-2">
//                           {models.map((model, index) => (
//                             <Link
//                               key={index}
//                               to={model.path}
//                               className="block p-4 hover:bg-blue-50 rounded-lg transition-colors"
//                             >
//                               <div className="space-y-2">
//                                 <div className="flex items-baseline space-x-2">
//                                   <h3 className="font-bold text-gray-900">{model.name}</h3>
//                                   <span className="text-sm text-gray-500">({model.subtitle})</span>
//                                 </div>
                                
//                                 <div className="space-y-1 text-sm">
//                                   <p className="text-gray-700">
//                                     <span className="font-semibold text-blue-600">원리:</span> {model.description}
//                                   </p>
//                                   <p className="text-gray-700">
//                                     <span className="font-semibold text-green-600">화재 예측:</span> {model.application}
//                                   </p>
//                                   <p className="text-gray-700">
//                                     <span className="font-semibold text-purple-600">강점:</span> {model.strengths}
//                                   </p>
//                                   <p className="text-gray-700">
//                                     <span className="font-semibold text-red-600">약점:</span> {model.weaknesses}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Link>
//                           ))}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>

//                 <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//                   <Link
//                     to="/products"
//                     className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//                   >
//                     <Package className="h-5 w-5" />
//                     <span>Products</span>
//                   </Link>
//                 </motion.div>

//                 <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//                   <Link
//                     to="/orders"
//                     className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//                   >
//                     <ShoppingCart className="h-5 w-5" />
//                     <span>Orders</span>
//                   </Link>
//                 </motion.div>

//                 <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//                   <Link
//                     to="/profile"
//                     className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//                   >
//                     <User className="h-5 w-5" />
//                     <span>{user?.username}</span>
//                   </Link>
//                 </motion.div>

//                 <motion.button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <LogOut className="h-5 w-5" />
//                   <span>Logout</span>
//                 </motion.button>
//               </>
//             ) : (
//               <>
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Link
//                     to="/login"
//                     className="text-gray-700 hover:text-blue-600 transition"
//                   >
//                     Login
//                   </Link>
//                 </motion.div>
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Link
//                     to="/register"
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//                   >
//                     Register
//                   </Link>
//                 </motion.div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   )
// }

// export default Navbar
