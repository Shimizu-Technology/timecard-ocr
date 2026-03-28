class PayrollCalculator
  def self.calculate(period_start, period_end, ot_threshold: 40.0, ot_multiplier: 1.5)
    entries = PunchEntry
      .joins(:timecard)
      .where('timecards.ocr_status = ? OR timecards.ocr_status = 2', 2)
      .where(date: period_start..period_end)
      .where.not(hours_worked: nil)

    by_employee = entries.group_by { |e| e.timecard.employee_name }

    by_employee.map do |employee_name, emp_entries|
      total = emp_entries.sum(&:hours_worked).round(2)
      regular = [total, ot_threshold].min.round(2)
      overtime = [total - ot_threshold, 0].max.round(2)
      flags = detect_flags(emp_entries, period_start, period_end)
      {
        employee_name: employee_name,
        regular_hours: regular,
        overtime_hours: overtime,
        total_hours: total,
        flags: flags
      }
    end
  end

  def self.detect_flags(entries, period_start, period_end)
    flags = []
    entries.each do |e|
      flags << "#{e.date}: missing clock-in" if e.clock_in.nil?
      flags << "#{e.date}: missing clock-out" if e.clock_out.nil?
      flags << "#{e.date}: shift over 12 hours" if e.hours_worked.to_f > 12
    end
    flags
  end
end
