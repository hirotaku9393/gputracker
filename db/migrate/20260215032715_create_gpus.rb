class CreateGpus < ActiveRecord::Migration[8.0]
  def change
    create_table :gpus do |t|
      t.string :name, null: false
      t.string :manufacturer
      t.string :series
      t.integer :vram
      t.integer :benchmark_score
      t.string :image_url
      t.string :amazon_asin
      t.integer :current_price, default: 0
      t.integer :popularity, default: 0

      t.timestamps
    end

    add_index :gpus, :name, unique: true
    add_index :gpus, :amazon_asin, unique: true
    add_index :gpus, :manufacturer
    add_index :gpus, :current_price
    add_index :gpus, :popularity
  end
end
