module Api
  class UsersController < ApplicationController
    def me
      if current_user
        render json: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name,
          avatar_url: current_user.avatar_url
        }
      else
        render json: nil
      end
    end
  end
end
