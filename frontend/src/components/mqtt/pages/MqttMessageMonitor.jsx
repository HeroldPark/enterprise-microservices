import { useState, useEffect } from 'react'
import { Activity, RefreshCw, Filter, Download, Trash2, Eye, Radio } from 'lucide-react'

const MqttMessageMonitor = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('ALL')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const messageTypes = [
    'ALL', 'PERIODIC', 'DISCRETE', 'REQUEST', 'RESPONSE', 
    'TEST', 'ECHO', 'FOTA', 'REBOOT', 'NTP', 'PLAINTEXT'
  ]

  // 메시지 타입별 색상
  const typeColors = {
    PERIODIC: 'bg-blue-100 text-blue-800',
    DISCRETE: 'bg-yellow-100 text-yellow-800',
    REQUEST: 'bg-green-100 text-green-800',
    RESPONSE: 'bg-purple-100 text-purple-800',
    TEST: 'bg-gray-100 text-gray-800',
    ECHO: 'bg-indigo-100 text-indigo-800',
    FOTA: 'bg-orange-100 text-orange-800',
    REBOOT: 'bg-red-100 text-red-800',
    NTP: 'bg-teal-100 text-teal-800',
    PLAINTEXT: 'bg-pink-100 text-pink-800'
  }

  // 메시지 로드
  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mqtt/messages')
      if (!response.ok) throw new Error('메시지 로드 실패')
      
      const data = await response.json()
      setMessages(data)
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    loadMessages()
  }, [])

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // 필터링된 메시지
  const filteredMessages = filterType === 'ALL' 
    ? messages 
    : messages.filter(msg => msg.messageType === filterType)

  // 메시지 상세 보기
  const viewMessageDetail = (message) => {
    alert(JSON.stringify(message, null, 2))
  }

  // 전체 삭제
  const clearAllMessages = () => {
    if (window.confirm('모든 메시지를 삭제하시겠습니까?')) {
      setMessages([])
    }
  }

  // CSV 다운로드
  const downloadCSV = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Topic', 'Device ID', 'Payload'].join(','),
      ...filteredMessages.map(msg => [
        new Date(msg.timestamp).toISOString(),
        msg.messageType,
        msg.topic,
        msg.deviceId || '-',
        msg.payload.substring(0, 50) + '...'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mqtt-messages-${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="text-green-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MQTT 메시지 모니터</h1>
                <p className="text-gray-600">실시간 MQTT 메시지 수신 모니터링</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 자동 새로고침 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  자동 새로고침 (5초)
                </span>
              </label>

              {/* 수동 새로고침 */}
              <button
                onClick={loadMessages}
                disabled={loading}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                title="새로고침"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* 필터 및 액션 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 타입 필터 */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {messageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                {filteredMessages.length}개 메시지
              </span>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={downloadCSV}
                disabled={filteredMessages.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                <Download size={16} />
                CSV 다운로드
              </button>
              <button
                onClick={clearAllMessages}
                disabled={messages.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                <Trash2 size={16} />
                전체 삭제
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 리스트 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">메시지 로딩 중...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Activity size={48} className="mb-4" />
              <p>수신된 메시지가 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      토픽
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payload
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map((message, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(message.timestamp).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[message.messageType] || 'bg-gray-100 text-gray-800'}`}>
                          {message.messageType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                        {message.topic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                        {message.deviceId || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 max-w-md truncate">
                        {message.payload.substring(0, 50)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewMessageDetail(message)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="상세 보기"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {messageTypes.filter(t => t !== 'ALL').map(type => {
            const count = messages.filter(m => m.messageType === type).length
            return (
              <div key={type} className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-500 mb-1">{type}</p>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MqttMessageMonitor
