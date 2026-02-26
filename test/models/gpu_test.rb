require "test_helper"

class GpuTest < ActiveSupport::TestCase
  # --- Validations ---

  test "valid with only name" do
    gpu = Gpu.new(name: "Unique Test GPU")
    assert gpu.valid?
  end

  test "invalid without name" do
    gpu = Gpu.new(name: nil)
    assert_not gpu.valid?
    assert_includes gpu.errors[:name], "can't be blank"
  end

  test "invalid with duplicate name" do
    gpu = Gpu.new(name: gpus(:rtx_4090).name)
    assert_not gpu.valid?
    assert_includes gpu.errors[:name], "has already been taken"
  end

  test "invalid with duplicate amazon_asin" do
    gpu = Gpu.new(name: "Another GPU", amazon_asin: gpus(:rtx_4090).amazon_asin)
    assert_not gpu.valid?
    assert_includes gpu.errors[:amazon_asin], "has already been taken"
  end

  test "valid with nil amazon_asin on multiple records" do
    gpu1 = Gpu.create!(name: "GPU No ASIN 1", amazon_asin: nil)
    gpu2 = Gpu.new(name: "GPU No ASIN 2", amazon_asin: nil)
    assert gpu2.valid?
  end

  # --- Ransack ---

  test "ransackable_attributes returns expected keys" do
    attrs = Gpu.ransackable_attributes
    %w[name series manufacturer vram benchmark_score current_price popularity].each do |a|
      assert_includes attrs, a
    end
  end

  test "ransackable_associations returns empty array" do
    assert_equal [], Gpu.ransackable_associations
  end

  # --- Scopes ---

  test "by_price_asc orders ascending" do
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_price_asc.map(&:id)
    assert_equal gpus(:rx_7900_xtx).id, ids.first
  end

  test "by_price_desc orders descending" do
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_price_desc.map(&:id)
    assert_equal gpus(:rtx_4090).id, ids.first
  end

  test "by_performance orders by benchmark_score descending" do
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_performance.map(&:id)
    assert_equal gpus(:rtx_4090).id, ids.first
  end

  test "by_popularity orders by popularity descending" do
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_popularity.map(&:id)
    assert_equal gpus(:rtx_4090).id, ids.first
  end

  test "by_name orders by name ascending" do
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_name.map(&:id)
    # "ASUS..." < "SAPPHIRE..."
    assert_equal gpus(:rtx_4090).id, ids.first
  end

  test "by_cost_performance orders by score/price ratio descending" do
    # rtx_4090: 5200/320000=0.01625, rx_7900_xtx: 4314/160000=0.026963
    ids = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
             .by_cost_performance.map(&:id)
    assert_equal gpus(:rx_7900_xtx).id, ids.first
  end

  test "by_cost_performance excludes zero price gpus" do
    result = Gpu.by_cost_performance
    assert_not_includes result.map(&:id), gpus(:zero_price_gpu).id
  end

  test "price_between with min only filters correctly" do
    result = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
               .price_between("200000", nil)
    assert_includes result.map(&:id), gpus(:rtx_4090).id
    assert_not_includes result.map(&:id), gpus(:rx_7900_xtx).id
  end

  test "price_between with max only filters correctly" do
    result = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
               .price_between(nil, "200000")
    assert_not_includes result.map(&:id), gpus(:rtx_4090).id
    assert_includes result.map(&:id), gpus(:rx_7900_xtx).id
  end

  test "price_between with no bounds returns all" do
    result = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
               .price_between(nil, nil)
    assert_includes result.map(&:id), gpus(:rtx_4090).id
    assert_includes result.map(&:id), gpus(:rx_7900_xtx).id
  end

  test "price_between with both min and max filters correctly" do
    result = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
               .price_between("100000", "200000")
    assert_not_includes result.map(&:id), gpus(:rtx_4090).id
    assert_includes result.map(&:id), gpus(:rx_7900_xtx).id
  end

  test "by_manufacturer with value filters by manufacturer" do
    result = Gpu.where(id: [gpus(:rtx_4090).id, gpus(:rx_7900_xtx).id])
               .by_manufacturer("NVIDIA")
    assert_includes result.map(&:id), gpus(:rtx_4090).id
    assert_not_includes result.map(&:id), gpus(:rx_7900_xtx).id
  end

  test "by_manufacturer with nil returns all" do
    result = Gpu.by_manufacturer(nil)
    assert_not_nil result
  end

  test "by_manufacturer with blank string returns all" do
    result = Gpu.by_manufacturer("")
    assert_not_nil result
  end

  # --- price_trend ---

  test "price_trend returns data within specified days" do
    gpu = gpus(:rtx_4090)
    gpu.price_histories.create!(price: 315000, recorded_at: 5.days.ago)
    trend = gpu.price_trend(days: 30)
    assert trend.any? { |t| t[:price] == 315000 }
  end

  test "price_trend excludes data older than specified days" do
    gpu = gpus(:rtx_4090)
    gpu.price_histories.create!(price: 280000, recorded_at: 60.days.ago)
    trend = gpu.price_trend(days: 30)
    assert_not trend.any? { |t| t[:price] == 280000 }
  end

  test "price_trend uses default of 30 days" do
    gpu = gpus(:rtx_4090)
    gpu.price_histories.create!(price: 312000, recorded_at: 10.days.ago)
    trend = gpu.price_trend
    assert trend.any? { |t| t[:price] == 312000 }
  end

  test "price_trend returns formatted date strings" do
    gpu = gpus(:rtx_4090)
    gpu.price_histories.create!(price: 310000, recorded_at: 3.days.ago)
    trend = gpu.price_trend
    assert trend.any? { |t| t[:date] =~ /\A\d{4}-\d{2}-\d{2}\z/ }
  end

  # --- Associations ---

  test "has_many price_histories" do
    assert_respond_to gpus(:rtx_4090), :price_histories
  end

  test "has_many favorites" do
    assert_respond_to gpus(:rtx_4090), :favorites
  end

  test "has_many favorited_by_users through favorites" do
    assert_respond_to gpus(:rtx_4090), :favorited_by_users
    assert_includes gpus(:rtx_4090).favorited_by_users, users(:alice)
  end

  test "destroying gpu destroys dependent price_histories" do
    gpu = Gpu.create!(name: "Temp GPU For Cascade")
    gpu.price_histories.create!(price: 10000, recorded_at: Time.current)
    assert_difference "PriceHistory.count", -1 do
      gpu.destroy!
    end
  end

  test "destroying gpu destroys dependent favorites" do
    gpu = Gpu.create!(name: "Temp GPU For Fav Cascade")
    Favorite.create!(user: users(:bob), gpu: gpu)
    assert_difference "Favorite.count", -1 do
      gpu.destroy!
    end
  end
end
