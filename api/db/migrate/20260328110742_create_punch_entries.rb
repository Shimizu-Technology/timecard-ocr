class CreatePunchEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :punch_entries, id: :uuid do |t|
      t.references :timecard, null: false, foreign_key: true, type: :uuid
      t.date :date
      t.string :day_of_week, limit: 3
      t.time :clock_in
      t.time :lunch_out
      t.time :lunch_in
      t.time :clock_out
      t.float :hours_worked
      t.float :confidence
      t.boolean :manually_edited, default: false
      t.text :notes

      t.timestamps
    end
  end
end
