import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'modelType', direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  
  const models = [
    { value: 'ALL', label: '전체 모델', icon: '🤖', color: '#6366f1' },
    { value: 'ISOLATION_FOREST', label: 'Isolation Forest', icon: '🌲', color: '#10b981' },
    { value: 'LSTM', label: 'LSTM', icon: '📊', color: '#3b82f6' },
    { value: 'GRU', label: 'GRU', icon: '📈', color: '#8b5cf6' },
    { value: 'RANDOM_FOREST', label: 'Random Forest', icon: '🌳', color: '#f59e0b' },
    { value: 'XGBOOST', label: 'XGBoost', icon: '⚡', color: '#ef4444' }
  ];

  const environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION'];
  
  const initialFormState = {
    modelType: 'ISOLATION_FOREST',
    configName: '',
    description: '',
    parameters: '',
    version: '',
    trainingDataset: '',
    accuracy: '',
    f1Score: '',
    isDefault: false,
    isActive: true,
    environment: 'DEVELOPMENT',
    lastTrainedAt: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    filterConfigs();
  }, [configs, selectedModel, searchQuery, sortConfig]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/model-configs', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1000 }
      });
      setConfigs(response.data.content || []);
    } catch (error) {
      showNotification('설정을 불러오는데 실패했습니다.', 'error');
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConfigs = () => {
    let filtered = configs;
    
    if (selectedModel !== 'ALL') {
      filtered = filtered.filter(c => c.modelType === selectedModel);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.configName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredConfigs(filtered);
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

  const openEditModal = (config) => {
    setFormData({
      modelType: config.modelType,
      configName: config.configName,
      description: config.description || '',
      parameters: config.parameters || '',
      version: config.version || '',
      trainingDataset: config.trainingDataset || '',
      accuracy: config.accuracy || '',
      f1Score: config.f1Score || '',
      isDefault: config.isDefault,
      isActive: config.isActive,
      environment: config.environment,
      lastTrainedAt: config.lastTrainedAt || ''
    });
    setCurrentConfig(config);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
        f1Score: formData.f1Score ? parseFloat(formData.f1Score) : null,
      };
      
      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/admin/model-configs/${currentConfig.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('설정이 수정되었습니다.');
      } else {
        await axios.post(
          'http://localhost:8080/api/admin/model-configs',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('설정이 생성되었습니다.');
      }
      
      setIsModalOpen(false);
      fetchConfigs();
    } catch (error) {
      showNotification(error.response?.data?.message || '작업 실패', 'error');
      console.error('Error saving config:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 설정을 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/model-configs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('설정이 삭제되었습니다.');
      fetchConfigs();
    } catch (error) {
      showNotification(error.response?.data?.message || '삭제 실패', 'error');
      console.error('Error deleting config:', error);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/admin/model-configs/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('설정 상태가 변경되었습니다.');
      fetchConfigs();
    } catch (error) {
      showNotification('상태 변경 실패', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    if (!window.confirm('이 설정을 기본 설정으로 지정하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/admin/model-configs/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('기본 설정으로 지정되었습니다.');
      fetchConfigs();
    } catch (error) {
      showNotification('설정 실패', 'error');
    }
  };

  const handleClone = async (id) => {
    const newName = window.prompt('새 설정 이름을 입력하세요:');
    if (!newName) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/admin/model-configs/${id}/clone`,
        null,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { newConfigName: newName }
        }
      );
      showNotification('설정이 복제되었습니다.');
      fetchConfigs();
    } catch (error) {
      showNotification(error.response?.data?.message || '복제 실패', 'error');
    }
  };

  const getModelInfo = (modelType) => {
    return models.find(m => m.value === modelType) || models[0];
  };

  const formatJson = (jsonStr) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'error' ? styles.notificationError : styles.notificationSuccess)
        }}>
          {notification.message}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🤖 모델 설정 관리</h1>
          <p style={styles.subtitle}>ML/AI 모델의 하이퍼파라미터와 설정을 관리합니다</p>
        </div>
        <button onClick={openCreateModal} style={styles.createButton}>
          ➕ 새 설정 추가
        </button>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="설정 검색 (이름, 설명)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.modelTabs}>
          {models.map(model => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              style={{
                ...styles.modelTab,
                ...(selectedModel === model.value ? {
                  ...styles.modelTabActive,
                  background: model.color,
                  borderColor: model.color
                } : {})
              }}
            >
              <span style={styles.modelIcon}>{model.icon}</span>
              {model.label}
            </button>
          ))}
        </div>
      </div>

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
                <th style={styles.th} onClick={() => handleSort('modelType')}>
                  모델 {sortConfig.key === 'modelType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('configName')}>
                  설정 이름 {sortConfig.key === 'configName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>버전</th>
                <th style={styles.th} onClick={() => handleSort('environment')}>
                  환경 {sortConfig.key === 'environment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('accuracy')}>
                  정확도 {sortConfig.key === 'accuracy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>F1 Score</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map(config => {
                const modelInfo = getModelInfo(config.modelType);
                return (
                  <tr key={config.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.modelCell}>
                        <span style={{...styles.modelBadge, background: modelInfo.color}}>
                          {modelInfo.icon} {modelInfo.label}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <code style={styles.configName}>{config.configName}</code>
                        {config.isDefault && (
                          <span style={styles.defaultBadge}>⭐ 기본</span>
                        )}
                      </div>
                      {config.description && (
                        <div style={styles.description}>{config.description}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.version}>{config.version || '-'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.envBadge,
                        ...(config.environment === 'PRODUCTION' && styles.envProd),
                        ...(config.environment === 'STAGING' && styles.envStaging),
                        ...(config.environment === 'DEVELOPMENT' && styles.envDev)
                      }}>
                        {config.environment}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.metricCell}>
                        {config.accuracy ? (
                          <>
                            <div style={styles.metricBar}>
                              <div style={{
                                ...styles.metricFill,
                                width: `${config.accuracy * 100}%`,
                                background: config.accuracy > 0.9 ? '#10b981' : '#f59e0b'
                              }}></div>
                            </div>
                            <span style={styles.metricValue}>
                              {(config.accuracy * 100).toFixed(2)}%
                            </span>
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {config.f1Score ? (
                        <span style={styles.metricValue}>
                          {(config.f1Score * 100).toFixed(2)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(config.isActive ? styles.statusActive : styles.statusInactive)
                      }}>
                        {config.isActive ? '● 활성' : '○ 비활성'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {!config.isDefault && (
                          <button
                            onClick={() => handleSetDefault(config.id)}
                            style={styles.actionBtn}
                            title="기본 설정으로 지정"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          onClick={() => handleToggle(config.id)}
                          style={styles.actionBtn}
                          title={config.isActive ? '비활성화' : '활성화'}
                        >
                          {config.isActive ? '🔕' : '🔔'}
                        </button>
                        <button
                          onClick={() => openEditModal(config)}
                          style={styles.actionBtn}
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleClone(config.id)}
                          style={styles.actionBtn}
                          title="복제"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          style={{...styles.actionBtn, ...styles.actionBtnDanger}}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredConfigs.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📭</p>
              <p style={styles.emptyText}>설정이 없습니다</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {isEditing ? '모델 설정 수정' : '새 모델 설정 추가'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>모델 타입 *</label>
                  <select
                    value={formData.modelType}
                    onChange={(e) => setFormData({...formData, modelType: e.target.value})}
                    required
                    style={styles.select}
                  >
                    {models.filter(m => m.value !== 'ALL').map(model => (
                      <option key={model.value} value={model.value}>
                        {model.icon} {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>설정 이름 *</label>
                  <input
                    type="text"
                    value={formData.configName}
                    onChange={(e) => setFormData({...formData, configName: e.target.value})}
                    placeholder="예: production"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>버전</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="v1.0"
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>환경</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({...formData, environment: e.target.value})}
                    style={styles.select}
                  >
                    {environments.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                </div>
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
                <label style={styles.formLabel}>하이퍼파라미터 (JSON)</label>
                <textarea
                  value={formData.parameters}
                  onChange={(e) => setFormData({...formData, parameters: e.target.value})}
                  placeholder='{"n_estimators": 100, "max_depth": 10}'
                  rows={6}
                  style={{...styles.textarea, fontFamily: 'Monaco, monospace', fontSize: '13px'}}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>정확도 (0-1)</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={formData.accuracy}
                    onChange={(e) => setFormData({...formData, accuracy: e.target.value})}
                    placeholder="0.95"
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>F1 Score (0-1)</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={formData.f1Score}
                    onChange={(e) => setFormData({...formData, f1Score: e.target.value})}
                    placeholder="0.92"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <label style={styles.formLabel}>학습 데이터셋</label>
                <input
                  type="text"
                  value={formData.trainingDataset}
                  onChange={(e) => setFormData({...formData, trainingDataset: e.target.value})}
                  placeholder="dataset_v1.csv"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>⭐ 기본 설정으로 지정</span>
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
    fontFamily: '"SF Pro Display", -apple-system, sans-serif',
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
    fontWeight: '600',
    zIndex: 10000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
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
    background: 'rgba(255,255,255,0.95)',
    padding: '28px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  
  title: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0 0',
  },
  
  createButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s',
  },
  
  filters: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
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
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  
  modelTabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  
  modelTab: {
    padding: '10px 18px',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  
  modelTabActive: {
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  
  modelIcon: {
    fontSize: '16px',
  },
  
  loading: {
    textAlign: 'center',
    padding: '60px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    color: '#667eea',
  },
  
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(102, 126, 234, 0.2)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  
  tableContainer: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
  
  modelCell: {
    display: 'flex',
    alignItems: 'center',
  },
  
  modelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    color: 'white',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  
  configName: {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  
  defaultBadge: {
    padding: '2px 8px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: 'white',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
  
  description: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  
  version: {
    fontFamily: 'Monaco, monospace',
    fontSize: '13px',
    color: '#6b7280',
  },
  
  envBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  envProd: {
    background: '#dcfce7',
    color: '#166534',
  },
  
  envStaging: {
    background: '#fef3c7',
    color: '#92400e',
  },
  
  envDev: {
    background: '#e0e7ff',
    color: '#3730a3',
  },
  
  metricCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  
  metricBar: {
    flex: 1,
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  
  metricFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  
  metricValue: {
    fontFamily: 'Monaco, monospace',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
    minWidth: '60px',
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
    gap: '4px',
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
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '2px solid #f3f4f6',
  },
  
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '0',
    width: '32px',
    height: '32px',
  },
  
  form: {
    padding: '28px',
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
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
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
    paddingTop: '24px',
    borderTop: '2px solid #f3f4f6',
  },
  
  cancelButton: {
    padding: '12px 24px',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  
  submitButton: {
    padding: '12px 32px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.2s',
  },
};

export default ModelConfigs;
