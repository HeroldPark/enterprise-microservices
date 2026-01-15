import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, Zap, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

import { messageService } from '../services/messageService'
import { useAuthStore } from '../../app/authStore'

const AutoMessageGenerator = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // State
  const [isRunning, setIsRunning] = useState(false)
  const [receiverId, setReceiverId] = useState('')
  const [intervalSeconds, setIntervalSeconds] = useState(10)  // ✅ interval → intervalSeconds로 변경!
  const [messageCount, setMessageCount] = useState(0)
  const [logs, setLogs] = useState([])

  // Refs
  const intervalRef = useRef(null)
  const countRef = useRef(0)
  const isStartingRef = useRef(false)

  // Mutation
  const sendMutation = useMutation({
    mutationFn: (payload) => messageService.sendMessage(payload),
    onSuccess: (data) => {
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        status: 'success',
        message: `메시지 #${countRef.current} 전송 성공 (ID: ${data.id})`,
      }
      setLogs((prev) => [logEntry, ...prev.slice(0, 9)])
      setMessageCount(countRef.current)
      
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: (error) => {
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
        message: `메시지 #${countRef.current} 전송 실패: ${error.message}`,
      }
      setLogs((prev) => [logEntry, ...prev.slice(0, 9)])
    },
  })

  // 메시지 생성 함수
  const generateMessage = () => {
    if (!user?.id || !receiverId) {
      console.error('❌ 사용자 또는 수신자 정보 없음')
      return
    }

    countRef.current += 1
    const messageContent = `자동 생성 메시지 #${countRef.current} - ${new Date().toLocaleString()}`

    console.log('📤 메시지 생성:', {
      count: countRef.current,
      senderId: user.id,
      receiverId: receiverId,
      timestamp: new Date().toISOString()
    })

    sendMutation.mutate({
      senderId: user.id,
      receiverId: Number(receiverId),
      content: messageContent,
    })
  }

  // 자동 실행 시작
  const handleStart = () => {
    console.log('🚀 handleStart 시작')
    
    if (!user?.id) {
      alert('로그인이 필요합니다')
      return
    }

    const rid = Number(receiverId)
    if (!rid || Number.isNaN(rid)) {
      alert('받는 사람 ID를 입력해주세요')
      return
    }

    if (intervalSeconds < 1 || intervalSeconds > 3600) {
      alert('간격은 1~3600초 사이로 설정해주세요')
      return
    }

    // 중복 실행 방지
    if (isRunning || intervalRef.current || isStartingRef.current) {
      console.warn('⚠️ 이미 실행 중입니다!')
      return
    }

    isStartingRef.current = true
    setIsRunning(true)
    countRef.current = 0
    setMessageCount(0)

    const startLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'info',
      message: `자동 생성 시작 (${intervalSeconds}초 간격)`,
    }
    setLogs([startLog])

    console.log(`⏰ ${intervalSeconds}초 간격으로 자동 생성 시작`)

    // 즉시 첫 메시지 전송
    console.log('📤 즉시 첫 메시지 전송')
    generateMessage()

    // ✅ 주기적 전송 시작 - window.setInterval 명시적 사용!
    console.log(`⏳ setInterval 등록: ${intervalSeconds}초 = ${intervalSeconds * 1000}ms`)
    
    const timerId = window.setInterval(() => {  // ✅ window.setInterval 명시!
      console.log(`⏰ setInterval 콜백 실행 (${new Date().toLocaleTimeString()})`)
      generateMessage()
    }, intervalSeconds * 1000)

    intervalRef.current = timerId
    console.log(`✅ setInterval ID: ${timerId}`)

    setTimeout(() => {
      isStartingRef.current = false
    }, 100)
  }

  // 중지
  const handleStop = () => {
    console.log('🛑 handleStop 시작')
    
    if (intervalRef.current) {
      console.log(`⏹️ clearInterval: ID ${intervalRef.current}`)
      window.clearInterval(intervalRef.current)  // ✅ window.clearInterval 명시!
      intervalRef.current = null
    }
    
    setIsRunning(false)
    isStartingRef.current = false

    const stopLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'info',
      message: `자동 생성 중지 (총 ${countRef.current}개 전송 시도)`,
    }
    setLogs((prev) => [stopLog, ...prev])
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Zap className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            자동 메시지 생성기
          </h1>
        </div>

        {/* 설명 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>📌 기능:</strong> 설정한 시간 간격마다 자동으로 메시지를 생성하여 Kafka로 전송합니다.
            <br />
            <strong>💡 용도:</strong> 대량 메시지 테스트, Kafka 이벤트 생성, 시스템 부하 테스트
          </p>
        </div>

        {/* 설정 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 받는 사람 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 ID
            </label>
            <input
              type="number"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              disabled={isRunning}
              placeholder="예: 2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              min={1}
            />
          </div>

          {/* 전송 간격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전송 간격 (초)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                disabled={isRunning}
                placeholder="10"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                min={1}
                max={3600}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">1 ~ 3600초 사이로 설정</p>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center gap-4 mb-6">
          {!isRunning ? (
            <motion.button
              onClick={handleStart}
              disabled={sendMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="h-5 w-5" />
              <span className="font-semibold">시작</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStop}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Square className="h-5 w-5" />
              <span className="font-semibold">중지</span>
            </motion.button>
          )}

          {/* 상태 표시 */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <>
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-green-700 font-medium">실행 중</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-gray-600 font-medium">대기 중</span>
              </>
            )}
          </div>

          {/* 전송 카운터 */}
          <div className="ml-auto bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
            <span className="text-sm text-gray-600">전송:</span>
            <span className="ml-2 text-lg font-bold text-purple-600">{messageCount}</span>
            <span className="text-sm text-gray-600">개</span>
          </div>
        </div>

        {/* 로그 영역 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📋 실행 로그</span>
            {logs.length > 0 && (
              <span className="text-sm text-gray-500">({logs.length})</span>
            )}
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">로그가 없습니다</p>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      log.status === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : log.status === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {log.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : log.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{log.timestamp}</p>
                      <p
                        className={`text-sm ${
                          log.status === 'success'
                            ? 'text-green-800'
                            : log.status === 'error'
                            ? 'text-red-800'
                            : 'text-blue-800'
                        }`}
                      >
                        {log.message}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 현재 설정 요약 */}
        {isRunning && (
          <motion.div
            className="mt-4 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-purple-900">
              <strong>현재 설정:</strong> 발신자 ID <strong>{user?.id}</strong> →
              수신자 ID <strong>{receiverId}</strong> | 간격: <strong>{intervalSeconds}초</strong>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default AutoMessageGenerator
