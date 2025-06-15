
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
