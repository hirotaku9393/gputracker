raise "TestSessionsController must not be loaded outside of test environment" unless Rails.env.test?

class TestSessionsController < ApplicationController
  skip_forgery_protection

  def create
    user = User.find(params[:user_id])
    session[:user_id] = user.id
    head :ok
  end
end
