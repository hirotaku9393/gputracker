require "test_helper"

class Api::GpusTest < ActionDispatch::IntegrationTest
  # --- GET /api/gpus (index) ---

  test "returns gpus with pagination meta" do
    get "/api/gpus"
    assert_response :success
    json = JSON.parse(response.body)
    assert json.key?("gpus")
    assert json.key?("meta")
    assert_equal 1, json["meta"]["current_page"]
    assert json["meta"].key?("total_pages")
    assert json["meta"].key?("total_count")
    assert_equal 15, json["meta"]["per_page"]
  end

  test "filters by keyword query" do
    get "/api/gpus", params: { q: "RTX 4090" }
    assert_response :success
    json = JSON.parse(response.body)
    assert json["gpus"].any? { |g| g["name"].include?("RTX 4090") }
  end

  test "filters by manufacturer" do
    get "/api/gpus", params: { manufacturer: "NVIDIA" }
    assert_response :success
    json = JSON.parse(response.body)
    json["gpus"].each { |g| assert_equal "NVIDIA", g["manufacturer"] }
  end

  test "filters by price range" do
    get "/api/gpus", params: { price_min: "100000", price_max: "400000" }
    assert_response :success
    json = JSON.parse(response.body)
    json["gpus"].each do |g|
      assert g["current_price"] >= 100000
      assert g["current_price"] <= 400000
    end
  end

  test "sorts by price_asc" do
    get "/api/gpus", params: { sort: "price_asc" }
    assert_response :success
    json = JSON.parse(response.body)
    prices = json["gpus"].map { |g| g["current_price"] }
    assert_equal prices.sort, prices
  end

  test "sorts by price_desc" do
    get "/api/gpus", params: { sort: "price_desc" }
    assert_response :success
    json = JSON.parse(response.body)
    prices = json["gpus"].map { |g| g["current_price"] }
    assert_equal prices.sort.reverse, prices
  end

  test "sorts by performance" do
    get "/api/gpus", params: { sort: "performance" }
    assert_response :success
    json = JSON.parse(response.body)
    scores = json["gpus"].map { |g| g["benchmark_score"] }
    assert_equal scores.sort.reverse, scores
  end

  test "sorts by cost_performance" do
    get "/api/gpus", params: { sort: "cost_performance" }
    assert_response :success
  end

  test "sorts by name" do
    get "/api/gpus", params: { sort: "name" }
    assert_response :success
    json = JSON.parse(response.body)
    names = json["gpus"].map { |g| g["name"] }
    assert_equal names.sort, names
  end

  test "defaults to popularity sort" do
    get "/api/gpus"
    assert_response :success
    json = JSON.parse(response.body)
    popularities = json["gpus"].map { |g| g["popularity"] }
    assert_equal popularities.sort.reverse, popularities
  end

  test "paginates correctly" do
    get "/api/gpus", params: { page: 1 }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["meta"]["current_page"]
  end

  test "page param clamps to minimum of 1" do
    get "/api/gpus", params: { page: 0 }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["meta"]["current_page"]
  end

  test "all gpu json fields are present" do
    get "/api/gpus"
    assert_response :success
    json = JSON.parse(response.body)
    gpu = json["gpus"].first
    %w[id name manufacturer series vram benchmark_score image_url current_price popularity cost_performance amazon_asin favorited].each do |key|
      assert gpu.key?(key), "Missing key: #{key}"
    end
  end

  test "favorited is false for unauthenticated user" do
    get "/api/gpus"
    assert_response :success
    json = JSON.parse(response.body)
    json["gpus"].each { |g| assert_equal false, g["favorited"] }
  end

  test "favorited reflects user favorites when logged in" do
    sign_in_as(users(:alice))
    get "/api/gpus"
    assert_response :success
    json = JSON.parse(response.body)
    rtx = json["gpus"].find { |g| g["id"] == gpus(:rtx_4090).id }
    assert_equal true, rtx["favorited"] if rtx
  end

  test "cost_performance is non-zero for gpu with price and score" do
    get "/api/gpus", params: { sort: "performance" }
    assert_response :success
    json = JSON.parse(response.body)
    rtx = json["gpus"].find { |g| g["id"] == gpus(:rtx_4090).id }
    assert rtx["cost_performance"] > 0
  end

  # --- GET /api/gpus/:id (show) ---

  test "returns gpu detail" do
    gpu = gpus(:rtx_4090)
    get "/api/gpus/#{gpu.id}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal gpu.id, json["id"]
    assert_equal gpu.name, json["name"]
    assert_equal false, json["favorited"]
  end

  test "show marks favorited true for logged-in user who favorited" do
    sign_in_as(users(:alice))
    get "/api/gpus/#{gpus(:rtx_4090).id}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal true, json["favorited"]
  end

  test "show marks favorited false when not favorited" do
    sign_in_as(users(:alice))
    get "/api/gpus/#{gpus(:rx_7900_xtx).id}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal false, json["favorited"]
  end

  test "show returns zero cost_performance for zero-price gpu" do
    get "/api/gpus/#{gpus(:zero_price_gpu).id}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0.0, json["cost_performance"]
  end
end
