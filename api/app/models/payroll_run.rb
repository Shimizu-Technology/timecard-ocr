class PayrollRun < ApplicationRecord
  has_many :payroll_summaries, dependent: :destroy
  enum :rounding_rule, { exact: 0, fifteen_min: 1, six_min: 2 }
end
