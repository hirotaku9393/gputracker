class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_or_create_from_oauth(auth)
    session[:user_id] = user.id
    redirect_to root_path
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path
  end

  def failure
    redirect_to root_path(error: "login_failed")
  end
end
