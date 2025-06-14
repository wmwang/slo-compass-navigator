import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, Building2, Shield, BarChart3 } from 'lucide-react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';
import QuestionnaireStep from './QuestionnaireStep';
import ResultsPage from './ResultsPage';

interface Responses {
  serviceType?: string[];
  userConcerns?: string[];
  businessImpact?: string[];
  technicalRequirements?: string[];
  monitoringCapability?: string[];
}

const SLONavigator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Responses>({});
  const [showResults, setShowResults] = useState(false);

  // SLO 開發週期階段定義
  const sloPhases = [
    {
      phase: 'Identify Stakeholders',
      description: '識別利害關係人',
      detail: '確定誰會使用和關心這些 SLO，了解不同角色的需求和期望'
    },
    {
      phase: 'Define Desired Outcomes', 
      description: '定義服務邊界/使用旅程旅程',
      detail: '深入了解用戶如何與服務互動，識別關鍵接觸點'
    },
    {
      phase: 'Analyze User Journey',
      description: '定義期望結果',
      detail: '明確服務應該提供什麼樣的用戶體驗和業務價值'
    },
    {
      phase: 'Define Meaningful SLIs + Achievable SLOs',
      description: '定義有意義的 SLI 和可達成的 SLO',
      detail: '根據業務影響程度設定合適的服務水準指標和目標'
    },
    {
      phase: 'System Dependencies Check',
      description: '系統依賴性檢查',
      detail: '評估技術環境和監控能力，確保 SLO 的可實施性'
    }
  ];

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetNavigator = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const convertAnswersToResponses = () => {
    return {
      serviceType: answers.serviceType || [],
      userConcerns: answers.userConcerns || [],
      businessImpact: answers.businessImpact || [],
      technicalRequirements: answers.technicalRequirements || [],
      monitoringCapability: answers.monitoringCapability || []
    };
  };

  const getStepId = (step: number): 'monitoringCapability' | 'serviceType' | 'userConcerns' | 'businessImpact' | 'technicalRequirements' => {
    const stepMap: Record<number, 'monitoringCapability' | 'serviceType' | 'userConcerns' | 'businessImpact' | 'technicalRequirements'> = {
      0: 'monitoringCapability',
      1: 'serviceType',
      2: 'userConcerns', 
      3: 'businessImpact',
      4: 'technicalRequirements'
    };
    return stepMap[step] || 'monitoringCapability';
  };

  const handleStepClick = (step: number) => {
    if (!showResults) {
      setCurrentStep(step);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen flex w-full">
        <AppSidebar currentStep={5} />
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">結果頁面</h1>
            </div>
            <ResultsPage responses={convertAnswersToResponses()} onRestart={resetNavigator} />
          </div>
        </SidebarInset>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar currentStep={currentStep} onStepClick={handleStepClick} />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-8">
            {/* Header with Sidebar Trigger */}
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white mr-4 shadow-lg">
                    <Target className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    SLO Dev Toolkit
                  </h1>
                </div>
                <p className="text-xl text-slate-700 max-w-3xl mx-auto font-medium">
                  SLO  開發工具包，幫助您輕鬆制定和管理服務水準目標
                </p>
                <p className="text-lg text-slate-600 mt-2">
                  透過互動式問卷，協助您確定關鍵 SLI 指標並制定有效的 SLO 策略
                </p>
                
                {/* Professional Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800 mb-2">SLODLC標準</h3>
                      <p className="text-sm text-slate-600">符合Google SLO白皮書建議流程</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-indigo-300">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800 mb-2">可靠性保證</h3>
                      <p className="text-sm text-slate-600">基於 SRE 最佳實踐的指標設計</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-purple-300">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800 mb-2">數據驅動</h3>
                      <p className="text-sm text-slate-600">數據分析用戶需求，生成精準指標</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* SLO Development Phase Indicator */}
            <div className="mb-8">
              <Card className="shadow-lg border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
                      階段 {currentStep + 1}/5
                    </Badge>
                    <h3 className="text-lg font-bold text-blue-900">
                      {sloPhases[currentStep].phase}
                    </h3>
                  </div>
                  <p className="text-blue-800 font-medium mb-2">
                    {sloPhases[currentStep].description}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {sloPhases[currentStep].detail}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">進度</span>
                <span className="text-sm text-slate-500">{currentStep + 1}/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <QuestionnaireStep 
              step={getStepId(currentStep)}
              responses={answers}
              currentPhase={sloPhases[currentStep]}
              onUpdate={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              canGoBack={currentStep > 0}
            />
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default SLONavigator;
