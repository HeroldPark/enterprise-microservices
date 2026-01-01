// LSTM.jsx
import ModelPageTemplate from '../ModelPageTemplate'

const LSTM = () => {
  return (
    <ModelPageTemplate
      title="LSTM"
      subtitle="장단기 메모리"
      description="게이트 메커니즘으로 장기 기억 유지"
      application="30분~1시간 전 패턴 학습"
      strengths="복잡한 시계열 의존성 포착"
      weaknesses="학습 시간 길고 데이터 많이 필요"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          LSTM 모델 페이지
        </h2>
        <p className="text-gray-700">
          Long Short-Term Memory (LSTM) 네트워크는 순환 신경망(RNN)의 일종으로, 
          장기 의존성 문제를 해결하기 위해 설계되었습니다.
          화재 예측에서는 과거 30분~1시간의 센서 데이터 패턴을 학습하여 
          화재 발생 가능성을 예측합니다.
        </p>
      </div>
    </ModelPageTemplate>
  )
}

export default LSTM
