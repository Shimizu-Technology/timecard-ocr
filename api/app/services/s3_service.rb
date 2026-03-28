require 'aws-sdk-s3'

class S3Service
  def self.upload(file_path, key)
    client = Aws::S3::Client.new(
      region: ENV['AWS_REGION'],
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
    )
    File.open(file_path, 'rb') do |file|
      client.put_object(bucket: ENV['AWS_BUCKET'], key: key, body: file, content_type: 'image/jpeg')
    end
    "https://#{ENV['AWS_BUCKET']}.s3.#{ENV['AWS_REGION']}.amazonaws.com/#{key}"
  end

  def self.download_to_tempfile(url)
    require 'open-uri'
    tmp = Tempfile.new(['timecard', '.jpg'])
    tmp.binmode
    tmp.write(URI.open(url).read)
    tmp.rewind
    tmp
  end
end
