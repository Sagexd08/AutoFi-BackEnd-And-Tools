
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}


export interface MetricValue {
  type: MetricType;
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}


export interface MetricsCollector {
  
  increment(name: string, labels?: Record<string, string>): void;

  
  setGauge(name: string, value: number, labels?: Record<string, string>): void;

  
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;

  
  getMetrics(): readonly MetricValue[];

  
  clear(): void;
}


export class InMemoryMetricsCollector implements MetricsCollector {
  private metrics: MetricValue[] = [];
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  
  increment(name: string, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) ?? 0;
    this.counters.set(key, current + 1);

    this.metrics.push({
      type: MetricType.COUNTER,
      name,
      value: current + 1,
      labels,
      timestamp: Date.now(),
    });
  }

  
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);

    this.metrics.push({
      type: MetricType.GAUGE,
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) ?? [];
    values.push(value);
    this.histograms.set(key, values);

    this.metrics.push({
      type: MetricType.HISTOGRAM,
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  
  getMetrics(): readonly MetricValue[] {
    return [...this.metrics];
  }

  
  getCounters(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.counters.entries()) {
      result[key] = value;
    }
    return result;
  }

  
  getGauges(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.gauges.entries()) {
      result[key] = value;
    }
    return result;
  }

  
  getHistogramStats(name: string, labels?: Record<string, string>): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
  } | undefined {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key);
    if (!values || values.length === 0) {
      return undefined;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      sum,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  }

  
  clear(): void {
    this.metrics = [];
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  
  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}
