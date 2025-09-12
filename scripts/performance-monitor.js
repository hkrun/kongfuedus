// 性能监控脚本 - 用于分析支付流程耗时
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      sessionLoad: [],
      apiCall: [],
      stripeInit: [],
      totalLoad: []
    };
  }

  // 记录会话加载时间
  recordSessionLoad(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.sessionLoad.push(duration);
    console.log(`会话加载耗时: ${duration}ms`);
  }

  // 记录API调用时间
  recordApiCall(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.apiCall.push(duration);
    console.log(`API调用耗时: ${duration}ms`);
  }

  // 记录Stripe初始化时间
  recordStripeInit(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.stripeInit.push(duration);
    console.log(`Stripe初始化耗时: ${duration}ms`);
  }

  // 记录总加载时间
  recordTotalLoad(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.totalLoad.push(duration);
    console.log(`总加载耗时: ${duration}ms`);
  }

  // 生成性能报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      details: this.metrics
    };

    // 计算平均值
    Object.keys(this.metrics).forEach(key => {
      const values = this.metrics[key];
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        report.summary[key] = {
          average: Math.round(avg),
          min: Math.round(min),
          max: Math.round(max),
          count: values.length
        };
      }
    });

    return report;
  }

  // 保存报告到文件
  saveReport(report) {
    const reportPath = path.join(__dirname, '../performance-reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const filename = `performance-report-${Date.now()}.json`;
    const filepath = path.join(reportPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`性能报告已保存: ${filepath}`);
  }

  // 分析性能瓶颈
  analyzeBottlenecks(report) {
    const bottlenecks = [];
    
    Object.keys(report.summary).forEach(key => {
      const metric = report.summary[key];
      if (metric.average > 1000) { // 超过1秒的认为是瓶颈
        bottlenecks.push({
          stage: key,
          average: metric.average,
          suggestion: this.getSuggestion(key, metric.average)
        });
      }
    });

    return bottlenecks;
  }

  // 获取优化建议
  getSuggestion(stage, duration) {
    const suggestions = {
      sessionLoad: '考虑预加载用户会话或使用缓存',
      apiCall: '优化API响应时间，添加缓存，减少数据库查询',
      stripeInit: '预加载Stripe SDK，使用CDN加速',
      totalLoad: '整体优化，考虑并行加载和懒加载'
    };

    return suggestions[stage] || '需要进一步分析';
  }
}

// 使用示例
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  // 模拟性能数据
  monitor.recordSessionLoad(0, 500);
  monitor.recordApiCall(500, 1500);
  monitor.recordStripeInit(1500, 2000);
  monitor.recordTotalLoad(0, 2000);
  
  const report = monitor.generateReport();
  monitor.saveReport(report);
  
  const bottlenecks = monitor.analyzeBottlenecks(report);
  console.log('\n性能瓶颈分析:');
  bottlenecks.forEach(bottleneck => {
    console.log(`- ${bottleneck.stage}: ${bottleneck.average}ms - ${bottleneck.suggestion}`);
  });
}

module.exports = PerformanceMonitor;
