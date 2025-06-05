
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, Target, TrendingUp, AlertCircle, CheckCircle2, Clock, Shield, BarChart3, Settings, Eye, Users } from 'lucide-react';

interface ResultsPageProps {
  responses: {
    serviceType: string[];
    userConcerns: string[];
    businessImpact: string[];
    technicalRequirements: string[];
    monitoringCapability: string[];
  };
  onRestart: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ responses, onRestart }) => {
  
  // SLI 推薦邏輯
  const generateSLIRecommendations = () => {
    const recommendations = [];
    
    if (responses.userConcerns.includes('availability')) {
      recommendations.push({
        name: '可用性 (Availability)',
        description: '服務成功響應請求的比例',
        metric: 'HTTP 200 響應數 / 總請求數',
        target: '99.9%',
        priority: 'high',
        icon: Shield
      });
    }
    
    if (responses.userConcerns.includes('response_time')) {
      recommendations.push({
        name: '響應時間 (Latency)',
        description: '請求處理的響應時間',
        metric: '95th percentile 響應時間',
        target: '< 200ms',
        priority: 'high',
        icon: Clock
      });
    }
    
    if (responses.userConcerns.includes('data_accuracy')) {
      recommendations.push({
        name: '數據準確性 (Correctness)',
        description: '數據處理的正確性',
        metric: '數據驗證成功率',
        target: '99.99%',
        priority: 'medium',
        icon: BarChart3
      });
    }
    
    if (responses.userConcerns.includes('performance')) {
      recommendations.push({
        name: '吞吐量 (Throughput)',
        description: '單位時間內處理的請求數',
        metric: '每秒處理請求數 (RPS)',
        target: '> 1000 RPS',
        priority: 'medium',
        icon: TrendingUp
      });
    }

    // 根據服務類型添加特定 SLI
    if (responses.serviceType.includes('database')) {
      recommendations.push({
        name: '數據持久性 (Durability)',
        description: '數據不丟失的保證',
        metric: '數據備份成功率',
        target: '100%',
        priority: 'high',
        icon: Shield
      });
    }

    return recommendations;
  };

  // SLO 目標設定
  const generateSLOTargets = () => {
    const sliRecommendations = generateSLIRecommendations();
    const businessCriticality = responses.businessImpact.includes('revenue_loss') ? 'critical' : 
                               responses.businessImpact.includes('customer_churn') ? 'high' : 'medium';
    
    return sliRecommendations.map(sli => {
      let adjustedTarget = sli.target;
      
      // 根據業務重要性調整目標
      if (businessCriticality === 'critical') {
        if (sli.name.includes('可用性')) adjustedTarget = '99.95%';
        if (sli.name.includes('響應時間')) adjustedTarget = '< 150ms';
      }
      
      return {
        ...sli,
        sloTarget: adjustedTarget,
        errorBudget: sli.name.includes('可用性') ? '0.05%' : 'N/A',
        measurementWindow: '30天'
      };
    });
  };

  // SRE 實施建議
  const generateSRERecommendations = () => {
    const recommendations = [];
    
    // 基於監控能力的建議
    if (!responses.monitoringCapability.includes('apm_tools')) {
      recommendations.push({
        category: '監控工具',
        title: '部署 APM 工具',
        description: '建議使用 Prometheus + Grafana 或 Datadog 進行應用性能監控',
        priority: 'high',
        timeline: '2-4 週'
      });
    }
    
    if (!responses.monitoringCapability.includes('automated_ops')) {
      recommendations.push({
        category: '自動化',
        title: '建立自動化運維',
        description: '實施 CI/CD 流水線，自動化部署和回滾機制',
        priority: 'medium',
        timeline: '4-6 週'
      });
    }
    
    recommendations.push({
      category: '告警機制',
      title: '設置 SLO 告警',
      description: '基於錯誤預算消耗速度設置多級告警',
      priority: 'high',
      timeline: '1-2 週'
    });
    
    recommendations.push({
      category: '事故響應',
      title: '建立 Runbook',
      description: '為每個 SLI 指標建立詳細的故障處理手冊',
      priority: 'medium',
      timeline: '2-3 週'
    });

    return recommendations;
  };

  const sliRecommendations = generateSLIRecommendations();
  const sloTargets = generateSLOTargets();
  const sreRecommendations = generateSRERecommendations();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            您的 SLO 策略報告
          </h1>
          <p className="text-gray-600 mb-6">
            基於您的選擇，我們為您制定了個性化的 SLO 實施方案
          </p>
          <Button onClick={onRestart} variant="outline" className="mb-6">
            <RotateCcw className="w-4 h-4 mr-2" />
            重新評估
          </Button>
        </div>

        {/* 結果概覽 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">推薦 SLI 指標</h3>
              <p className="text-2xl font-bold text-blue-600">{sliRecommendations.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">SLO 目標</h3>
              <p className="text-2xl font-bold text-green-600">{sloTargets.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">實施建議</h3>
              <p className="text-2xl font-bold text-purple-600">{sreRecommendations.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* 詳細報告 */}
        <Tabs defaultValue="sli" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sli">SLI 指標建議</TabsTrigger>
            <TabsTrigger value="slo">SLO 目標設定</TabsTrigger>
            <TabsTrigger value="implementation">實施指南</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sli" className="space-y-6">
            <div className="grid gap-4">
              {sliRecommendations.map((sli, index) => {
                const IconComponent = sli.icon;
                return (
                  <Card key={index} className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          sli.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            sli.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {sli.name}
                            </h3>
                            <Badge variant={sli.priority === 'high' ? 'destructive' : 'secondary'}>
                              {sli.priority === 'high' ? '高優先級' : '中優先級'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{sli.description}</p>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">建議指標計算方式：</p>
                            <code className="text-sm text-blue-600">{sli.metric}</code>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="slo" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                SLO 目標設定需要根據您的實際業務需求和系統能力進行調整。建議從相對寬鬆的目標開始，逐步優化。
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              {sloTargets.map((slo, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {slo.name} SLO 設定
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">目標值</p>
                        <p className="text-xl font-bold text-green-600">{slo.sloTarget}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">錯誤預算</p>
                        <p className="text-xl font-bold text-orange-600">{slo.errorBudget}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">測量窗口</p>
                        <p className="text-xl font-bold text-blue-600">{slo.measurementWindow}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="implementation" className="space-y-6">
            <div className="grid gap-4">
              {sreRecommendations.map((rec, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        rec.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <CheckCircle2 className={`w-5 h-5 ${
                          rec.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {rec.title}
                          </h3>
                          <Badge variant="outline">{rec.category}</Badge>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority === 'high' ? '高優先級' : '中優先級'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          預估時間：{rec.timeline}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">後續步驟建議</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>優先實施高優先級的監控和告警設置</li>
                  <li>建立基準測量，收集 2-4 週的歷史數據</li>
                  <li>設定初始 SLO 目標，並開始錯誤預算追蹤</li>
                  <li>建立定期 SLO 回顧會議機制</li>
                  <li>根據實際運行情況調整 SLO 目標</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResultsPage;
