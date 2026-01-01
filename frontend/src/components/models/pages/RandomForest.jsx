import ModelPageTemplate from '../ModelPageTemplate'

const RandomForest = () => {
  return (
    <ModelPageTemplate
      title="Random Forest"
      subtitle="랜덤 포레스트"
      description="여러 결정트리의 투표/평균"
      application="센서 특징의 통계적 분석"
      strengths="특징 중요도 제공, 과적합 방지"
      weaknesses="시간적 순서 고려 못함"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Random Forest 모델 페이지
        </h2>
        <p className="text-gray-700">
          Random Forest는 여러 개의 결정 트리를 조합한 앙상블 학습 방법입니다.
          화재 예측에서는 온도, 습도, 연기 농도 등 다양한 센서 특징의 
          통계적 패턴을 분석하여 화재 위험도를 평가합니다.
        </p>
      </div>
    </ModelPageTemplate>
  )
}

export default RandomForest
