class PayrollSummarySerializer < ActiveModel::Serializer
  attributes :id, :employee_name, :regular_hours, :overtime_hours, :total_hours, :flags
end
