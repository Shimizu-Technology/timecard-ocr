class CreatePayrollRuns < ActiveRecord::Migration[8.1]
  def change
    create_table :payroll_runs, id: :uuid do |t|
      t.date :period_start
      t.date :period_end
      t.float :ot_threshold, default: 40.0
      t.float :ot_multiplier, default: 1.5
      t.integer :rounding_rule, default: 0
      t.text :export_url
      t.datetime :generated_at

      t.timestamps
    end
  end
end
