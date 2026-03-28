require 'httparty'
require 'base64'
require 'json'

class OcrService
  MAX_RETRIES = 3
  BACKOFF_SECONDS = [5, 25, 125]

  def self.process(timecard)
    new(timecard).call
  end

  def initialize(timecard)
    @timecard = timecard
  end

  def call
    image_data = fetch_and_preprocess
    response = call_openrouter_with_retry(image_data)
    parse_response(response)
  end

  private

  def fetch_and_preprocess
    tmp = S3Service.download_to_tempfile(@timecard.image_url)
    preprocessed = preprocess_image(tmp.path)
    Base64.strict_encode64(File.read(preprocessed))
  ensure
    tmp&.close
    tmp&.unlink
  end

  def preprocess_image(path)
    image = MiniMagick::Image.open(path)
    image.resize '1600x1600>'
    image.format 'jpeg'
    image.quality 85
    out = Tempfile.new(['processed', '.jpg'])
    image.write(out.path)
    out.path
  end

  def call_openrouter_with_retry(image_data)
    retries = 0
    begin
      call_openrouter(image_data)
    rescue => e
      retries += 1
      if retries <= MAX_RETRIES
        sleep(BACKOFF_SECONDS[retries - 1])
        retry
      else
        raise
      end
    end
  end

  def call_openrouter(image_data)
    model = ENV['OPENROUTER_MODEL'] || 'google/gemini-flash-1.5'
    prompt = ocr_prompt

    response = HTTParty.post(
      'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization' => "Bearer #{ENV['OPENROUTER_API_KEY']}",
        'Content-Type' => 'application/json',
        'HTTP-Referer' => 'https://shimizu-technology.com',
        'X-Title' => 'Timecard OCR'
      },
      body: {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: "data:image/jpeg;base64,#{image_data}" } },
              { type: 'text', text: prompt }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }.to_json
    )

    raise "OpenRouter error: #{response.code} #{response.body}" unless response.success?
    response.parsed_response
  end

  def ocr_prompt
    <<~PROMPT
      You are extracting data from a paper time card. Return ONLY valid JSON, no markdown, no explanation.

      Extract all time entries from this time card image and return this exact structure:
      {
        "employee_name": "string or null",
        "period_start": "YYYY-MM-DD or null",
        "period_end": "YYYY-MM-DD or null",
        "entries": [
          {
            "date": "YYYY-MM-DD",
            "day_of_week": "Mon",
            "clock_in": "HH:MM or null",
            "lunch_out": "HH:MM or null",
            "lunch_in": "HH:MM or null",
            "clock_out": "HH:MM or null",
            "confidence": 0.95,
            "notes": "any anomaly or null"
          }
        ],
        "overall_confidence": 0.9
      }

      Rules:
      - All times in 24-hour HH:MM format
      - If a field is blank or illegible, use null
      - Include ALL days shown, even if empty
      - confidence is 0.0 to 1.0 per entry
      - Return ONLY the JSON object, nothing else
    PROMPT
  end

  def parse_response(response)
    content = response.dig('choices', 0, 'message', 'content')
    raise 'Empty OCR response' if content.blank?
    JSON.parse(content)
  end
end
