class Timecard < ApplicationRecord
  has_many :punch_entries, dependent: :destroy

  validates :employee_name, :period_start, :period_end, presence: true
  validates :ocr_status, inclusion: { in: %w[pending processing complete failed] }
end
