class CreateTimecards < ActiveRecord::Migration[8.1]
  def change
    create_table :timecards do |t|
      t.string :employee_name
      t.date :period_start
      t.date :period_end
      t.string :image_url
      t.string :ocr_status, default: "pending"

      t.timestamps
    end
  end
end
