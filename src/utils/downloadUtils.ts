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

// 輔助函數：自動換行處理
const splitText = (text: string, maxWidth: number, doc: jsPDF): string[] => {
  const lines = [];
  const words = text.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = doc.getTextWidth(testLine);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// 檢查是否需要新頁面
const checkNewPage = (doc: jsPDF, yPosition: number, neededHeight: number = 30): number => {
  const pageHeight = doc.internal.pageSize.height;
  if (yPosition + neededHeight > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return yPosition;
};

export const generatePDF = (responses: any, sliRecommendations: any[], sloTargets: any[], sreRecommendations: any[]) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 8;
  const maxWidth = 170; // 最大文字寬度
  
  // 設置字體
  doc.setFont('helvetica');
  
  // 標題
  doc.setFontSize(20);
  doc.text('SLO Strategy Report', 20, yPosition);
  yPosition += lineHeight * 2;
  
  // 服務概覽
  yPosition = checkNewPage(doc, yPosition, 50);
  doc.setFontSize(16);
  doc.text('Service Overview', 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(12);
  const serviceOverview = [
    `Service Type: ${responses.serviceType?.join(', ') || 'N/A'}`,
    `User Concerns: ${responses.userConcerns?.join(', ') || 'N/A'}`,
    `Business Impact: ${responses.businessImpact?.join(', ') || 'N/A'}`,
    `Technical Requirements: ${responses.technicalRequirements?.join(', ') || 'N/A'}`,
    `Monitoring Capability: ${responses.monitoringCapability?.join(', ') || 'N/A'}`
  ];
  
  serviceOverview.forEach(text => {
    const lines = splitText(text, maxWidth, doc);
    lines.forEach(line => {
      yPosition = checkNewPage(doc, yPosition);
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
  });
  
  yPosition += lineHeight;
  
  // SLI 指標建議
  yPosition = checkNewPage(doc, yPosition, 40);
  doc.setFontSize(16);
  doc.text('SLI Recommendations', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  sliRecommendations.forEach((sli, index) => {
    yPosition = checkNewPage(doc, yPosition, 60);
    
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${sli.name}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(12);
    
    // 描述
    const descLines = splitText(`Description: ${sli.description}`, maxWidth, doc);
    descLines.forEach(line => {
      yPosition = checkNewPage(doc, yPosition);
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    
    // 指標
    const metricLines = splitText(`Metric: ${sli.metric}`, maxWidth, doc);
    metricLines.forEach(line => {
      yPosition = checkNewPage(doc, yPosition);
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    
    // 目標和優先級
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Target: ${sli.target}`, 20, yPosition);
    yPosition += lineHeight;
    
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Priority: ${sli.priority === 'high' ? 'High' : 'Medium'}`, 20, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  // SLO 目標設定
  yPosition = checkNewPage(doc, yPosition, 40);
  doc.setFontSize(16);
  doc.text('SLO Targets', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  sloTargets.forEach((slo, index) => {
    yPosition = checkNewPage(doc, yPosition, 50);
    
    doc.setFontSize(14);
    const titleLines = splitText(`${index + 1}. ${slo.name}`, maxWidth, doc);
    titleLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    
    doc.setFontSize(12);
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Target: ${slo.sloTarget}`, 20, yPosition);
    yPosition += lineHeight;
    
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Error Budget: ${slo.errorBudget}`, 20, yPosition);
    yPosition += lineHeight;
    
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Measurement Window: ${slo.measurementWindow}`, 20, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  // 實施建議
  yPosition = checkNewPage(doc, yPosition, 40);
  doc.setFontSize(16);
  doc.text('Implementation Recommendations', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  sreRecommendations.forEach((rec, index) => {
    yPosition = checkNewPage(doc, yPosition, 60);
    
    doc.setFontSize(14);
    const titleLines = splitText(`${index + 1}. ${rec.title}`, maxWidth, doc);
    titleLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    
    doc.setFontSize(12);
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Category: ${rec.category}`, 20, yPosition);
    yPosition += lineHeight;
    
    const descLines = splitText(`Description: ${rec.description}`, maxWidth, doc);
    descLines.forEach(line => {
      yPosition = checkNewPage(doc, yPosition);
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Priority: ${rec.priority === 'high' ? 'High' : 'Medium'}`, 20, yPosition);
    yPosition += lineHeight;
    
    yPosition = checkNewPage(doc, yPosition);
    doc.text(`Timeline: ${rec.timeline}`, 20, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  // Prometheus 配置
  yPosition = checkNewPage(doc, yPosition, 40);
  doc.setFontSize(16);
  doc.text('Prometheus Configuration', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  doc.setFontSize(12);
  yPosition = checkNewPage(doc, yPosition);
  doc.text('OpenSLO and Sloth configurations are available in the', 20, yPosition);
  yPosition += lineHeight;
  doc.text('YAML export section of the web interface.', 20, yPosition);
  yPosition += lineHeight * 2;
  
  // 後續步驟
  yPosition = checkNewPage(doc, yPosition, 60);
  doc.setFontSize(16);
  doc.text('Next Steps', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  doc.setFontSize(12);
  const nextSteps = [
    '1. Implement high-priority monitoring and alerting',
    '2. Establish baseline measurements (2-4 weeks)',
    '3. Set initial SLO targets and error budget tracking',
    '4. Create regular SLO review meetings',
    '5. Adjust SLO targets based on actual performance'
  ];
  
  nextSteps.forEach(step => {
    yPosition = checkNewPage(doc, yPosition);
    doc.text(step, 20, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight;
  yPosition = checkNewPage(doc, yPosition);
  doc.text(`Report generated: ${new Date().toLocaleString()}`, 20, yPosition);
  
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
