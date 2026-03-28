class PayrollSummarySerializer < ActiveModel::Serializer
  attributes :id, :payroll_run_id, :employee_name, :regular_hours, :overtime_hours, :total_hours, :flags, :created_at, :updated_at

  belongs_to :payroll_run
end
