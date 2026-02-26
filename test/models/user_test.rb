require "test_helper"

class UserTest < ActiveSupport::TestCase
  # --- Validations ---

  test "valid with email" do
    user = User.new(email: "newuser@example.com")
    assert user.valid?
  end

  test "invalid without email" do
    user = User.new(email: nil)
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "invalid with duplicate uid and provider" do
    existing = users(:alice)
    user = User.new(email: "other@example.com", provider: existing.provider, uid: existing.uid)
    assert_not user.valid?
    assert_includes user.errors[:uid], "has already been taken"
  end

  test "allows nil uid" do
    user = User.new(email: "nouid@example.com", uid: nil)
    assert user.valid?
  end

  test "allows duplicate nil uid" do
    User.create!(email: "nouid1@example.com", uid: nil)
    user = User.new(email: "nouid2@example.com", uid: nil)
    assert user.valid?
  end

  # --- find_or_create_from_oauth ---

  test "find_or_create_from_oauth creates a new user" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "brand_new_uid_777",
      info: {
        email: "brand_new@example.com",
        name: "Brand New",
        image: "https://example.com/brand_new.jpg"
      }
    })
    assert_difference "User.count", 1 do
      user = User.find_or_create_from_oauth(auth)
      assert_equal "brand_new@example.com", user.email
      assert_equal "Brand New", user.name
      assert_equal "https://example.com/brand_new.jpg", user.avatar_url
    end
  end

  test "find_or_create_from_oauth finds existing user" do
    existing = users(:alice)
    auth = OmniAuth::AuthHash.new({
      provider: existing.provider,
      uid: existing.uid,
      info: {
        email: existing.email,
        name: existing.name,
        image: existing.avatar_url
      }
    })
    assert_no_difference "User.count" do
      user = User.find_or_create_from_oauth(auth)
      assert_equal existing.id, user.id
    end
  end

  # --- Associations ---

  test "has_many favorites" do
    assert_respond_to users(:alice), :favorites
    assert_equal 1, users(:alice).favorites.count
  end

  test "has_many favorite_gpus through favorites" do
    assert_respond_to users(:alice), :favorite_gpus
    assert_includes users(:alice).favorite_gpus, gpus(:rtx_4090)
  end

  test "destroying user destroys dependent favorites" do
    user = User.create!(email: "temp_user@example.com")
    Favorite.create!(user: user, gpu: gpus(:rtx_4090))
    assert_difference "Favorite.count", -1 do
      user.destroy!
    end
  end
end
