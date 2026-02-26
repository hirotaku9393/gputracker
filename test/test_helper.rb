require "simplecov"
require "minitest/mock"
SimpleCov.start "rails" do
  add_filter "/test/"
  add_filter "/config/"
  add_filter "app/jobs/application_job.rb"
  add_filter "app/mailers/application_mailer.rb"
  add_filter "app/controllers/test_sessions_controller.rb"
  enable_coverage :branch
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

OmniAuth.config.test_mode = true
OmniAuth.config.on_failure = proc { |env| OmniAuth::FailureEndpoint.new(env).redirect_to_failure }

module ActiveSupport
  class TestCase
    parallelize(workers: 1)
    fixtures :all
  end
end

class ActionDispatch::IntegrationTest
  private

  def sign_in_as(user)
    get "/test_sign_in/#{user.id}"
    assert_response :ok
  end
end
