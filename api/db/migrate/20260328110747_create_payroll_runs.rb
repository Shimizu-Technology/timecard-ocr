class CreatePayrollRuns < ActiveRecord::Migration[8.1]
  def change
    create_table :payroll_runs do |t|
      t.date :period_start
      t.date :period_end
      t.datetime :generated_at
      t.string :export_url

      t.timestamps
    end
  end
end
