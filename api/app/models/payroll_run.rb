class PayrollRun < ApplicationRecord
  has_many :payroll_summaries, dependent: :destroy
end
