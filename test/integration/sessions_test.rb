require "test_helper"

class SessionsTest < ActionDispatch::IntegrationTest
  test "GET /auth/:provider/callback creates session for existing user" do
    user = users(:alice)
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: user.provider,
      uid: user.uid,
      info: { email: user.email, name: user.name, image: user.avatar_url }
    })

    Rails.application.env_config["omniauth.auth"] = OmniAuth.config.mock_auth[:google_oauth2]

    assert_no_difference "User.count" do
      get "/auth/google_oauth2/callback", env: {
        "omniauth.auth" => OmniAuth.config.mock_auth[:google_oauth2]
      }
    end
    assert_response :redirect
    follow_redirect!
    assert_response :success

    # Verify session is set
    get "/api/me"
    json = JSON.parse(response.body)
    assert_equal user.id, json["id"]
  end

  test "GET /auth/:provider/callback creates a new user" do
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "new_uid_sessions_999",
      info: { email: "sessions_new999@example.com", name: "Sessions New", image: nil }
    })

    assert_difference "User.count", 1 do
      get "/auth/google_oauth2/callback", env: {
        "omniauth.auth" => OmniAuth.config.mock_auth[:google_oauth2]
      }
    end
    follow_redirect!
    assert_response :success
  end

  test "GET /logout destroys session" do
    sign_in_as(users(:alice))
    get "/api/me"
    assert_equal users(:alice).id, JSON.parse(response.body)["id"]

    get "/logout"
    follow_redirect!

    get "/api/me"
    assert_nil JSON.parse(response.body)
  end

  test "DELETE /logout destroys session" do
    sign_in_as(users(:alice))
    delete "/logout"
    follow_redirect!
    get "/api/me"
    assert_nil JSON.parse(response.body)
  end

  test "GET /auth/failure redirects to root with error param" do
    get "/auth/failure"
    assert_response :redirect
    assert_redirected_to "/?error=login_failed"
  end
end
