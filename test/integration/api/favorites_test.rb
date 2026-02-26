require "test_helper"

class Api::FavoritesTest < ActionDispatch::IntegrationTest
  # --- Unauthorized access ---

  test "index requires login" do
    get "/api/favorites"
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert json["error"].present?
  end

  test "create requires login" do
    post "/api/favorites", params: { gpu_id: gpus(:rx_7900_xtx).id }
    assert_response :unauthorized
  end

  test "destroy requires login" do
    delete "/api/favorites/#{favorites(:alice_rtx_4090).id}"
    assert_response :unauthorized
  end

  test "destroy_by_gpu requires login" do
    delete "/api/favorites/by_gpu/#{gpus(:rtx_4090).id}"
    assert_response :unauthorized
  end

  # --- GET /api/favorites (index) ---

  test "index returns user favorites" do
    sign_in_as(users(:alice))
    get "/api/favorites"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json.length
    fav = json.first
    assert fav.key?("id")
    assert fav.key?("gpu")
    assert_equal true, fav["gpu"]["favorited"]
    %w[id name manufacturer series vram benchmark_score image_url current_price popularity].each do |key|
      assert fav["gpu"].key?(key), "Favorite gpu missing key: #{key}"
    end
  end

  test "index returns empty array when user has no favorites" do
    sign_in_as(users(:bob))
    get "/api/favorites"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal [], json
  end

  # --- POST /api/favorites (create) ---

  test "create adds a favorite" do
    sign_in_as(users(:bob))
    assert_difference "Favorite.count", 1 do
      post "/api/favorites", params: { gpu_id: gpus(:rtx_4090).id }
    end
    assert_response :created
    json = JSON.parse(response.body)
    assert json.key?("id")
    assert_equal gpus(:rtx_4090).id, json["gpu_id"]
  end

  test "create returns error when duplicate" do
    sign_in_as(users(:alice))
    assert_no_difference "Favorite.count" do
      post "/api/favorites", params: { gpu_id: gpus(:rtx_4090).id }
    end
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].present?
  end

  # --- DELETE /api/favorites/:id (destroy) ---

  test "destroy removes a favorite" do
    sign_in_as(users(:alice))
    fav_id = favorites(:alice_rtx_4090).id
    assert_difference "Favorite.count", -1 do
      delete "/api/favorites/#{fav_id}"
    end
    assert_response :no_content
  end

  # --- DELETE /api/favorites/by_gpu/:gpu_id (destroy_by_gpu) ---

  test "destroy_by_gpu removes favorite by gpu id" do
    sign_in_as(users(:alice))
    assert_difference "Favorite.count", -1 do
      delete "/api/favorites/by_gpu/#{gpus(:rtx_4090).id}"
    end
    assert_response :no_content
  end
end
