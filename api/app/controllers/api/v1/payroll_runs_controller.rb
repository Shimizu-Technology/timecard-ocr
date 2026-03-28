module Api
  module V1
    class PayrollRunsController < ApplicationController
      before_action :set_payroll_run, only: [:show]

      # GET /api/v1/payroll_runs
      def index
        @payroll_runs = PayrollRun.all
        render json: @payroll_runs
      end

      # GET /api/v1/payroll_runs/:id
      def show
        render json: @payroll_run
      end

      # POST /api/v1/payroll_runs
      def create
        @payroll_run = PayrollRun.new(payroll_run_params)

        if @payroll_run.save
          render json: @payroll_run, status: :created
        else
          render json: { errors: @payroll_run.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_payroll_run
        @payroll_run = PayrollRun.find(params[:id])
      end

      def payroll_run_params
        params.require(:payroll_run).permit(:period_start, :period_end, :generated_at, :export_url)
      end
    end
  end
end
