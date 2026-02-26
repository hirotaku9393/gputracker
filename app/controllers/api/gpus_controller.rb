module Api
  class GpusController < ApplicationController
    skip_forgery_protection

    PER_PAGE = 15

    def index
      ransack_params = params[:q].present? ? { name_or_series_cont: params[:q] } : {}
      gpus = Gpu.ransack(ransack_params).result
      gpus = gpus.by_manufacturer(params[:manufacturer]) if params[:manufacturer].present?
      gpus = gpus.price_between(params[:price_min], params[:price_max])

      gpus = case params[:sort]
      when "price_asc" then gpus.by_price_asc
      when "price_desc" then gpus.by_price_desc
      when "performance" then gpus.by_performance
      when "cost_performance" then gpus.by_cost_performance
      when "name" then gpus.by_name
      else gpus.by_popularity
      end

      total_count = gpus.count
      page = [ params[:page].to_i, 1 ].max
      total_pages = (total_count.to_f / PER_PAGE).ceil
      gpus = gpus.offset((page - 1) * PER_PAGE).limit(PER_PAGE)

      favorite_gpu_ids = if current_user
                           current_user.favorites.pluck(:gpu_id)
      else
                           []
      end

      render json: {
        gpus: gpus.map { |gpu|
          gpu_json(gpu).merge(favorited: favorite_gpu_ids.include?(gpu.id))
        },
        meta: {
          current_page: page,
          total_pages: total_pages,
          total_count: total_count,
          per_page: PER_PAGE
        }
      }
    end

    def show
      gpu = Gpu.find(params[:id])
      favorited = current_user ? current_user.favorites.exists?(gpu_id: gpu.id) : false
      render json: gpu_json(gpu).merge(favorited: favorited)
    end

    private

    def gpu_json(gpu)
      cost_performance = if gpu.current_price.to_i > 0 && gpu.benchmark_score.to_i > 0
                           (gpu.benchmark_score.to_f / gpu.current_price * 10_000).round(2)
      else
                           0.0
      end

      {
        id: gpu.id,
        name: gpu.name,
        manufacturer: gpu.manufacturer,
        series: gpu.series,
        vram: gpu.vram,
        benchmark_score: gpu.benchmark_score,
        image_url: gpu.image_url,
        current_price: gpu.current_price,
        popularity: gpu.popularity,
        cost_performance: cost_performance,
        amazon_asin: gpu.amazon_asin
      }
    end
  end
end
