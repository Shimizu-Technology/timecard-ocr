class CreatePunchEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :punch_entries do |t|
      t.references :timecard, null: false, foreign_key: true
      t.date :date
      t.time :time_in
      t.time :time_out
      t.time :break_start
      t.time :break_end
      t.decimal :hours_worked, precision: 5, scale: 2
      t.decimal :confidence_score, precision: 3, scale: 2
      t.boolean :manually_edited, default: false

      t.timestamps
    end
  end
end
