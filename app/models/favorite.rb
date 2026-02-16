class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :gpu

  validates :gpu_id, uniqueness: { scope: :user_id }

  after_create :increment_popularity
  after_destroy :decrement_popularity

  private

  def increment_popularity
    Gpu.where(id: gpu_id).update_all("popularity = popularity + 1")
  end

  def decrement_popularity
    Gpu.where(id: gpu_id).update_all("popularity = GREATEST(popularity - 1, 0)")
  end
end
