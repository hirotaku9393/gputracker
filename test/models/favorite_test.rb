require "test_helper"

class FavoriteTest < ActiveSupport::TestCase
  # --- Validations ---

  test "valid with user and gpu" do
    fav = Favorite.new(user: users(:bob), gpu: gpus(:rx_7900_xtx))
    assert fav.valid?
  end

  test "invalid with duplicate user_id and gpu_id" do
    existing = favorites(:alice_rtx_4090)
    fav = Favorite.new(user: existing.user, gpu: existing.gpu)
    assert_not fav.valid?
    assert_includes fav.errors[:gpu_id], "has already been taken"
  end

  # --- Callbacks ---

  test "after_create increments gpu popularity" do
    gpu = gpus(:rx_7900_xtx)
    initial = gpu.popularity
    Favorite.create!(user: users(:bob), gpu: gpu)
    assert_equal initial + 1, gpu.reload.popularity
  end

  test "after_destroy decrements gpu popularity" do
    fav = favorites(:alice_rtx_4090)
    gpu = fav.gpu
    initial = gpu.reload.popularity
    fav.destroy!
    assert_equal initial - 1, gpu.reload.popularity
  end

  test "after_destroy does not decrement popularity below zero" do
    gpu = Gpu.create!(name: "Zero Pop GPU", popularity: 0)
    fav = Favorite.create!(user: users(:bob), gpu: gpu)
    gpu.update_columns(popularity: 0)
    fav.destroy!
    assert_equal 0, gpu.reload.popularity
  end

  # --- Associations ---

  test "belongs_to user" do
    assert_equal users(:alice), favorites(:alice_rtx_4090).user
  end

  test "belongs_to gpu" do
    assert_equal gpus(:rtx_4090), favorites(:alice_rtx_4090).gpu
  end
end
