import jsPDF from 'jspdf';

export const generateMarkdown = (responses: any, sliRecommendations: any[], sloTargets: any[], sreRecommendations: any[]) => {
  const serviceName = responses.serviceType?.[0] || 'service';
  
  let markdown = `# SLO 策略報告

## 服務概覽
- **服務類型**: ${responses.serviceType?.join(', ') || 'N/A'}
- **用戶關注點**: ${responses.userConcerns?.join(', ') || 'N/A'}
- **業務影響**: ${responses.businessImpact?.join(', ') || 'N/A'}
- **技術需求**: ${responses.technicalRequirements?.join(', ') || 'N/A'}
- **監控能力**: ${responses.monitoringCapability?.join(', ') || 'N/A'}

## SLI 指標建議

`;

  sliRecommendations.forEach((sli, index) => {
    markdown += `### ${index + 1}. ${sli.name}

**描述**: ${sli.description}
**指標計算方式**: \`${sli.metric}\`
**建議目標**: ${sli.target}
**優先級**: ${sli.priority === 'high' ? '高' : '中'}

`;
  });

  markdown += `## SLO 目標設定

`;

  sloTargets.forEach((slo, index) => {
    markdown += `### ${index + 1}. ${slo.name}

- **目標值**: ${slo.sloTarget}
- **錯誤預算**: ${slo.errorBudget}
- **測量窗口**: ${slo.measurementWindow}

`;
  });

  markdown += `## 實施建議

`;

  sreRecommendations.forEach((rec, index) => {
    markdown += `### ${index + 1}. ${rec.title}

**類別**: ${rec.category}
**描述**: ${rec.description}
**優先級**: ${rec.priority === 'high' ? '高' : '中'}
**預估時間**: ${rec.timeline}

`;
  });

  // 添加 Prometheus 配置部分
  markdown += `## Prometheus 配置

### OpenSLO 格式配置

\`\`\`yaml
${generateOpenSLOYaml(sloTargets, responses)}
\`\`\`

### Sloth 格式配置

\`\`\`yaml
${generateSlothYaml(sloTargets, responses)}
\`\`\`

### 部署說明

#### OpenSLO 部署步驟：
1. 確保已安裝 OpenSLO Operator
2. 將 YAML 配置保存為 slo-config.yaml
3. 執行：\`kubectl apply -f slo-config.yaml\`
4. 檢查 SLO 狀態：\`kubectl get slo\`

#### Sloth 部署步驟：
1. 安裝 Sloth：\`go install github.com/slok/sloth/cmd/sloth@latest\`
2. 將配置保存為 slo-config.yaml
3. 生成 Prometheus 規則：\`sloth generate -i slo-config.yaml -o prometheus-rules.yaml\`
4. 將生成的規則加載到 Prometheus

`;

  markdown += `## 後續步驟

1. 優先實施高優先級的監控和告警設置
2. 建立基準測量，收集 2-4 週的歷史數據
3. 設定初始 SLO 目標，並開始錯誤預算追蹤
4. 建立定期 SLO 回顧會議機制
5. 根據實際運行情況調整 SLO 目標

---
*報告生成時間: ${new Date().toLocaleString('zh-TW')}*
`;

  return markdown;
};

// 生成 OpenSLO YAML 配置的輔助函數
const generateOpenSLOYaml = (sloTargets: any[], responses: any) => {
  const serviceName = responses.serviceType?.[0] || 'service';
  
  return sloTargets.map((slo, index) => {
    const sloName = slo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
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
      description: "The error budget for ${slo.name} is being consumed too quickly"`;
  }).join('\n---\n');
};

// 生成 Sloth YAML 配置的輔助函數
const generateSlothYaml = (sloTargets: any[], responses: any) => {
  const serviceName = responses.serviceType?.[0] || 'service';
  
  return `version: "prometheus/v1"
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

export const generatePDF = (responses: any, sliRecommendations: any[], sloTargets: any[], sreRecommendations: any[]) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  
  // 設置中文字體（使用內建字體）
  doc.setFont('helvetica');
  
  // 標題
  doc.setFontSize(20);
  doc.text('SLO 策略報告', 20, yPosition);
  yPosition += lineHeight * 2;
  
  // 服務概覽
  doc.setFontSize(16);
  doc.text('服務概覽', 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(12);
  const serviceOverview = [
    `服務類型: ${responses.serviceType?.join(', ') || 'N/A'}`,
    `用戶關注點: ${responses.userConcerns?.join(', ') || 'N/A'}`,
    `業務影響: ${responses.businessImpact?.join(', ') || 'N/A'}`,
    `技術需求: ${responses.technicalRequirements?.join(', ') || 'N/A'}`,
    `監控能力: ${responses.monitoringCapability?.join(', ') || 'N/A'}`
  ];
  
  serviceOverview.forEach(text => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(text, 20, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight;
  
  // SLI 指標建議
  doc.setFontSize(16);
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  doc.text('SLI 指標建議', 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(12);
  sliRecommendations.forEach((sli, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${sli.name}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(12);
    doc.text(`描述: ${sli.description}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`指標: ${sli.metric}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`目標: ${sli.target}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`優先級: ${sli.priority === 'high' ? '高' : '中'}`, 20, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  // SLO 目標設定
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.text('SLO 目標設定', 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(12);
  sloTargets.forEach((slo, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${slo.name}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(12);
    doc.text(`目標值: ${slo.sloTarget}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`錯誤預算: ${slo.errorBudget}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`測量窗口: ${slo.measurementWindow}`, 20, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  return doc;
};

export const downloadMarkdown = (content: string, filename: string = 'slo-report.md') => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadPDF = (doc: jsPDF, filename: string = 'slo-report.pdf') => {
  doc.save(filename);
};
