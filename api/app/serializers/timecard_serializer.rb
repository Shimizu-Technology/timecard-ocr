class TimecardSerializer < ActiveModel::Serializer
  attributes :id, :employee_name, :period_start, :period_end, :image_url, :ocr_status, :created_at, :updated_at

  has_many :punch_entries
end
