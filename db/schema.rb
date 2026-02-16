# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_02_15_032722) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "gpu_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gpu_id"], name: "index_favorites_on_gpu_id"
    t.index ["user_id", "gpu_id"], name: "index_favorites_on_user_id_and_gpu_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "gpus", force: :cascade do |t|
    t.string "name", null: false
    t.string "manufacturer"
    t.string "series"
    t.integer "vram"
    t.integer "benchmark_score"
    t.string "image_url"
    t.string "amazon_asin"
    t.integer "current_price", default: 0
    t.integer "popularity", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["amazon_asin"], name: "index_gpus_on_amazon_asin", unique: true
    t.index ["current_price"], name: "index_gpus_on_current_price"
    t.index ["manufacturer"], name: "index_gpus_on_manufacturer"
    t.index ["name"], name: "index_gpus_on_name", unique: true
    t.index ["popularity"], name: "index_gpus_on_popularity"
  end

  create_table "price_histories", force: :cascade do |t|
    t.bigint "gpu_id", null: false
    t.integer "price", null: false
    t.datetime "recorded_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gpu_id", "recorded_at"], name: "index_price_histories_on_gpu_id_and_recorded_at"
    t.index ["gpu_id"], name: "index_price_histories_on_gpu_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "name"
    t.string "provider"
    t.string "uid"
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
  end

  add_foreign_key "favorites", "gpus"
  add_foreign_key "favorites", "users"
  add_foreign_key "price_histories", "gpus"
end
