class PayrollRunSerializer < ActiveModel::Serializer
  attributes :id, :period_start, :period_end, :ot_threshold,
             :ot_multiplier, :rounding_rule, :generated_at
  has_many :payroll_summaries
end
