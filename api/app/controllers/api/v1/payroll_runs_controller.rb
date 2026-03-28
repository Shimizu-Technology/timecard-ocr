require 'csv'

module Api
  module V1
    class PayrollRunsController < ApplicationController
      def index
        render json: PayrollRun.order(created_at: :desc), each_serializer: PayrollRunSerializer
      end

      def create
        run = PayrollRun.create!(payroll_run_params.merge(generated_at: Time.current))
        summaries = PayrollCalculator.calculate(
          run.period_start, run.period_end,
          ot_threshold: run.ot_threshold,
          ot_multiplier: run.ot_multiplier
        )
        summaries.each { |s| run.payroll_summaries.create!(s) }
        render json: run, serializer: PayrollRunSerializer, status: :created
      end

      def show
        render json: PayrollRun.find(params[:id]), serializer: PayrollRunSerializer
      end

      def export
        run = PayrollRun.includes(:payroll_summaries).find(params[:id])
        csv = CSV.generate(headers: true) do |csv|
          csv << ['Employee Name', 'Period Start', 'Period End', 'Regular Hours', 'OT Hours', 'Total Hours', 'Flags']
          run.payroll_summaries.each do |s|
            csv << [s.employee_name, run.period_start, run.period_end, s.regular_hours, s.overtime_hours, s.total_hours, s.flags.join('; ')]
          end
        end
        send_data csv, filename: "payroll-#{run.period_start}-#{run.period_end}.csv", type: 'text/csv'
      end

      private

      def payroll_run_params
        params.require(:payroll_run).permit(:period_start, :period_end, :ot_threshold, :ot_multiplier, :rounding_rule)
      end
    end
  end
end
