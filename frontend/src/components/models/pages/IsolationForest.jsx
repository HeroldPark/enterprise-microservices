import ModelPageTemplate from '../ModelPageTemplate'
import { motion } from 'framer-motion'

const IsolationForest = () => {
  return (
    <ModelPageTemplate
      title="Isolation Forest"
      subtitle="격리 숲"
      description="이상치는 정상보다 쉽게 격리된다"
      application="비정상적인 센서 조합 즉시 감지"
      strengths="실시간 이상 탐지, 빠른 속도"
      weaknesses="시계열 패턴 무시"
    >
      <motion.div
        className="bg-white rounded-lg shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          상세 설명
        </h2>
        
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            알고리즘 개요
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Isolation Forest는 이상치 탐지에 특화된 머신러닝 알고리즘입니다. 
            정상 데이터는 많은 분할이 필요하지만, 이상치는 적은 분할로도 쉽게 격리될 수 있다는 
            아이디어에 기반합니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            동작 원리
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>랜덤하게 특성을 선택하고 분할 값을 정합니다</li>
            <li>선택된 특성과 값으로 데이터를 재귀적으로 분할합니다</li>
            <li>트리가 완성될 때까지 또는 최대 깊이에 도달할 때까지 반복합니다</li>
            <li>여러 트리를 생성하여 앙상블을 구성합니다</li>
            <li>각 데이터 포인트의 평균 경로 길이를 계산합니다</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            화재 예측 적용
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            온도, 습도, 연기 농도 등 다양한 센서 데이터에서 정상 범위를 벗어난 
            비정상적인 조합을 실시간으로 감지할 수 있습니다. 예를 들어, 
            온도가 급격히 상승하면서 동시에 습도가 급격히 감소하는 패턴을 
            즉시 탐지할 수 있습니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            사용 시 고려사항
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>시계열 데이터의 시간적 의존성을 고려하지 않음</li>
            <li>트리의 개수와 샘플 크기 조정이 중요</li>
            <li>contamination 파라미터로 이상치 비율 설정 필요</li>
            <li>실시간 처리에 적합하지만 과거 패턴 학습에는 제한적</li>
          </ul>
        </div>
      </motion.div>
    </ModelPageTemplate>
  )
}

export default IsolationForest
