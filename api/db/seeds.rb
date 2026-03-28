# Clear existing data
PayrollSummary.destroy_all
PayrollRun.destroy_all
PunchEntry.destroy_all
Timecard.destroy_all

# Timecard 1: Alice Johnson
tc1 = Timecard.create!(
  employee_name: "Alice Johnson",
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  image_url: "https://res.cloudinary.com/demo/image/upload/sample_timecard_1.jpg",
  ocr_status: "complete"
)

[
  { date: Date.new(2026, 3, 16), time_in: "08:00", time_out: "16:30", break_start: "12:00", break_end: "12:30", hours_worked: 8.0, confidence_score: 0.95 },
  { date: Date.new(2026, 3, 17), time_in: "07:45", time_out: "16:15", break_start: "12:00", break_end: "12:30", hours_worked: 8.0, confidence_score: 0.92 },
  { date: Date.new(2026, 3, 18), time_in: "08:00", time_out: "17:00", break_start: "12:00", break_end: "12:30", hours_worked: 8.5, confidence_score: 0.97 },
  { date: Date.new(2026, 3, 19), time_in: "08:00", time_out: "16:30", break_start: "12:00", break_end: "12:30", hours_worked: 8.0, confidence_score: 0.91 },
  { date: Date.new(2026, 3, 20), time_in: "08:00", time_out: "16:00", break_start: "12:00", break_end: "12:30", hours_worked: 7.5, confidence_score: 0.94 },
].each do |entry|
  tc1.punch_entries.create!(entry)
end

# Timecard 2: Bob Martinez
tc2 = Timecard.create!(
  employee_name: "Bob Martinez",
  period_start: Date.new(2026, 3, 16),
  period_end: Date.new(2026, 3, 22),
  image_url: "https://res.cloudinary.com/demo/image/upload/sample_timecard_2.jpg",
  ocr_status: "complete"
)

[
  { date: Date.new(2026, 3, 16), time_in: "09:00", time_out: "18:00", break_start: "13:00", break_end: "13:30", hours_worked: 8.5, confidence_score: 0.88 },
  { date: Date.new(2026, 3, 17), time_in: "09:00", time_out: "17:30", break_start: "13:00", break_end: "13:30", hours_worked: 8.0, confidence_score: 0.93 },
  { date: Date.new(2026, 3, 18), time_in: "09:15", time_out: "19:00", break_start: "13:00", break_end: "13:30", hours_worked: 9.25, confidence_score: 0.85 },
  { date: Date.new(2026, 3, 19), time_in: "09:00", time_out: "17:30", break_start: "13:00", break_end: "13:30", hours_worked: 8.0, confidence_score: 0.90 },
  { date: Date.new(2026, 3, 20), time_in: "09:00", time_out: "17:00", break_start: "13:00", break_end: "13:30", hours_worked: 7.5, confidence_score: 0.96 },
].each do |entry|
  tc2.punch_entries.create!(entry)
end

# Timecard 3: Carol Nguyen (pending OCR)
Timecard.create!(
  employee_name: "Carol Nguyen",
  period_start: Date.new(2026, 3, 23),
  period_end: Date.new(2026, 3, 29),
  image_url: "https://res.cloudinary.com/demo/image/upload/sample_timecard_3.jpg",
  ocr_status: "pending"
)

puts "Seeded #{Timecard.count} timecards with #{PunchEntry.count} punch entries."
