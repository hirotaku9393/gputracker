class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :name
      t.string :provider
      t.string :uid
      t.string :avatar_url

      t.timestamps
    end

    add_index :users, [:provider, :uid], unique: true
  end
end
