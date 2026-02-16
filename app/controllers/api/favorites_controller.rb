module Api
  class FavoritesController < ApplicationController
    skip_forgery_protection
    before_action :require_login

    def index
      favorites = current_user.favorites.includes(:gpu)
      render json: favorites.map { |fav|
        {
          id: fav.id,
          gpu: {
            id: fav.gpu.id,
            name: fav.gpu.name,
            manufacturer: fav.gpu.manufacturer,
            series: fav.gpu.series,
            vram: fav.gpu.vram,
            benchmark_score: fav.gpu.benchmark_score,
            image_url: fav.gpu.image_url,
            current_price: fav.gpu.current_price,
            popularity: fav.gpu.popularity,
            favorited: true
          }
        }
      }
    end

    def create
      favorite = current_user.favorites.build(gpu_id: params[:gpu_id])
      if favorite.save
        render json: { id: favorite.id, gpu_id: favorite.gpu_id }, status: :created
      else
        render json: { errors: favorite.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      favorite = current_user.favorites.find(params[:id])
      favorite.destroy!
      head :no_content
    end

    def destroy_by_gpu
      favorite = current_user.favorites.find_by!(gpu_id: params[:gpu_id])
      favorite.destroy!
      head :no_content
    end
  end
end
