
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, Building2, Shield, BarChart3 } from 'lucide-react';
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
  // State for managing the current step, answers, and results display
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Responses>({});
  const [showResults, setShowResults] = useState(false);

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

  // Convert answers to the format expected by ResultsPage
  const convertAnswersToResponses = () => {
    return {
      serviceType: answers.serviceType || [],
      userConcerns: answers.userConcerns || [],
      businessImpact: answers.businessImpact || [],
      technicalRequirements: answers.technicalRequirements || [],
      monitoringCapability: answers.monitoringCapability || []
    };
  };

  // Map numeric step to question ID for QuestionnaireStep
  const getStepId = (step: number): 'serviceType' | 'userConcerns' | 'businessImpact' | 'technicalRequirements' | 'monitoringCapability' => {
    const stepMap: Record<number, 'serviceType' | 'userConcerns' | 'businessImpact' | 'technicalRequirements' | 'monitoringCapability'> = {
      0: 'serviceType',
      1: 'userConcerns', 
      2: 'businessImpact',
      3: 'technicalRequirements',
      4: 'monitoringCapability'
    };
    return stepMap[step] || 'serviceType';
  };

  if (showResults) {
    return <ResultsPage responses={convertAnswersToResponses()} onRestart={resetNavigator} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl bg-gray-700 text-white mr-4">
              <Target className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">SLO Navigator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            專業 SLO 開發生命週期指南工具
          </p>
          <p className="text-lg text-gray-500 mt-2">
            透過互動式問卷，協助您確定關鍵 SLI 指標並制定有效的 SLO 策略
          </p>
          
          {/* Professional Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="shadow-lg border-gray-200">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">企業級標準</h3>
                <p className="text-sm text-gray-600">符合業界最佳實踐的 SLO 框架</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-gray-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">可靠性保證</h3>
                <p className="text-sm text-gray-600">基於 SRE 最佳實踐的指標設計</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-gray-200">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">數據驅動</h3>
                <p className="text-sm text-gray-600">智能分析用戶需求，生成精準指標</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">進度</span>
            <span className="text-sm text-gray-500">{currentStep + 1}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <QuestionnaireStep 
          step={getStepId(currentStep)}
          responses={answers}
          onUpdate={handleAnswer}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentStep > 0}
        />
      </div>
    </div>
  );
};

export default SLONavigator;
