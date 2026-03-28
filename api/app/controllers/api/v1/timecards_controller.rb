module Api
  module V1
    class TimecardsController < ApplicationController
      before_action :set_timecard, only: [:show, :update, :destroy]

      # GET /api/v1/timecards
      def index
        @timecards = Timecard.all
        render json: @timecards
      end

      # GET /api/v1/timecards/:id
      def show
        render json: @timecard
      end

      # POST /api/v1/timecards
      def create
        @timecard = Timecard.new(timecard_params)

        if @timecard.save
          render json: @timecard, status: :created
        else
          render json: { errors: @timecard.errors }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/timecards/:id
      def update
        if @timecard.update(timecard_params)
          render json: @timecard
        else
          render json: { errors: @timecard.errors }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/timecards/:id
      def destroy
        @timecard.destroy
        head :no_content
      end

      private

      def set_timecard
        @timecard = Timecard.find(params[:id])
      end

      def timecard_params
        params.require(:timecard).permit(:employee_name, :period_start, :period_end, :image_url, :ocr_status)
      end
    end
  end
end
