
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Target, TrendingUp, Users, Server, Clock, Shield } from 'lucide-react';
import QuestionnaireStep from './QuestionnaireStep';
import ResultsPage from './ResultsPage';

interface UserResponses {
  serviceType: string[];
  userConcerns: string[];
  businessImpact: string[];
  technicalRequirements: string[];
  monitoringCapability: string[];
}

const SLONavigator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<UserResponses>({
    serviceType: [],
    userConcerns: [],
    businessImpact: [],
    technicalRequirements: [],
    monitoringCapability: []
  });

  const steps = [
    {
      id: 'welcome',
      title: '歡迎使用 SLO Compass Navigator',
      description: '讓我們幫您找到最適合的 SLO 策略'
    },
    {
      id: 'serviceType',
      title: '服務類型識別',
      description: '您的服務屬於哪種類型？'
    },
    {
      id: 'userConcerns',
      title: '用戶關注點分析',
      description: '用戶最關心服務的哪些方面？'
    },
    {
      id: 'businessImpact',
      title: '業務影響評估',
      description: '服務中斷對業務的影響程度？'
    },
    {
      id: 'technicalRequirements',
      title: '技術需求確認',
      description: '您的技術環境和需求是什麼？'
    },
    {
      id: 'monitoringCapability',
      title: '監控能力評估',
      description: '目前的監控和運維能力如何？'
    },
    {
      id: 'results',
      title: 'SLO 建議報告',
      description: '基於您的選擇，我們為您制定了個性化的 SLO 策略'
    }
  ];

  const totalSteps = steps.length - 1; // 排除歡迎頁
  const progress = currentStep === 0 ? 0 : ((currentStep - 1) / (totalSteps - 2)) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateResponses = (stepKey: keyof UserResponses, values: string[]) => {
    setResponses(prev => ({
      ...prev,
      [stepKey]: values
    }));
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full shadow-2xl slide-in-up">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
              SLO Compass Navigator
            </CardTitle>
            <p className="text-xl text-gray-600 mb-6">
              Service Level Objective Development Lifecycle 互動式指南
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  了解用戶需求
                </h3>
                <p className="text-gray-600">
                  通過結構化問卷深入了解您的服務特性和用戶最關心的服務品質指標
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  智能推薦 SLI/SLO
                </h3>
                <p className="text-gray-600">
                  基於您的選擇，自動推薦最適合的 SLI 指標和 SLO 目標設定
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h4 className="font-semibold text-gray-800 mb-3">您將獲得：</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>個性化 SLI 指標建議</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>具體 SLO 目標設定</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>SRE 實施指南</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleNext} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              開始評估 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === steps.length - 1) {
    return <ResultsPage responses={responses} onRestart={() => setCurrentStep(0)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-sm">
              步驟 {currentStep} / {totalSteps - 1}
            </Badge>
            <div className="text-sm text-gray-600">
              {Math.round(progress)}% 完成
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600 mt-2">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Question Content */}
        <QuestionnaireStep
          step={steps[currentStep].id as keyof UserResponses}
          responses={responses}
          onUpdate={updateResponses}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentStep > 1}
        />
      </div>
    </div>
  );
};

export default SLONavigator;
