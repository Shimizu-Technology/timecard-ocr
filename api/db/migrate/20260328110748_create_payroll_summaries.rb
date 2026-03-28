class CreatePayrollSummaries < ActiveRecord::Migration[8.1]
  def change
    create_table :payroll_summaries, id: :uuid do |t|
      t.references :payroll_run, null: false, foreign_key: true, type: :uuid
      t.string :employee_name
      t.float :regular_hours
      t.float :overtime_hours
      t.float :total_hours
      t.jsonb :flags, default: []

      t.timestamps
    end
  end
end
