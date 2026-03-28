class PunchEntrySerializer < ActiveModel::Serializer
  attributes :id, :timecard_id, :date, :time_in, :time_out, :break_start, :break_end, :hours_worked, :confidence_score, :manually_edited, :created_at, :updated_at

  belongs_to :timecard
end
