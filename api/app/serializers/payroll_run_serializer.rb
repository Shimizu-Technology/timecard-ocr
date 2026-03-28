class PayrollRunSerializer < ActiveModel::Serializer
  attributes :id, :period_start, :period_end, :generated_at, :export_url, :created_at, :updated_at

  has_many :payroll_summaries
end
