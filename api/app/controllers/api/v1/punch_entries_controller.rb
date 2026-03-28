module Api
  module V1
    class PunchEntriesController < ApplicationController
      before_action :set_timecard
      before_action :set_punch_entry, only: [:show, :update, :destroy]

      # GET /api/v1/timecards/:timecard_id/punch_entries
      def index
        @punch_entries = @timecard.punch_entries
        render json: @punch_entries
      end

      # GET /api/v1/timecards/:timecard_id/punch_entries/:id
      def show
        render json: @punch_entry
      end

      # POST /api/v1/timecards/:timecard_id/punch_entries
      def create
        @punch_entry = @timecard.punch_entries.new(punch_entry_params)

        if @punch_entry.save
          render json: @punch_entry, status: :created
        else
          render json: { errors: @punch_entry.errors }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/timecards/:timecard_id/punch_entries/:id
      def update
        if @punch_entry.update(punch_entry_params)
          render json: @punch_entry
        else
          render json: { errors: @punch_entry.errors }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/timecards/:timecard_id/punch_entries/:id
      def destroy
        @punch_entry.destroy
        head :no_content
      end

      private

      def set_timecard
        @timecard = Timecard.find(params[:timecard_id])
      end

      def set_punch_entry
        @punch_entry = @timecard.punch_entries.find(params[:id])
      end

      def punch_entry_params
        params.require(:punch_entry).permit(:date, :time_in, :time_out, :break_start, :break_end, :hours_worked, :confidence_score, :manually_edited)
      end
    end
  end
end
