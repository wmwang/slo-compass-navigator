
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Globe, Smartphone, Database, Shield, Clock, Users, TrendingUp, DollarSign, AlertTriangle, Server, Eye, BarChart3, Settings } from 'lucide-react';

interface QuestionnaireStepProps {
  step: 'serviceType' | 'userConcerns' | 'businessImpact' | 'technicalRequirements' | 'monitoringCapability';
  responses: any;
  currentPhase: {
    phase: string;
    description: string;
    detail: string;
  };
  onUpdate: (stepKey: string, values: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

const questionData = {
  monitoringCapability: {
    title: '您的身分為何？（可多選）',
    subtitle: '了解不同角色對 SLO 的需求和關注點',
    options: [
      { id: 'end_user', label: 'End User', description: '終端使用者，使用產品或服務的人員', icon: Users },
      { id: 'pm', label: 'PM (Product Manager)', description: '產品經理，負責產品規劃和管理', icon: BarChart3 },
      { id: 'developer', label: 'Developer', description: '開發人員，負責軟體開發和程式撰寫', icon: Settings },
      { id: 'ops', label: 'Ops (Operations)', description: '維運人員，負責系統營運和維護', icon: Server },
      { id: 'sre', label: 'SRE (Site Reliability Engineer)', description: '站點可靠性工程師，專注於系統可靠性', icon: Shield }
    ]
  },
  serviceType: {
    title: '請選擇您的服務類型（可多選）',
    subtitle: '確定服務特性以制定相應的可靠性目標',
    options: [
      { id: 'web', label: '前端應用服務', description: '網站、Web API、前端應用', icon: Globe },
      { id: 'mobile', label: '移動應用服務', description: '手機 App、移動端 API', icon: Smartphone },
      { id: 'database', label: '數據庫服務', description: 'MySQL、MongoDB、Redis', icon: Database },
      { id: 'microservice', label: '微服務架構', description: '分布式服務、容器化應用', icon: Server },
      { id: 'api', label: 'API 服務', description: 'REST API、GraphQL、gRPC', icon: Settings },
      { id: 'infrastructure', label: '傳統桌機應用', description: 'WINAPI、linux、macOS', icon: Shield },
      { id: 'backend', label: '後端服務', description: '雲服務、CDN、負載均衡', icon: Shield }
    ]
  },
  userConcerns: {
    title: '用戶最關心服務的哪些方面？（可多選）',
    subtitle: '識別關鍵的用戶體驗指標和期望',
    options: [
      { id: 'availability', label: '可用性', description: '服務能正常訪問，不出現宕機', icon: Shield },
      { id: 'response_time', label: '回應速度', description: '請求處理速度，頁面加載時間', icon: Clock },
      { id: 'data_accuracy', label: '數據準確性', description: '數據的正確性和一致性', icon: BarChart3 },
      { id: 'user_experience', label: '用戶體驗', description: '界面流暢度，功能易用性', icon: Users },
      { id: 'security', label: '安全性', description: '數據安全，隱私保護', icon: Shield },
      { id: 'performance', label: '系統性能', description: '處理能力，併發支持', icon: TrendingUp }
    ]
  },
  businessImpact: {
    title: '服務中斷對業務的影響程度？（可多選）',
    subtitle: '評估不同故障情境的業務損失，制定合理的 SLO 目標',
    options: [
      { id: 'productivity_loss', label: '生產力下降', description: '產線工作效率受影響', icon: TrendingUp },
      { id: 'revenue_loss', label: '直接收入損失', description: '影響銷售、交易、付費用戶', icon: DollarSign },
      { id: 'customer_churn', label: '客戶流失', description: '用戶體驗差導致客戶離開', icon: Users },
      { id: 'reputation_damage', label: '品牌聲譽受損', description: '公司形象和市場信任度下降', icon: AlertTriangle },
      { id: 'operational_cost', label: '運營成本增加', description: '需要額外人力處理問題', icon: Settings },
      { id: 'compliance_risk', label: '法規風險', description: '法規要求、SLA 違約', icon: Shield }
    ]
  },
  technicalRequirements: {
    title: '額外技術環境或需求？（可多選）',
    subtitle: '確保 SLO 指標的監控和實施可行性',
    options: [
      { id: 'cloud_native', label: '雲原生環境', description: 'Kubernetes、Docker、微服務', icon: Server },
      { id: 'legacy_system', label: '傳統系統', description: '單體應用、物理服務器', icon: Database },
      { id: 'hybrid_cloud', label: '混合雲架構', description: '公有雲 + 私有雲', icon: Globe },
      { id: 'high_availability', label: '高可用性要求', description: '99.9%+ 可用性要求', icon: Shield },
      { id: 'scalability', label: '彈性擴展', description: '需要自動伸縮能力', icon: TrendingUp },
      { id: 'real_time', label: '實時性要求', description: '低延遲、實時數據處理', icon: Clock }
    ]
  }
};

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  step,
  responses,
  currentPhase,
  onUpdate,
  onNext,
  onBack,
  canGoBack
}) => {
  const currentData = questionData[step];
  const currentResponses = responses[step] || [];

  const toggleOption = (optionId: string) => {
    const newResponses = currentResponses.includes(optionId)
      ? currentResponses.filter((id: string) => id !== optionId)
      : [...currentResponses, optionId];
    
    onUpdate(step, newResponses);
  };

  const canProceed = currentResponses.length > 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-900">
              {currentData.title}
            </h2>
            <p className="text-blue-700 text-sm font-medium">
              {currentData.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {currentData.options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = currentResponses.includes(option.id);
              
              return (
                <Card 
                  key={option.id}
                  className={`cursor-pointer card-hover transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
                      : 'hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isSelected ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${
                            isSelected ? 'text-blue-900' : 'text-slate-800'
                          }`}>
                            {option.label}
                          </h3>
                          {isSelected && (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                              已選擇
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isSelected ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {currentResponses.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-emerald-800 mb-2">已選擇的選項：</h4>
              <div className="flex flex-wrap gap-2">
                {currentResponses.map((responseId: string) => {
                  const option = currentData.options.find(opt => opt.id === responseId);
                  return (
                    <Badge key={responseId} variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                      {option?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={!canGoBack}
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 shadow-md"
            >
              下一步
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireStep;
