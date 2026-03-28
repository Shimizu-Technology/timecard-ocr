module Api
  module V1
    class TimecardsController < ApplicationController
      def index
        timecards = Timecard.all
        timecards = timecards.where(ocr_status: params[:status]) if params[:status]
        render json: timecards, each_serializer: TimecardSerializer
      end

      def show
        timecard = Timecard.find(params[:id])
        render json: timecard, serializer: TimecardSerializer
      end

      def create
        file = params[:image]
        return render json: { error: 'No image provided' }, status: :unprocessable_entity unless file

        key = "timecards/#{SecureRandom.uuid}/#{file.original_filename}"
        image_url = S3Service.upload(file.tempfile.path, key)

        image_hash = Digest::SHA256.hexdigest(File.read(file.tempfile.path))
        existing = Timecard.find_by(image_hash: image_hash)
        return render json: existing, serializer: TimecardSerializer if existing

        timecard = Timecard.create!(image_url: image_url, image_hash: image_hash, ocr_status: :pending)
        ProcessTimecardJob.perform_later(timecard.id)

        render json: timecard, serializer: TimecardSerializer, status: :accepted
      end
    end
  end
end
