class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
  helper_method :current_user

  def require_login
    unless current_user
      render json: { error: "ログインが必要です" }, status: :unauthorized
    end
  end
end
