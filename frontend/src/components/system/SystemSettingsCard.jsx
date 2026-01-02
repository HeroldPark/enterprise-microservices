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
  }, [settings, selectedCategory, searchQuery]);

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
    
    setFilteredSettings(filtered);
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
          <h1 style={styles.title}>시스템 설정</h1>
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
            placeholder="설정 검색..."
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

      {/* Settings Grid */}
      {loading ? (
        <div style={styles.loading}>로딩 중...</div>
      ) : (
        <div style={styles.grid}>
          {filteredSettings.map(setting => (
            <div key={setting.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <span style={styles.keyBadge}>{setting.key}</span>
                  <span style={{
                    ...styles.statusBadge,
                    ...(setting.isActive ? styles.statusActive : styles.statusInactive)
                  }}>
                    {setting.isActive ? '● 활성' : '○ 비활성'}
                  </span>
                </div>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleToggle(setting.id)}
                    style={styles.iconButton}
                    title={setting.isActive ? '비활성화' : '활성화'}
                  >
                    {setting.isActive ? '🔕' : '🔔'}
                  </button>
                  <button
                    onClick={() => openEditModal(setting)}
                    style={styles.iconButton}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleReset(setting.id)}
                    style={styles.iconButton}
                    title="기본값으로 초기화"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    style={styles.iconButtonDanger}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div style={styles.cardBody}>
                {setting.description && (
                  <p style={styles.description}>{setting.description}</p>
                )}
                
                <div style={styles.valueContainer}>
                  <label style={styles.label}>현재 값</label>
                  <div style={styles.valueDisplay}>
                    {setting.type === 'PASSWORD' ? '••••••••' : setting.value || '(없음)'}
                  </div>
                </div>
                
                {setting.defaultValue && (
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>기본값:</span>
                    <span style={styles.metaValue}>{setting.defaultValue}</span>
                  </div>
                )}
                
                <div style={styles.tags}>
                  <span style={styles.tag}>{setting.type}</span>
                  <span style={styles.tag}>{setting.category}</span>
                  {setting.isEncrypted && <span style={styles.tagEncrypted}>🔒 암호화</span>}
                </div>
                
                {setting.updatedBy && (
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>수정자:</span>
                    <span style={styles.metaValue}>{setting.updatedBy}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
                <label style={styles.formLabel}>값</label>
                <textarea
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="설정 값 입력"
                  rows={3}
                  style={styles.textarea}
                />
              </div>
              
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
              
              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isEncrypted}
                    onChange={(e) => setFormData({...formData, isEncrypted: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>암호화 필요</span>
                </label>
                
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>활성화</span>
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
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '"Geist", -apple-system, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
  },
  
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 10000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease',
  },
  
  notificationSuccess: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  
  notificationError: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  
  title: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
    margin: 0,
    letterSpacing: '-0.5px',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    margin: '8px 0 0 0',
  },
  
  createButton: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  },
  
  filters: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  
  searchBox: {
    position: 'relative',
    marginBottom: '20px',
  },
  
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
  },
  
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  
  categoryTab: {
    padding: '10px 16px',
    border: '2px solid #e0e0e0',
    background: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  
  categoryTabActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: 'transparent',
  },
  
  categoryIcon: {
    fontSize: '16px',
  },
  
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: 'white',
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
  },
  
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0',
  },
  
  cardTitle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  
  keyBadge: {
    fontFamily: 'Monaco, monospace',
    fontSize: '13px',
    fontWeight: '600',
    color: '#667eea',
  },
  
  statusBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  
  statusActive: {
    background: '#e8f5e9',
    color: '#2e7d32',
  },
  
  statusInactive: {
    background: '#fce4ec',
    color: '#c2185b',
  },
  
  cardActions: {
    display: 'flex',
    gap: '6px',
  },
  
  iconButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  
  iconButtonDanger: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  
  description: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.6',
  },
  
  valueContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  valueDisplay: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Monaco, monospace',
    color: '#333',
    wordBreak: 'break-all',
  },
  
  metaRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
  },
  
  metaLabel: {
    color: '#999',
    fontWeight: '500',
  },
  
  metaValue: {
    color: '#666',
  },
  
  tags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  
  tag: {
    padding: '4px 10px',
    background: '#f0f0f0',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#666',
  },
  
  tagEncrypted: {
    padding: '4px 10px',
    background: '#fff3e0',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#f57c00',
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '2px solid #f0f0f0',
  },
  
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    margin: 0,
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '32px',
    height: '32px',
  },
  
  form: {
    padding: '28px',
  },
  
  formRow: {
    marginBottom: '20px',
  },
  
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  
  checkboxRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
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
    paddingTop: '24px',
    borderTop: '2px solid #f0f0f0',
  },
  
  cancelButton: {
    padding: '12px 24px',
    border: '2px solid #e0e0e0',
    background: 'white',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.3s ease',
  },
  
  submitButton: {
    padding: '12px 32px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
  },
};

export default SystemSettings;
