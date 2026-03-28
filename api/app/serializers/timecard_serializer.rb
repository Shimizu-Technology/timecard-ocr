class TimecardSerializer < ActiveModel::Serializer
  attributes :id, :employee_name, :period_start, :period_end,
             :image_url, :ocr_status, :overall_confidence, :created_at
  has_many :punch_entries
end
