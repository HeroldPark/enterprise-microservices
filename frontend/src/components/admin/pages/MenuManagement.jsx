import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import menuApi from '../../api/menuApi'
import MenuForm from '../../menu/MenuForm'
import { ROLES } from '../../menu/menuPermissions'

const MenuManagement = () => {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [expandedMenus, setExpandedMenus] = useState({})
  const [draggedItem, setDraggedItem] = useState(null)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const data = await menuApi.getAllMenus()
      setMenus(data)
    } catch (error) {
      console.error('메뉴 조회 실패:', error)
      alert('메뉴 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = () => {
    setEditingMenu(null)
    setShowForm(true)
  }

  const handleEditMenu = (menu) => {
    setEditingMenu(menu)
    setShowForm(true)
  }

  const handleDeleteMenu = async (menuId) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return

    try {
      await menuApi.deleteMenu(menuId)
      alert('메뉴가 삭제되었습니다.')
      fetchMenus()
    } catch (error) {
      console.error('메뉴 삭제 실패:', error)
      alert('메뉴 삭제에 실패했습니다.')
    }
  }

  const handleSaveMenu = async (menuData) => {
    try {
      if (editingMenu) {
        await menuApi.updateMenu(editingMenu.id, menuData)
        alert('메뉴가 수정되었습니다.')
      } else {
        await menuApi.createMenu(menuData)
        alert('메뉴가 생성되었습니다.')
      }
      
      setShowForm(false)
      setEditingMenu(null)
      fetchMenus()
    } catch (error) {
      console.error('메뉴 저장 실패:', error)
      alert('메뉴 저장에 실패했습니다.')
    }
  }

  const toggleMenuExpansion = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }))
  }

  const handleDragStart = (e, menu) => {
    setDraggedItem(menu)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetMenu) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetMenu.id) return

    const newMenus = [...menus]
    const draggedIndex = newMenus.findIndex(m => m.id === draggedItem.id)
    const targetIndex = newMenus.findIndex(m => m.id === targetMenu.id)

    const [removed] = newMenus.splice(draggedIndex, 1)
    newMenus.splice(targetIndex, 0, removed)

    const updatedMenus = newMenus.map((menu, index) => ({
      ...menu,
      order: index + 1
    }))

    setMenus(updatedMenus)

    try {
      const menuOrders = updatedMenus.map(menu => ({
        id: menu.id,
        order: menu.order
      }))
      await menuApi.updateMenuOrder(menuOrders)
    } catch (error) {
      console.error('메뉴 순서 변경 실패:', error)
      alert('메뉴 순서 변경에 실패했습니다.')
      fetchMenus()
    }

    setDraggedItem(null)
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      [ROLES.GUEST]: 'bg-gray-100 text-gray-800',
      [ROLES.USER]: 'bg-blue-100 text-blue-800',
      [ROLES.MANAGER]: 'bg-purple-100 text-purple-800',
      [ROLES.ADMIN]: 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">메뉴 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">메뉴 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              시스템 메뉴를 생성, 수정, 삭제하고 순서를 변경할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleCreateMenu}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            새 메뉴 추가
          </button>
        </div>

        <div className="p-6">
          {menus.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 메뉴가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {menus
                .sort((a, b) => a.order - b.order)
                .map((menu) => (
                  <div
                    key={menu.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, menu)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, menu)}
                    className={`border rounded-lg bg-white hover:shadow-md transition-all ${
                      draggedItem?.id === menu.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>

                      <div className="w-12 text-center font-semibold text-gray-600">
                        #{menu.order}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-800">{menu.name}</h3>
                          <span className="text-sm text-gray-500">({menu.id})</span>
                          
                          {menu.isDropdown && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              드롭다운
                            </span>
                          )}
                          
                          {menu.requiresAuth && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              로그인 필수
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {menu.path || '(경로 없음)'}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            아이콘: {menu.icon}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {menu.roles?.map(role => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(role)}`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>

                        {menu.isDropdown && menu.subItems?.length > 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleMenuExpansion(menu.id)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              {expandedMenus[menu.id] ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              서브메뉴 {menu.subItems.length}개
                            </button>

                            {expandedMenus[menu.id] && (
                              <div className="mt-2 pl-4 space-y-1">
                                {menu.subItems.map((subItem, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                                  >
                                    <span className="font-medium">{subItem.name}</span>
                                    <span className="text-gray-500">→</span>
                                    <span className="text-gray-600">{subItem.path}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-blue-50 border-t">
          <h3 className="font-semibold text-blue-900 mb-2">사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 메뉴를 드래그하여 순서를 변경할 수 있습니다.</li>
            <li>• 드롭다운 메뉴는 서브메뉴를 포함할 수 있습니다.</li>
            <li>• 권한은 GUEST, USER, MANAGER, ADMIN 중 선택할 수 있습니다.</li>
            <li>• 로그인 필수 옵션을 설정하면 인증된 사용자만 접근할 수 있습니다.</li>
          </ul>
        </div>
      </div>

      {showForm && (
        <MenuForm
          menu={editingMenu}
          onSave={handleSaveMenu}
          onClose={() => {
            setShowForm(false)
            setEditingMenu(null)
          }}
        />
      )}
    </div>
  )
}

export default MenuManagement
