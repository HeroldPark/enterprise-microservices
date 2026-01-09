// import { useState } from 'react'
// import { ROLES, getFilteredMenuItems, canAccessMenu } from './menuPermissions'

// /**
//  * 메뉴 권한 시스템 테스트 컴포넌트
//  * 개발/테스트 환경에서 권한별 메뉴 표시 확인용
//  */
// const MenuPermissionsTest = () => {
//   const [selectedRole, setSelectedRole] = useState(ROLES.GUEST)
//   const [isAuthenticated, setIsAuthenticated] = useState(false)

//   const filteredMenus = getFilteredMenuItems(selectedRole, isAuthenticated)

//   return (
//     <div className="max-w-6xl mx-auto p-8 space-y-8">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">
//           Menu Permissions Test
//         </h1>

//         {/* 권한 선택 */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               User Role
//             </label>
//             <div className="flex space-x-4">
//               {Object.values(ROLES).map((role) => (
//                 <button
//                   key={role}
//                   onClick={() => setSelectedRole(role)}
//                   className={`px-4 py-2 rounded-lg font-medium transition ${
//                     selectedRole === role
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                   }`}
//                 >
//                   {role}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="flex items-center space-x-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={isAuthenticated}
//                 onChange={(e) => setIsAuthenticated(e.target.checked)}
//                 className="w-4 h-4 text-blue-600 rounded"
//               />
//               <span className="text-sm font-medium text-gray-700">
//                 Is Authenticated
//               </span>
//             </label>
//           </div>
//         </div>

//         {/* 현재 상태 표시 */}
//         <div className="mt-6 p-4 bg-gray-100 rounded-lg">
//           <h3 className="font-semibold text-gray-900 mb-2">Current State:</h3>
//           <div className="text-sm text-gray-700 space-y-1">
//             <p>Role: <span className="font-medium">{selectedRole}</span></p>
//             <p>Authenticated: <span className="font-medium">{isAuthenticated ? 'Yes' : 'No'}</span></p>
//             <p>Visible Menus: <span className="font-medium">{filteredMenus.length}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* 필터링된 메뉴 표시 */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//           Visible Menus
//         </h2>
//         <div className="space-y-4">
//           {filteredMenus.map((menu) => (
//             <div
//               key={menu.id}
//               className="border border-gray-200 rounded-lg p-4"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <span className="text-lg font-semibold text-gray-900">
//                     {menu.name}
//                   </span>
//                   {menu.isDropdown && (
//                     <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
//                       Dropdown
//                     </span>
//                   )}
//                   {menu.requiresAuth && (
//                     <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
//                       Requires Auth
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   Order: {menu.order}
//                 </div>
//               </div>

//               <div className="mt-2 text-sm text-gray-600">
//                 <p>Path: <span className="font-mono">{menu.path || 'N/A'}</span></p>
//                 <p>Icon: <span className="font-mono">{menu.icon}</span></p>
//                 <p>Allowed Roles: {menu.roles.join(', ')}</p>
//               </div>

//               {/* 서브 아이템 표시 */}
//               {menu.isDropdown && menu.subItems && (
//                 <div className="mt-3 pl-4 border-l-2 border-blue-300">
//                   <p className="text-sm font-medium text-gray-700 mb-2">
//                     Sub Items:
//                   </p>
//                   <div className="space-y-2">
//                     {menu.subItems
//                       .filter(sub => sub.roles.includes(selectedRole))
//                       .map((sub, idx) => (
//                         <div
//                           key={idx}
//                           className="text-sm p-2 bg-gray-50 rounded"
//                         >
//                           <p className="font-medium text-gray-900">
//                             {sub.name} ({sub.subtitle})
//                           </p>
//                           <p className="text-xs text-gray-600 mt-1">
//                             {sub.description}
//                           </p>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}

//           {filteredMenus.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No menus available for this role and authentication state.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 메뉴 접근 테스트 */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//           Menu Access Test
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {['home', 'boards', 'models', 'products', 'orders', 'profile', 'admin'].map((menuId) => {
//             const hasAccess = canAccessMenu(menuId, selectedRole, isAuthenticated)
//             return (
//               <div
//                 key={menuId}
//                 className={`p-4 rounded-lg border-2 ${
//                   hasAccess
//                     ? 'border-green-300 bg-green-50'
//                     : 'border-red-300 bg-red-50'
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium capitalize">{menuId}</span>
//                   <span
//                     className={`px-2 py-1 text-xs font-bold rounded ${
//                       hasAccess
//                         ? 'bg-green-200 text-green-800'
//                         : 'bg-red-200 text-red-800'
//                     }`}
//                   >
//                     {hasAccess ? 'ALLOWED' : 'DENIED'}
//                   </span>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>

//       {/* 권한 매트릭스 */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//           Permission Matrix
//         </h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border border-gray-300 px-4 py-2 text-left">
//                   Menu
//                 </th>
//                 {Object.values(ROLES).map((role) => (
//                   <th
//                     key={role}
//                     className="border border-gray-300 px-4 py-2 text-center"
//                   >
//                     {role}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredMenus.map((menu) => (
//                 <tr key={menu.id} className="hover:bg-gray-50">
//                   <td className="border border-gray-300 px-4 py-2 font-medium">
//                     {menu.name}
//                   </td>
//                   {Object.values(ROLES).map((role) => (
//                     <td
//                       key={role}
//                       className="border border-gray-300 px-4 py-2 text-center"
//                     >
//                       {menu.roles.includes(role) ? (
//                         <span className="text-green-600 font-bold">✓</span>
//                       ) : (
//                         <span className="text-red-600 font-bold">✗</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MenuPermissionsTest
