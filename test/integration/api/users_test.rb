require "test_helper"

class Api::UsersTest < ActionDispatch::IntegrationTest
  test "GET /api/me returns null when not logged in" do
    get "/api/me"
    assert_response :success
    assert_nil JSON.parse(response.body)
  end

  test "GET /api/me returns user info when logged in" do
    sign_in_as(users(:alice))
    get "/api/me"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal users(:alice).id, json["id"]
    assert_equal users(:alice).email, json["email"]
    assert_equal users(:alice).name, json["name"]
    assert_equal users(:alice).avatar_url, json["avatar_url"]
  end
end
