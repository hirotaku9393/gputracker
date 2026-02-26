require "test_helper"

class PriceHistoryTest < ActiveSupport::TestCase
  # --- Validations ---

  test "valid with price and recorded_at" do
    ph = PriceHistory.new(gpu: gpus(:rtx_4090), price: 300000, recorded_at: Time.current)
    assert ph.valid?
  end

  test "invalid without price" do
    ph = PriceHistory.new(gpu: gpus(:rtx_4090), price: nil, recorded_at: Time.current)
    assert_not ph.valid?
    assert_includes ph.errors[:price], "can't be blank"
  end

  test "invalid without recorded_at" do
    ph = PriceHistory.new(gpu: gpus(:rtx_4090), price: 300000, recorded_at: nil)
    assert_not ph.valid?
    assert_includes ph.errors[:recorded_at], "can't be blank"
  end

  # --- Callback ---

  test "after_create updates gpu current_price" do
    gpu = Gpu.create!(name: "Price Update Test GPU", current_price: 100000)
    PriceHistory.create!(gpu: gpu, price: 250000, recorded_at: Time.current)
    assert_equal 250000, gpu.reload.current_price
  end

  # --- Association ---

  test "belongs_to gpu" do
    gpu = gpus(:rx_7900_xtx)
    ph = PriceHistory.create!(gpu: gpu, price: 150000, recorded_at: Time.current)
    assert_equal gpu, ph.gpu
  end
end
