class Timecard < ApplicationRecord
  has_many :punch_entries, dependent: :destroy
  enum :ocr_status, { pending: 0, processing: 1, complete: 2, failed: 3 }
  validates :image_hash, uniqueness: true, allow_nil: true
end
