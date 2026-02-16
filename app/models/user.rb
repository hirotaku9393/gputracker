class User < ApplicationRecord
  has_many :favorites, dependent: :destroy
  has_many :favorite_gpus, through: :favorites, source: :gpu

  validates :email, presence: true
  validates :uid, uniqueness: { scope: :provider }, allow_nil: true

  def self.find_or_create_from_oauth(auth)
    find_or_create_by!(provider: auth.provider, uid: auth.uid) do |user|
      user.email = auth.info.email
      user.name = auth.info.name
      user.avatar_url = auth.info.image
    end
  end
end
