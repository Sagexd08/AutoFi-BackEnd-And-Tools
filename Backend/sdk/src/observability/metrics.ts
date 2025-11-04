/**
 * Metric type.
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

/**
 * Metric value.
 */
export interface MetricValue {
  type: MetricType;
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

/**
 * Metrics collector interface.
 */
export interface MetricsCollector {
  /**
   * Increments a counter metric.
   */
  increment(name: string, labels?: Record<string, string>): void;

  /**
   * Sets a gauge metric value.
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void;

  /**
   * Records a histogram value.
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;

  /**
   * Gets all collected metrics.
   */
  getMetrics(): readonly MetricValue[];

  /**
   * Clears all metrics.
   */
  clear(): void;
}

/**
 * In-memory metrics collector implementation.
 */
export class InMemoryMetricsCollector implements MetricsCollector {
  private metrics: MetricValue[] = [];
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  /**
   * Increments a counter metric.
   */
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

  /**
   * Sets a gauge metric value.
   */
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

  /**
   * Records a histogram value.
   */
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

  /**
   * Gets all collected metrics.
   */
  getMetrics(): readonly MetricValue[] {
    return [...this.metrics];
  }

  /**
   * Gets current counter values.
   */
  getCounters(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.counters.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Gets current gauge values.
   */
  getGauges(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.gauges.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Gets histogram statistics.
   */
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

  /**
   * Clears all metrics.
   */
  clear(): void {
    this.metrics = [];
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  /**
   * Generates a cache key from name and labels.
   */
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
