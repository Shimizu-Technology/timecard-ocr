class CreateTimecards < ActiveRecord::Migration[8.1]
  def change
    create_table :timecards, id: :uuid do |t|
      t.string :employee_name
      t.date :period_start
      t.date :period_end
      t.text :image_url
      t.text :preprocessed_image_url
      t.string :image_hash
      t.integer :ocr_status, default: 0
      t.float :overall_confidence
      t.jsonb :raw_ocr_response

      t.timestamps
    end

    add_index :timecards, :image_hash, unique: true
  end
end
