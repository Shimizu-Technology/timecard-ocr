# Clear existing data
PayrollSummary.destroy_all
PayrollRun.destroy_all
PunchEntry.destroy_all
Timecard.destroy_all

days_of_week = %w[Mon Tue Wed Thu Fri]

# Timecard 1: Alice Johnson
tc1 = Timecard.create!(
  employee_name: "Alice Johnson",
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  image_url: "https://example.com/sample_timecard_1.jpg",
  ocr_status: :complete,
  overall_confidence: 0.95
)

(0..4).each do |i|
  tc1.punch_entries.create!(
    date: Date.new(2026, 3, 16) + i,
    day_of_week: days_of_week[i],
    clock_in: "08:00",
    lunch_out: "12:00",
    lunch_in: "13:00",
    clock_out: "17:00",
    confidence: 0.95
  )
end

# Timecard 2: Bob Martinez
tc2 = Timecard.create!(
  employee_name: "Bob Martinez",
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  image_url: "https://example.com/sample_timecard_2.jpg",
  ocr_status: :complete,
  overall_confidence: 0.95
)

(0..4).each do |i|
  tc2.punch_entries.create!(
    date: Date.new(2026, 3, 16) + i,
    day_of_week: days_of_week[i],
    clock_in: "08:00",
    lunch_out: "12:00",
    lunch_in: "13:00",
    clock_out: "17:00",
    confidence: 0.95
  )
end

# Timecard 3: Carol Nguyen
tc3 = Timecard.create!(
  employee_name: "Carol Nguyen",
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  image_url: "https://example.com/sample_timecard_3.jpg",
  ocr_status: :complete,
  overall_confidence: 0.95
)

(0..4).each do |i|
  tc3.punch_entries.create!(
    date: Date.new(2026, 3, 16) + i,
    day_of_week: days_of_week[i],
    clock_in: "08:00",
    lunch_out: "12:00",
    lunch_in: "13:00",
    clock_out: "17:00",
    confidence: 0.95
  )
end

# Create a payroll run
run = PayrollRun.create!(
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  ot_threshold: 40.0,
  ot_multiplier: 1.5,
  generated_at: Time.current
)

summaries = PayrollCalculator.calculate(run.period_start, run.period_end,
  ot_threshold: run.ot_threshold, ot_multiplier: run.ot_multiplier)
summaries.each { |s| run.payroll_summaries.create!(s) }

puts "Seeded #{Timecard.count} timecards with #{PunchEntry.count} punch entries and #{PayrollRun.count} payroll run."
