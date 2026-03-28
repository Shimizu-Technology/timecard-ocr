class ProcessTimecardJob < ApplicationJob
  queue_as :default

  def perform(timecard_id)
    timecard = Timecard.find(timecard_id)
    timecard.update!(ocr_status: :processing)

    result = OcrService.process(timecard)

    timecard.update!(
      employee_name: result['employee_name'],
      period_start: result['period_start'],
      period_end: result['period_end'],
      overall_confidence: result['overall_confidence'],
      raw_ocr_response: result
    )

    result['entries']&.each do |entry|
      timecard.punch_entries.create!(
        date: entry['date'],
        day_of_week: entry['day_of_week'],
        clock_in: entry['clock_in'],
        lunch_out: entry['lunch_out'],
        lunch_in: entry['lunch_in'],
        clock_out: entry['clock_out'],
        confidence: entry['confidence'],
        notes: entry['notes']
      )
    end

    timecard.update!(ocr_status: :complete)
  rescue => e
    timecard&.update!(ocr_status: :failed)
    raise e
  end
end
