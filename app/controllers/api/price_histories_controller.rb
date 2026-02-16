module Api
  class PriceHistoriesController < ApplicationController
    def index
      gpu = Gpu.find(params[:gpu_id])
      days = (params[:days] || 30).to_i
      days = [days, 365].min

      histories = gpu.price_histories
                     .where("recorded_at >= ?", days.days.ago)
                     .order(recorded_at: :asc)

      render json: histories.map { |h|
        { date: h.recorded_at.strftime("%Y-%m-%d"), price: h.price }
      }
    end
  end
end
