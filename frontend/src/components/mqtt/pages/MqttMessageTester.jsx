import { useState } from 'react'
import { Send, Zap, FileText, CheckCircle, XCircle, Radio, AlertCircle } from 'lucide-react'

const MqttMessageTester = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // 메시지 타입별 설정
  const messageTypes = [
    { 
      code: 0, 
      name: 'PERIODIC', 
      label: '주기적 데이터',
      topic: 'device/topic/A0',
      description: '센서 데이터 등 주기적으로 전송되는 데이터',
      color: 'blue'
    },
    { 
      code: 1, 
      name: 'DISCRETE', 
      label: '이벤트성 데이터',
      topic: 'device/topic/A0',
      description: '알람, 경고 등 비정기적 이벤트',
      color: 'yellow'
    },
    { 
      code: 2, 
      name: 'REQUEST', 
      label: '디바이스 등록 요청',
      topic: 'device/topic/B0',
      description: '단말기 등록 및 인증 요청',
      color: 'green'
    },
    { 
      code: 3, 
      name: 'RESPONSE', 
      label: '응답',
      topic: 'device/topic/B0',
      description: '요청에 대한 응답 메시지',
      color: 'purple'
    },
    { 
      code: 4, 
      name: 'TEST', 
      label: '테스트',
      topic: 'device/topic/A0',
      description: '테스트용 메시지',
      color: 'gray'
    },
    { 
      code: 5, 
      name: 'ECHO', 
      label: 'Echo 테스트',
      topic: 'device/topic/A0',
      description: 'Echo 응답 테스트',
      color: 'indigo'
    },
    { 
      code: 6, 
      name: 'FOTA', 
      label: '펌웨어 업데이트',
      topic: 'device/topic/A0',
      description: 'Firmware Over-The-Air 업데이트',
      color: 'orange'
    },
    { 
      code: 7, 
      name: 'REBOOT', 
      label: '재시작',
      topic: 'device/topic/A0',
      description: '디바이스 재시작 명령',
      color: 'red'
    },
    { 
      code: 8, 
      name: 'NTP', 
      label: '시간 동기화',
      topic: 'device/topic/A0',
      description: 'NTP 시간 동기화',
      color: 'teal'
    },
    { 
      code: 9, 
      name: 'PLAINTEXT', 
      label: '평문 텍스트',
      topic: 'device/topic/C0',
      description: '일반 텍스트 메시지',
      color: 'pink'
    }
  ]

  const [selectedType, setSelectedType] = useState(messageTypes[2]) // REQUEST 기본값
  const [deviceId, setDeviceId] = useState('EST-ROZ-253700001')
  const [customPayload, setCustomPayload] = useState('')

  // Base64 인코딩된 메시지 생성
  const generateBase64Message = (type, deviceId) => {
    // REQUEST 메시지 구조:
    // [0-3]: deviceID (4 bytes) - 0x00000000
    // [4]:   topicType (1 byte) - message type code
    // [5-21]: serialNo (17 bytes) - device serial number

    const deviceIdBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00])
    const topicTypeByte = new Uint8Array([type.code])
    
    // Serial Number를 17바이트로 맞춤
    const serialNo = deviceId.padEnd(17, '\0')
    const serialNoBytes = new TextEncoder().encode(serialNo)

    // 전체 바이트 배열 생성
    const totalLength = 4 + 1 + 17 // 22 bytes
    const byteArray = new Uint8Array(totalLength)
    
    byteArray.set(deviceIdBytes, 0)
    byteArray.set(topicTypeByte, 4)
    byteArray.set(serialNoBytes.slice(0, 17), 5)

    // Base64 인코딩
    const base64 = btoa(String.fromCharCode(...byteArray))
    return base64
  }

  // PLAINTEXT 메시지 생성
  const generatePlainTextMessage = (text) => {
    return text || 'Hello MQTT Test Message'
  }

  // MQTT 메시지 전송 테스트
  const sendMqttMessage = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let payload
      let topic = selectedType.topic

      if (selectedType.name === 'PLAINTEXT') {
        // PLAINTEXT는 인코딩 없이 그대로 전송
        payload = customPayload || generatePlainTextMessage()
      } else {
        // 다른 타입은 Base64 인코딩
        payload = generateBase64Message(selectedType, deviceId)
      }

      console.log('📤 Sending MQTT message:', {
        type: selectedType.name,
        topic,
        payload,
        deviceId: selectedType.name === 'PLAINTEXT' ? null : deviceId
      })

      // API 호출 (실제 구현 필요)
      const response = await fetch('/api/mqtt/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          payload,
          qos: 0
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setResult({
        success: true,
        messageType: selectedType.name,
        topic,
        payload,
        deviceId: selectedType.name === 'PLAINTEXT' ? null : deviceId,
        timestamp: new Date().toISOString(),
        ...data
      })

    } catch (err) {
      console.error('❌ Error sending MQTT message:', err)
      setError(err.message || '메시지 전송 실패')
    } finally {
      setLoading(false)
    }
  }

  // 색상 매핑
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    gray: 'bg-gray-500 hover:bg-gray-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red: 'bg-red-500 hover:bg-red-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    pink: 'bg-pink-500 hover:bg-pink-600'
  }

  const borderColorClasses = {
    blue: 'border-blue-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    indigo: 'border-indigo-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    teal: 'border-teal-500',
    pink: 'border-pink-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">MQTT 메시지 테스터</h1>
          </div>
          <p className="text-gray-600">
            IoT 디바이스 메시지를 시뮬레이션하고 MQTT 브로커로 전송 테스트
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 메시지 타입 선택 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              메시지 타입 선택
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {messageTypes.map((type) => (
                <button
                  key={type.code}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedType.code === type.code
                      ? `${borderColorClasses[type.color]} bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-mono text-white ${colorClasses[type.color]}`}>
                      {type.code}
                    </span>
                    <span className="font-semibold text-gray-800">{type.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                  <p className="text-xs text-blue-600 mt-2 font-mono">{type.topic}</p>
                </button>
              ))}
            </div>

            {/* Device ID 입력 (PLAINTEXT 제외) */}
            {selectedType.name !== 'PLAINTEXT' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Serial Number
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="EST-ROZ-253700001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  maxLength={17}
                />
                <p className="text-xs text-gray-500 mt-1">
                  최대 17자 (나머지는 0으로 패딩됨)
                </p>
              </div>
            )}

            {/* Custom Payload (PLAINTEXT용) */}
            {selectedType.name === 'PLAINTEXT' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  텍스트 메시지
                </label>
                <textarea
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder="Hello MQTT Test Message"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>
            )}

            {/* 전송 버튼 */}
            <button
              onClick={sendMqttMessage}
              disabled={loading}
              className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : `${colorClasses[selectedType.color]}`
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  전송 중...
                </>
              ) : (
                <>
                  <Send size={20} />
                  MQTT 메시지 전송
                </>
              )}
            </button>
          </div>

          {/* 오른쪽: 결과 표시 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              전송 결과
            </h2>

            {/* 에러 표시 */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-500" size={20} />
                  <p className="text-red-700 font-semibold">전송 실패</p>
                </div>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            )}

            {/* 성공 결과 */}
            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <p className="text-green-700 font-semibold">전송 성공</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Message Type</p>
                    <p className="font-mono text-gray-800">{result.messageType}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">MQTT Topic</p>
                    <p className="font-mono text-blue-600 text-sm">{result.topic}</p>
                  </div>

                  {result.deviceId && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Device ID</p>
                      <p className="font-mono text-gray-800">{result.deviceId}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Payload</p>
                    <p className="font-mono text-xs text-gray-600 break-all">
                      {result.payload}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                    <p className="text-sm text-gray-800">
                      {new Date(result.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 초기 상태 */}
            {!result && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-center">
                  메시지 타입을 선택하고<br />
                  전송 버튼을 클릭하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">📌 사용 방법</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 메시지 타입을 선택합니다 (PERIODIC, REQUEST, PLAINTEXT 등)</li>
            <li>• PLAINTEXT가 아닌 경우 Device Serial Number를 입력합니다</li>
            <li>• PLAINTEXT의 경우 전송할 텍스트 메시지를 입력합니다</li>
            <li>• "MQTT 메시지 전송" 버튼을 클릭합니다</li>
            <li>• 오른쪽에서 전송 결과를 확인합니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MqttMessageTester
