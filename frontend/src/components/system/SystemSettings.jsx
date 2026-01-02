import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' });
  
  const categories = [
    { value: 'ALL', label: '전체', icon: '📋' },
    { value: 'GENERAL', label: '일반', icon: '⚙️' },
    { value: 'EMAIL', label: '이메일', icon: '📧' },
    { value: 'SECURITY', label: '보안', icon: '🔒' },
    { value: 'PAYMENT', label: '결제', icon: '💳' },
    { value: 'NOTIFICATION', label: '알림', icon: '🔔' },
    { value: 'MAINTENANCE', label: '유지보수', icon: '🛠️' },
    { value: 'INTEGRATION', label: '연동', icon: '🔗' }
  ];
  
  const valueTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'EMAIL', 'URL', 'PASSWORD'];
  
  const initialFormState = {
    key: '',
    value: '',
    type: 'STRING',
    category: 'GENERAL',
    description: '',
    defaultValue: '',
    isEncrypted: false,
    isActive: true
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    filterSettings();
  }, [settings, selectedCategory, searchQuery, sortConfig]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1000 }
      });
      setSettings(response.data.content || []);
    } catch (error) {
      showNotification('설정을 불러오는데 실패했습니다.', 'error');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSettings = () => {
    let filtered = settings;
    
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredSettings(filtered);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (setting) => {
    setFormData({
      key: setting.key,
      value: setting.value || '',
      type: setting.type,
      category: setting.category,
      description: setting.description || '',
      defaultValue: setting.defaultValue || '',
      isEncrypted: setting.isEncrypted,
      isActive: setting.isActive
    });
    setCurrentSetting(setting);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/admin/settings/${currentSetting.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('설정이 수정되었습니다.');
      } else {
        await axios.post(
          'http://localhost:8080/api/admin/settings',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('설정이 생성되었습니다.');
      }
      
      setIsModalOpen(false);
      fetchSettings();
    } catch (error) {
      showNotification(error.response?.data?.message || '작업 실패', 'error');
      console.error('Error saving setting:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 설정을 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/settings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('설정이 삭제되었습니다.');
      fetchSettings();
    } catch (error) {
      showNotification('삭제 실패', 'error');
      console.error('Error deleting setting:', error);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/admin/settings/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('설정 상태가 변경되었습니다.');
      fetchSettings();
    } catch (error) {
      showNotification('상태 변경 실패', 'error');
      console.error('Error toggling setting:', error);
    }
  };

  const handleReset = async (id) => {
    if (!window.confirm('기본값으로 초기화하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/admin/settings/${id}/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('기본값으로 초기화되었습니다.');
      fetchSettings();
    } catch (error) {
      showNotification(error.response?.data?.message || '초기화 실패', 'error');
      console.error('Error resetting setting:', error);
    }
  };

  const getCategoryIcon = (category) => {
    return categories.find(c => c.value === category)?.icon || '⚙️';
  };

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'error' ? styles.notificationError : styles.notificationSuccess)
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ 시스템 설정</h1>
          <p style={styles.subtitle}>각종 시스템 파라미터를 관리합니다</p>
        </div>
        <button onClick={openCreateModal} style={styles.createButton}>
          ➕ 새 설정 추가
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="설정 검색 (키, 설명)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.categoryTabs}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                ...styles.categoryTab,
                ...(selectedCategory === cat.value ? styles.categoryTabActive : {})
              }}
            >
              <span style={styles.categoryIcon}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>로딩 중...</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => handleSort('category')}>
                  카테고리 {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('key')}>
                  설정 키 {sortConfig.key === 'key' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>현재 값</th>
                <th style={styles.th}>타입</th>
                <th style={styles.th}>설명</th>
                <th style={styles.th} onClick={() => handleSort('isActive')}>
                  상태 {sortConfig.key === 'isActive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettings.map(setting => (
                <tr key={setting.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {getCategoryIcon(setting.category)} {setting.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.keyCell}>
                      <code style={styles.keyCode}>{setting.key}</code>
                      {setting.isEncrypted && (
                        <span style={styles.encryptedBadge}>🔒</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.valueCell}>
                      {setting.type === 'PASSWORD' ? (
                        <span style={styles.passwordMask}>••••••••</span>
                      ) : (
                        <span style={styles.value}>
                          {setting.value || <span style={styles.emptyValue}>(없음)</span>}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>{setting.type}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.description}>{setting.description || '-'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(setting.isActive ? styles.statusActive : styles.statusInactive)
                    }}>
                      {setting.isActive ? '● 활성' : '○ 비활성'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleToggle(setting.id)}
                        style={styles.actionBtn}
                        title={setting.isActive ? '비활성화' : '활성화'}
                      >
                        {setting.isActive ? '🔕' : '🔔'}
                      </button>
                      <button
                        onClick={() => openEditModal(setting)}
                        style={styles.actionBtn}
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleReset(setting.id)}
                        style={styles.actionBtn}
                        title="기본값으로 초기화"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
                        style={{...styles.actionBtn, ...styles.actionBtnDanger}}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSettings.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📭</p>
              <p style={styles.emptyText}>설정이 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {isEditing ? '설정 수정' : '새 설정 추가'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>설정 키 *</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    placeholder="예: site.name"
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>카테고리 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    style={styles.select}
                  >
                    {categories.filter(c => c.value !== 'ALL').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>타입 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    style={styles.select}
                  >
                    {valueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>기본값</label>
                  <input
                    type="text"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({...formData, defaultValue: e.target.value})}
                    placeholder="기본값"
                    style={styles.input}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <label style={styles.formLabel}>현재 값</label>
                <textarea
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="설정 값 입력"
                  rows={3}
                  style={styles.textarea}
                />
              </div>
              
              <div style={styles.formRow}>
                <label style={styles.formLabel}>설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="설정에 대한 설명"
                  rows={2}
                  style={styles.textarea}
                />
              </div>
              
              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isEncrypted}
                    onChange={(e) => setFormData({...formData, isEncrypted: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>🔒 암호화 필요</span>
                </label>
                
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>✅ 활성화</span>
                </label>
              </div>
              
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelButton}>
                  취소
                </button>
                <button type="submit" style={styles.submitButton}>
                  {isEditing ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: '"Segoe UI", -apple-system, sans-serif',
    background: '#f5f7fa',
    minHeight: '100vh',
  },
  
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 10000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
  },
  
  notificationSuccess: {
    background: '#10b981',
    color: 'white',
  },
  
  notificationError: {
    background: '#ef4444',
    color: 'white',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  
  createButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  filters: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  searchBox: {
    position: 'relative',
    marginBottom: '16px',
  },
  
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 44px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  
  categoryTab: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  
  categoryTabActive: {
    background: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  
  categoryIcon: {
    fontSize: '14px',
  },
  
  loading: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '12px',
  },
  
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151',
  },
  
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  
  keyCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  keyCode: {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '13px',
    color: '#3b82f6',
    fontWeight: '600',
  },
  
  encryptedBadge: {
    fontSize: '14px',
  },
  
  valueCell: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  
  value: {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '13px',
  },
  
  passwordMask: {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '16px',
    letterSpacing: '2px',
    color: '#9ca3af',
  },
  
  emptyValue: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  
  typeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  
  description: {
    color: '#6b7280',
    fontSize: '13px',
  },
  
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  statusActive: {
    background: '#d1fae5',
    color: '#065f46',
  },
  
  statusInactive: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  
  actions: {
    display: 'flex',
    gap: '6px',
  },
  
  actionBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  
  actionBtnDanger: {
    color: '#ef4444',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  
  emptyIcon: {
    fontSize: '48px',
    margin: '0 0 16px 0',
  },
  
  emptyText: {
    fontSize: '16px',
    color: '#9ca3af',
    margin: 0,
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '0',
    width: '32px',
    height: '32px',
  },
  
  form: {
    padding: '24px',
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  
  formRow: {
    marginBottom: '16px',
  },
  
  formLabel: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  
  checkboxRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '20px',
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  
  cancelButton: {
    padding: '10px 20px',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  
  submitButton: {
    padding: '10px 24px',
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default SystemSettings;
