Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # OAuth
  get "/auth/:provider/callback", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"
  get "/logout", to: "sessions#destroy"
  get "/auth/failure", to: "sessions#failure"

  # API
  namespace :api do
    resources :gpus, only: [:index, :show] do
      resources :price_histories, only: [:index]
    end
    resources :favorites, only: [:index, :create, :destroy]
    delete "/favorites/by_gpu/:gpu_id", to: "favorites#destroy_by_gpu"
    get "/me", to: "users#me"
  end

  # SPA fallback
  root "pages#index"
  get "*path", to: "pages#index", constraints: ->(req) {
    !req.xhr? && req.format.html?
  }
end
