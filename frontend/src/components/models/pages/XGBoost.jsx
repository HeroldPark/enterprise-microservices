import ModelPageTemplate from '../ModelPageTemplate'

const XGBoost = () => {
  return (
    <ModelPageTemplate
      title="XGBoost"
      subtitle="극한 그래디언트 부스팅"
      description="이전 오류를 학습하며 순차적 개선"
      application="복잡한 센서 간 상호작용 학습"
      strengths="최고 수준 정확도, 빠른 속도"
      weaknesses="하이퍼파라미터 튜닝 복잡"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          XGBoost 모델 페이지
        </h2>
        <p className="text-gray-700">
          XGBoost(Extreme Gradient Boosting)는 그래디언트 부스팅 알고리즘의 
          최적화된 구현으로, 높은 성능과 속도를 자랑합니다.
          화재 예측에서는 여러 센서 간의 복잡한 상호작용을 학습하여 
          높은 정확도로 화재를 예측할 수 있습니다.
        </p>
      </div>
    </ModelPageTemplate>
  )
}

export default XGBoost
