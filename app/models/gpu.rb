class Gpu < ApplicationRecord
  has_many :price_histories, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorited_by_users, through: :favorites, source: :user

  validates :name, presence: true, uniqueness: true
  validates :amazon_asin, uniqueness: true, allow_nil: true

  scope :by_price_asc, -> { order(current_price: :asc) }
  scope :by_price_desc, -> { order(current_price: :desc) }
  scope :by_performance, -> { order(benchmark_score: :desc) }
  scope :by_popularity, -> { order(popularity: :desc) }
  scope :by_name, -> { order(name: :asc) }
  scope :price_between, ->(min, max) {
    rel = all
    rel = rel.where("current_price >= ?", min) if min.present?
    rel = rel.where("current_price <= ?", max) if max.present?
    rel
  }
  scope :by_manufacturer, ->(manufacturer) {
    where(manufacturer: manufacturer) if manufacturer.present?
  }

  def price_trend(days: 30)
    price_histories
      .where("recorded_at >= ?", days.days.ago)
      .order(recorded_at: :asc)
      .pluck(:recorded_at, :price)
      .map { |date, price| { date: date.strftime("%Y-%m-%d"), price: price } }
  end
end
