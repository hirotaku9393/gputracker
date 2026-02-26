import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Gpu, SortOption, SavedSearch } from "../types";
import { fetchGpus } from "../api/client";
import { useToast } from "../contexts/ToastContext";
import GpuCard from "../components/GpuCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const SORT_LABELS: Record<SortOption, string> = {
  popularity: "人気順",
  price_asc: "価格安い順",
  price_desc: "価格高い順",
  performance: "性能順",
  cost_performance: "コスパ順",
  name: "名前順",
};

function loadSavedSearches(): SavedSearch[] {
  try {
    return JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
  } catch {
    return [];
  }
}

function storeSavedSearches(searches: SavedSearch[]) {
  localStorage.setItem("gpu_saved_searches", JSON.stringify(searches));
}

export default function GpuListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);
  const { showToast } = useToast();

  // URLクエリからフィルタ状態を取得
  const query = searchParams.get("q") || "";
  const sort = (searchParams.get("sort") as SortOption) || "popularity";
  const manufacturer = searchParams.get("manufacturer") || "";
  const priceMin = searchParams.get("price_min") || "";
  const priceMax = searchParams.get("price_max") || "";
  const page = Number(searchParams.get("page")) || 1;

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
      else newParams.delete(k);
    });
    setSearchParams(newParams);
  };

  const loadGpus = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGpus({
        q: query || undefined,
        sort,
        manufacturer: manufacturer || undefined,
        price_min: priceMin || undefined,
        price_max: priceMax || undefined,
        page,
      });
      setGpus(result.gpus);
      setTotalPages(result.meta.total_pages);
      setTotalCount(result.meta.total_count);
    } catch (err) {
      console.error("GPU一覧の取得に失敗しました", err);
      showToast("GPU一覧の取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }, [query, sort, manufacturer, priceMin, priceMax, page, showToast]);

  useEffect(() => {
    loadGpus();
  }, [loadGpus]);

  const handleQueryChange = (q: string) => updateParams({ q, page: "" });
  const handleSortChange = (s: SortOption) => updateParams({ sort: s, page: "" });
  const handleManufacturerChange = (m: string) => updateParams({ manufacturer: m, page: "" });
  const handlePriceMinChange = (v: string) => updateParams({ price_min: v, page: "" });
  const handlePriceMaxChange = (v: string) => updateParams({ price_max: v, page: "" });
  const handlePageChange = (p: number) => updateParams({ page: p > 1 ? String(p) : "" });

  // 検索条件を保存
  const handleSaveSearch = () => {
    const parts: string[] = [];
    if (manufacturer) parts.push(manufacturer);
    if (priceMin || priceMax) {
      const min = priceMin ? `¥${Number(priceMin).toLocaleString()}` : "¥0";
      const max = priceMax ? `¥${Number(priceMax).toLocaleString()}` : "上限なし";
      parts.push(`${min}〜${max}`);
    }
    parts.push(SORT_LABELS[sort]);

    const search: SavedSearch = {
      id: Date.now().toString(),
      label: parts.join(" / ") || "全GPU・人気順",
      sort,
      manufacturer,
      priceMin,
      priceMax,
      savedAt: new Date().toLocaleString("ja-JP"),
    };

    const updated = [search, ...savedSearches.filter((s) => s.label !== search.label)].slice(0, 5);
    setSavedSearches(updated);
    storeSavedSearches(updated);
  };

  // 保存した検索条件を適用
  const handleApplySearch = (s: SavedSearch) => {
    setSearchParams(new URLSearchParams({
      ...(s.sort !== "popularity" ? { sort: s.sort } : {}),
      ...(s.manufacturer ? { manufacturer: s.manufacturer } : {}),
      ...(s.priceMin ? { price_min: s.priceMin } : {}),
      ...(s.priceMax ? { price_max: s.priceMax } : {}),
    }));
  };

  const handleDeleteSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    storeSavedSearches(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
        GPU 価格一覧
      </h1>

      <FilterBar
        query={query}
        onQueryChange={handleQueryChange}
        sort={sort}
        onSortChange={handleSortChange}
        manufacturer={manufacturer}
        onManufacturerChange={handleManufacturerChange}
        priceMin={priceMin}
        onPriceMinChange={handlePriceMinChange}
        priceMax={priceMax}
        onPriceMaxChange={handlePriceMaxChange}
      />

      {/* 検索条件の保存 & 履歴 */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={handleSaveSearch}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          + この条件を保存
        </button>
        {savedSearches.map((s) => (
          <div key={s.id} className="group flex items-center gap-1">
            <button
              onClick={() => handleApplySearch(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              title={`保存日時: ${s.savedAt}`}
            >
              {s.label}
            </button>
            <button
              onClick={() => handleDeleteSearch(s.id)}
              className="text-gray-600 hover:text-red-400 text-xs transition opacity-0 group-hover:opacity-100"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">読み込み中...</div>
      ) : gpus.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          該当するGPUが見つかりませんでした
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {gpus.map((gpu) => (
              <GpuCard key={gpu.id} gpu={gpu} onFavoriteToggle={loadGpus} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
