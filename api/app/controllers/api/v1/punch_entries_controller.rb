module Api
  module V1
    class PunchEntriesController < ApplicationController
      def update
        entry = PunchEntry.find(params[:id])
        entry.update!(punch_entry_params.merge(manually_edited: true))
        render json: entry, serializer: PunchEntrySerializer
      end

      private

      def punch_entry_params
        params.require(:punch_entry).permit(:clock_in, :lunch_out, :lunch_in, :clock_out, :notes)
      end
    end
  end
end
