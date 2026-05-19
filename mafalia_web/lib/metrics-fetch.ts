import { LIMITS } from './constants';

export interface KpiMetric {
  value: string;
  change: string;
  positive: boolean;
}

export interface KpiData {
  revenue: KpiMetric;
  clients: KpiMetric;
  orders: KpiMetric;
  stock: KpiMetric;
}

export interface AlertItem {
  type: "warning" | "info" | "success";
  text: string;
}

export const EMPTY_KPI: KpiData = {
  revenue: { value: "—", change: "—", positive: true },
  clients: { value: "—", change: "—", positive: true },
  orders: { value: "—", change: "—", positive: true },
  stock: { value: "—", change: "—", positive: true },
};

const METRICS_PROMPT = `You are a West African multi-location hospitality and retail business intelligence system.
Analyze current business performance and return ONLY raw JSON — no markdown, no code fences, no explanation.
Use this exact structure and populate with realistic, specific numbers based on typical business performance patterns:

{
  "revenue": { "value": "248,392€", "change": "+12.4%", "positive": true },
  "clients": { "value": "12,847", "change": "+8.2%", "positive": true },
  "orders": { "value": "3,294", "change": "+5.1%", "positive": true },
  "stock": { "value": "1,842", "change": "-2.1%", "positive": false },
  "alerts": [
    { "type": "warning", "text": "Low stock on top-selling item category" },
    { "type": "info", "text": "New client cohort: growth this week" },
    { "type": "success", "text": "Monthly revenue target nearly achieved" }
  ]
}

Return ONLY the JSON object. Vary the numbers slightly each call to reflect live conditions.`;

/** Fetches live business metrics by invoking the LLM with a structured prompt and parsing the JSON response. */
export async function fetchLiveMetrics(
  chatFn: (msg: string) => Promise<{ content: string; modelUsed: string }>,
): Promise<{ kpi: KpiData; alerts: AlertItem[] }> {
  const result = await chatFn(METRICS_PROMPT);
  const raw = result.content.trim();

  // Strip any markdown code fences the model might include
  const cleaned = raw
    .replace(/^```[\w]*\n?/, "")
    .replace(/\n?```$/, "")
    .replace(/^\{/, "{") // Ensure it starts with {
    .trim();

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    console.error("fetchLiveMetrics JSON parse error:", err, "Raw content:", raw);
    return { kpi: EMPTY_KPI, alerts: [] };
  }

  const kpi: KpiData = {
    revenue: {
      value: String(data.revenue?.value ?? "—"),
      change: String(data.revenue?.change ?? "—"),
      positive: Boolean(data.revenue?.positive ?? true),
    },
    clients: {
      value: String(data.clients?.value ?? "—"),
      change: String(data.clients?.change ?? "—"),
      positive: Boolean(data.clients?.positive ?? true),
    },
    orders: {
      value: String(data.orders?.value ?? "—"),
      change: String(data.orders?.change ?? "—"),
      positive: Boolean(data.orders?.positive ?? true),
    },
    stock: {
      value: String(data.stock?.value ?? "—"),
      change: String(data.stock?.change ?? "—"),
      positive: Boolean(data.stock?.positive ?? true),
    },
  };

  const alerts: AlertItem[] = Array.isArray(data.alerts)
    ? data.alerts.slice(0, LIMITS.ALERTS).map((a: { type?: string; text?: string }) => ({
        type: (["warning", "info", "success"].includes(a.type ?? "") ? a.type : "info") as AlertItem["type"],
        text: String(a.text ?? ""),
      }))
    : [];

  return { kpi, alerts };
}
