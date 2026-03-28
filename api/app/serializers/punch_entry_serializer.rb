class PunchEntrySerializer < ActiveModel::Serializer
  attributes :id, :timecard_id, :date, :day_of_week,
             :clock_in, :clock_out, :lunch_out, :lunch_in,
             :hours_worked, :confidence, :manually_edited, :notes
end
