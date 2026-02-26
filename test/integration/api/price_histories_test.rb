require "test_helper"

class Api::PriceHistoriesTest < ActionDispatch::IntegrationTest
  setup do
    @gpu = gpus(:rtx_4090)
    # Create price history records for testing
    @gpu.price_histories.create!(price: 320000, recorded_at: 5.days.ago)
    @gpu.price_histories.create!(price: 310000, recorded_at: 15.days.ago)
    @gpu.price_histories.create!(price: 300000, recorded_at: 45.days.ago)
    @gpu.price_histories.create!(price: 290000, recorded_at: 100.days.ago)
  end

  test "returns price histories within default 30 days" do
    get "/api/gpus/#{@gpu.id}/price_histories"
    assert_response :success
    json = JSON.parse(response.body)
    assert json.is_a?(Array)
    # Should include 5-day and 15-day records but not 45-day or 100-day
    prices = json.map { |h| h["price"] }
    assert_includes prices, 320000
    assert_includes prices, 310000
    assert_not_includes prices, 300000
    assert_not_includes prices, 290000
  end

  test "returns price histories with custom days" do
    get "/api/gpus/#{@gpu.id}/price_histories", params: { days: 60 }
    assert_response :success
    json = JSON.parse(response.body)
    prices = json.map { |h| h["price"] }
    assert_includes prices, 300000
    assert_not_includes prices, 290000
  end

  test "days is capped at 365" do
    get "/api/gpus/#{@gpu.id}/price_histories", params: { days: 1000 }
    assert_response :success
    # Should return same as 365 days
    json = JSON.parse(response.body)
    assert json.is_a?(Array)
  end

  test "returns formatted date and price" do
    get "/api/gpus/#{@gpu.id}/price_histories"
    assert_response :success
    json = JSON.parse(response.body)
    record = json.first
    assert record.key?("date")
    assert record.key?("price")
    assert_match(/\A\d{4}-\d{2}-\d{2}\z/, record["date"])
  end

  test "returns records in ascending order" do
    get "/api/gpus/#{@gpu.id}/price_histories"
    assert_response :success
    json = JSON.parse(response.body)
    dates = json.map { |h| h["date"] }
    assert_equal dates.sort, dates
  end
end
