class PunchEntry < ApplicationRecord
  belongs_to :timecard
  before_save :calculate_hours

  private

  def calculate_hours
    return unless clock_in && clock_out
    worked = (clock_out - clock_in) / 3600.0
    if lunch_out && lunch_in
      break_time = (lunch_in - lunch_out) / 3600.0
      worked -= break_time
    end
    self.hours_worked = [worked, 0].max.round(2)
  end
end
