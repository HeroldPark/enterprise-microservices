import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { ROLES } from '../menu/menuPermissions'

// 사용 가능한 아이콘 목록
const AVAILABLE_ICONS = [
  'Home', 'MessageSquare', 'Brain', 'Package', 'ShoppingCart',
  'Sparkles', 'User', 'Shield', 'Settings', 'FileText',
  'BarChart', 'Database', 'Lock', 'Users', 'Bell',
  'Calendar', 'Mail', 'Search', 'Heart', 'Star'
]

const MenuForm = ({ menu, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    path: '',
    icon: 'Home',
    roles: [ROLES.GUEST],
    order: 1,
    requiresAuth: false,
    showUsername: false,
    isDropdown: false,
    subItems: []
  })

  const [subMenuItem, setSubMenuItem] = useState({
    id: '',
    name: '',
    subtitle: '',
    description: '',
    application: '',
    strengths: '',
    weaknesses: '',
    path: '',
    roles: [ROLES.USER]
  })

  const [showSubMenuForm, setShowSubMenuForm] = useState(false)
  const [editingSubMenuIndex, setEditingSubMenuIndex] = useState(null)

  useEffect(() => {
    if (menu) {
      setFormData({
        ...menu,
        roles: menu.roles || [ROLES.GUEST],
        subItems: menu.subItems || []
      })
    }
  }, [menu])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
      
      return { ...prev, roles }
    })
  }

  const handleSubMenuChange = (e) => {
    const { name, value } = e.target
    setSubMenuItem(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubMenuRoleToggle = (role) => {
    setSubMenuItem(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
      
      return { ...prev, roles }
    })
  }

  const addOrUpdateSubMenu = () => {
    if (!subMenuItem.id || !subMenuItem.name || !subMenuItem.path) {
      alert('서브메뉴 ID, 이름, 경로는 필수입니다.')
      return
    }

    setFormData(prev => {
      const subItems = [...prev.subItems]
      
      if (editingSubMenuIndex !== null) {
        subItems[editingSubMenuIndex] = { ...subMenuItem }
      } else {
        subItems.push({ ...subMenuItem })
      }

      return { ...prev, subItems }
    })

    // 폼 초기화
    setSubMenuItem({
      id: '',
      name: '',
      subtitle: '',
      description: '',
      application: '',
      strengths: '',
      weaknesses: '',
      path: '',
      roles: [ROLES.USER]
    })
    setShowSubMenuForm(false)
    setEditingSubMenuIndex(null)
  }

  const editSubMenu = (index) => {
    setSubMenuItem(formData.subItems[index])
    setEditingSubMenuIndex(index)
    setShowSubMenuForm(true)
  }

  const deleteSubMenu = (index) => {
    if (confirm('이 서브메뉴를 삭제하시겠습니까?')) {
      setFormData(prev => ({
        ...prev,
        subItems: prev.subItems.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.id || !formData.name) {
      alert('메뉴 ID와 이름은 필수입니다.')
      return
    }

    if (!formData.isDropdown && !formData.path) {
      alert('드롭다운이 아닌 메뉴는 경로가 필수입니다.')
      return
    }

    if (formData.roles.length === 0) {
      alert('최소 하나 이상의 권한을 선택해야 합니다.')
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {menu ? '메뉴 수정' : '새 메뉴 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={!!menu}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="home, products, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Home, Products, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경로 {!formData.isDropdown && '*'}
              </label>
              <input
                type="text"
                name="path"
                value={formData.path || ''}
                onChange={handleChange}
                disabled={formData.isDropdown}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="/home, /products, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                순서
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 권한 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              접근 권한 *
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.values(ROLES).map(role => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 옵션 */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="requiresAuth"
                checked={formData.requiresAuth}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">로그인 필수</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="showUsername"
                checked={formData.showUsername}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">사용자 이름 표시</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDropdown"
                checked={formData.isDropdown}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">드롭다운 메뉴</span>
            </label>
          </div>

          {/* 서브메뉴 관리 */}
          {formData.isDropdown && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">서브메뉴</h3>
                <button
                  type="button"
                  onClick={() => setShowSubMenuForm(!showSubMenuForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  서브메뉴 추가
                </button>
              </div>

              {/* 서브메뉴 목록 */}
              {formData.subItems.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.subItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.path}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editSubMenu(index)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubMenu(index)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 서브메뉴 추가/수정 폼 */}
              {showSubMenuForm && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-800">
                    {editingSubMenuIndex !== null ? '서브메뉴 수정' : '서브메뉴 추가'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="id"
                      placeholder="ID *"
                      value={subMenuItem.id}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="이름 *"
                      value={subMenuItem.name}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="subtitle"
                      placeholder="부제목"
                      value={subMenuItem.subtitle}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="path"
                      placeholder="경로 *"
                      value={subMenuItem.path}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <textarea
                    name="description"
                    placeholder="설명"
                    value={subMenuItem.description}
                    onChange={handleSubMenuChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />

                  <textarea
                    name="application"
                    placeholder="응용 분야"
                    value={subMenuItem.application}
                    onChange={handleSubMenuChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      name="strengths"
                      placeholder="장점"
                      value={subMenuItem.strengths}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                    <textarea
                      name="weaknesses"
                      placeholder="단점"
                      value={subMenuItem.weaknesses}
                      onChange={handleSubMenuChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      접근 권한
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {Object.values(ROLES).map(role => (
                        <label key={role} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={subMenuItem.roles.includes(role)}
                            onChange={() => handleSubMenuRoleToggle(role)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addOrUpdateSubMenu}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {editingSubMenuIndex !== null ? '수정 완료' : '추가'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubMenuForm(false)
                        setEditingSubMenuIndex(null)
                        setSubMenuItem({
                          id: '',
                          name: '',
                          subtitle: '',
                          description: '',
                          application: '',
                          strengths: '',
                          weaknesses: '',
                          path: '',
                          roles: [ROLES.USER]
                        })
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={18} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MenuForm
