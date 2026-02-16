import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PriceHistoryPoint } from "../types";
import { fetchPriceHistories } from "../api/client";

interface Props {
  gpuId: number;
}

const PERIOD_OPTIONS = [
  { label: "7日", value: 7 },
  { label: "30日", value: 30 },
  { label: "90日", value: 90 },
  { label: "1年", value: 365 },
];

function formatYen(value: number): string {
  return `¥${value.toLocaleString()}`;
}

export default function PriceChart({ gpuId }: Props) {
  const [data, setData] = useState<PriceHistoryPoint[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPriceHistories(gpuId, days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [gpuId, days]);

  return (
    <div className="chart-glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">価格推移</h2>
        <div className="flex space-x-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 rounded text-sm transition ${
                days === opt.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          読み込み中...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          価格データがありません
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tickFormatter={formatYen}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [formatYen(value), "価格"]}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#9CA3AF" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
