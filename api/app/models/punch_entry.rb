class PunchEntry < ApplicationRecord
  belongs_to :timecard

  validates :date, :time_in, :time_out, presence: true
end
