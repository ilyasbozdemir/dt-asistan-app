export interface RequestLog {
  id: string;
  time: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  duration: number;
}

// In-memory request log ring buffer
const maxLogs = 100;
const requestLogs: RequestLog[] = [];
let totalRequests = 0;
let totalDuration = 0;

export function recordRequest(method: "GET" | "POST" | "PUT" | "DELETE", path: string, status: number, duration: number) {
  totalRequests++;
  totalDuration += duration;
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];

  const log: RequestLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    time,
    method,
    path,
    status,
    duration,
  };

  requestLogs.unshift(log);
  if (requestLogs.length > maxLogs) {
    requestLogs.pop();
  }

  return log;
}

export function getMetrics() {
  const avgDuration = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;
  return {
    totalRequests,
    avgDuration,
    recentLogs: [...requestLogs],
  };
}
