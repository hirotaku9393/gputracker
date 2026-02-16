class CreatePriceHistories < ActiveRecord::Migration[8.0]
  def change
    create_table :price_histories do |t|
      t.references :gpu, null: false, foreign_key: true
      t.integer :price, null: false
      t.datetime :recorded_at, null: false

      t.timestamps
    end

    add_index :price_histories, [:gpu_id, :recorded_at]
  end
end
