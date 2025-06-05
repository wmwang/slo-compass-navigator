import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, Target, TrendingUp, AlertCircle, CheckCircle2, Clock, Shield, BarChart3, Settings, Eye, Users, Copy, Download, Code } from 'lucide-react';

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
  const [yamlFormat, setYamlFormat] = useState<'openslo' | 'sloth'>('openslo');
  
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

  // 生成 OpenSLO YAML 配置
  const generateOpenSLOYaml = () => {
    const sloTargets = generateSLOTargets();
    
    const yamlContent = sloTargets.map((slo, index) => {
      const sloName = slo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const serviceName = responses.serviceType[0] || 'service';
      
      return `apiVersion: openslo/v1
kind: SLO
metadata:
  name: ${sloName}-slo
  displayName: ${slo.name}
spec:
  description: "${slo.description}"
  service: ${serviceName}
  indicator:
    metadata:
      name: ${sloName}-sli
      displayName: ${slo.name} SLI
    spec:
      ratioMetric:
        counter: true
        good:
          source: prometheus
          queryType: promql
          query: |
            ${getSLIQuery(slo)}
        total:
          source: prometheus
          queryType: promql
          query: |
            ${getTotalQuery(slo)}
  objectives:
    - displayName: ${slo.measurementWindow} Target
      target: ${parseFloat(slo.sloTarget.replace('%', '')) / 100}
      timeWindow:
        - duration: ${slo.measurementWindow === '30天' ? '30d' : '7d'}
          isRolling: true
  alerting:
    name: ${sloName}-alert
    annotations:
      summary: "SLO ${slo.name} is at risk"
      description: "The error budget for ${slo.name} is being consumed too quickly"
---`;
    }).join('\n');

    return yamlContent;
  };

  // 生成 Sloth YAML 配置
  const generateSlothYaml = () => {
    const sloTargets = generateSLOTargets();
    const serviceName = responses.serviceType[0] || 'service';
    
    const yamlContent = `version: "prometheus/v1"
service: "${serviceName}"
labels:
  team: "sre"
  environment: "production"
slos:
${sloTargets.map((slo, index) => {
  const sloName = slo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const objective = parseFloat(slo.sloTarget.replace('%', '')) / 100;
  
  return `  - name: "${sloName}"
    description: "${slo.description}"
    objective: ${objective}
    labels:
      category: "${slo.priority}"
    sli:
      events:
        error_query: |
          ${getErrorQuery(slo)}
        total_query: |
          ${getTotalQuery(slo)}
    alerting:
      name: "${sloName}"
      labels:
        severity: "warning"
      annotations:
        summary: "SLO ${slo.name} burn rate is too high"
        runbook: "https://runbook.example.com/${sloName}"
      page_alert:
        labels:
          severity: "critical"
        annotations:
          summary: "SLO ${slo.name} burn rate is critical"`;
}).join('\n')}`;

    return yamlContent;
  };

  // 根據 SLO 類型生成對應的 Prometheus 查詢
  const getSLIQuery = (slo: any) => {
    if (slo.name.includes('可用性')) {
      return 'sum(rate(http_requests_total{code!~"5.."}[5m]))';
    } else if (slo.name.includes('響應時間')) {
      return 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))';
    } else if (slo.name.includes('數據準確性')) {
      return 'sum(rate(data_validation_success_total[5m]))';
    } else if (slo.name.includes('吞吐量')) {
      return 'sum(rate(http_requests_total[5m]))';
    } else {
      return 'sum(rate(service_requests_success_total[5m]))';
    }
  };

  const getTotalQuery = (slo: any) => {
    if (slo.name.includes('響應時間')) {
      return 'sum(rate(http_request_duration_seconds_count[5m]))';
    } else {
      return 'sum(rate(http_requests_total[5m]))';
    }
  };

  const getErrorQuery = (slo: any) => {
    if (slo.name.includes('可用性')) {
      return 'sum(rate(http_requests_total{code=~"5.."}[5m]))';
    } else if (slo.name.includes('響應時間')) {
      return 'sum(rate(http_request_duration_seconds_bucket{le="0.2"}[5m])) / sum(rate(http_request_duration_seconds_count[5m])) < 0.95';
    } else {
      return 'sum(rate(service_requests_error_total[5m]))';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 可以添加 toast 通知
  };

  const downloadYaml = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sli">SLI 指標建議</TabsTrigger>
            <TabsTrigger value="slo">SLO 目標設定</TabsTrigger>
            <TabsTrigger value="implementation">實施指南</TabsTrigger>
            <TabsTrigger value="yaml">Prometheus 配置</TabsTrigger>
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
          
          <TabsContent value="yaml" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Prometheus YAML 配置
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={yamlFormat === 'openslo' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setYamlFormat('openslo')}
                    >
                      OpenSLO
                    </Badge>
                    <Badge 
                      variant={yamlFormat === 'sloth' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setYamlFormat('sloth')}
                    >
                      Sloth
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    以下配置基於您的選擇自動生成。請根據實際的 Prometheus 指標名稱和標籤進行調整。
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(yamlFormat === 'openslo' ? generateOpenSLOYaml() : generateSlothYaml())}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      複製 YAML
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadYaml(
                        yamlFormat === 'openslo' ? generateOpenSLOYaml() : generateSlothYaml(),
                        `slo-config-${yamlFormat}.yaml`
                      )}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      下載 YAML
                    </Button>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                      {yamlFormat === 'openslo' ? generateOpenSLOYaml() : generateSlothYaml()}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-800">部署說明：</h4>
                  
                  {yamlFormat === 'openslo' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">OpenSLO 部署步驟：</h5>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                        <li>確保已安裝 OpenSLO Operator</li>
                        <li>將 YAML 配置保存為 slo-config.yaml</li>
                        <li>執行：kubectl apply -f slo-config.yaml</li>
                        <li>檢查 SLO 狀態：kubectl get slo</li>
                      </ol>
                    </div>
                  )}

                  {yamlFormat === 'sloth' && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-green-800 mb-2">Sloth 部署步驟：</h5>
                      <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                        <li>安裝 Sloth：go install github.com/slok/sloth/cmd/sloth@latest</li>
                        <li>將配置保存為 slo-config.yaml</li>
                        <li>生成 Prometheus 規則：sloth generate -i slo-config.yaml -o prometheus-rules.yaml</li>
                        <li>將生成的規則加載到 Prometheus</li>
                      </ol>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResultsPage;
