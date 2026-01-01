import ModelPageTemplate from '../ModelPageTemplate'

const GRU = () => {
  return (
    <ModelPageTemplate
      title="GRU"
      subtitle="게이트 순환 유닛"
      description="LSTM 간소화 버전 (2개 게이트)"
      application="5~15분 단기 급변 감지"
      strengths="LSTM보다 빠르고 효율적"
      weaknesses="매우 긴 시퀀스에서 성능 저하"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          GRU 모델 페이지
        </h2>
        <p className="text-gray-700">
          Gated Recurrent Unit (GRU)은 LSTM을 간소화한 버전으로, 
          2개의 게이트(리셋 게이트, 업데이트 게이트)만을 사용합니다.
          화재 예측에서는 5~15분의 단기 급변을 빠르게 감지하는 데 효과적입니다.
        </p>
      </div>
    </ModelPageTemplate>
  )
}

export default GRU
