class CreatePayrollSummaries < ActiveRecord::Migration[8.1]
  def change
    create_table :payroll_summaries do |t|
      t.references :payroll_run, null: false, foreign_key: true
      t.string :employee_name
      t.decimal :regular_hours, precision: 5, scale: 2
      t.decimal :overtime_hours, precision: 5, scale: 2
      t.decimal :total_hours, precision: 5, scale: 2
      t.jsonb :flags, default: []

      t.timestamps
    end
  end
end
