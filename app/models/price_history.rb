class PriceHistory < ApplicationRecord
  belongs_to :gpu

  validates :price, presence: true
  validates :recorded_at, presence: true

  after_create :update_gpu_current_price

  private

  def update_gpu_current_price
    gpu.update!(current_price: price)
  end
end
