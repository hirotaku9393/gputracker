class AmazonPaapiClient
  ENDPOINT = "https://webservices.amazon.co.jp"
  PATH = "/paapi5/getitems"
  SERVICE = "ProductAdvertisingAPI"
  REGION = "us-west-2"

  def initialize
    @access_key = ENV.fetch("AMAZON_ACCESS_KEY")
    @secret_key = ENV.fetch("AMAZON_SECRET_KEY")
    @partner_tag = ENV.fetch("AMAZON_PARTNER_TAG")
  end

  def fetch_price(asin)
    payload = {
      "ItemIds" => [ asin ],
      "Resources" => [
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "Images.Primary.Large"
      ],
      "PartnerTag" => @partner_tag,
      "PartnerType" => "Associates",
      "Marketplace" => "www.amazon.co.jp"
    }

    headers = sign_request(payload)

    response = Faraday.post("#{ENDPOINT}#{PATH}") do |req|
      req.headers = headers
      req.headers["Content-Type"] = "application/json; charset=utf-8"
      req.body = payload.to_json
    end

    parse_response(response)
  end

  private

  def sign_request(payload)
    now = Time.now.utc
    datestamp = now.strftime("%Y%m%d")
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    body = payload.to_json

    canonical_headers = "content-type:application/json; charset=utf-8\n" \
                        "host:webservices.amazon.co.jp\n" \
                        "x-amz-date:#{amz_date}\n" \
                        "x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n"

    signed_headers = "content-type;host;x-amz-date;x-amz-target"

    payload_hash = Digest::SHA256.hexdigest(body)
    canonical_request = "POST\n#{PATH}\n\n#{canonical_headers}\n#{signed_headers}\n#{payload_hash}"

    credential_scope = "#{datestamp}/#{REGION}/#{SERVICE}/aws4_request"
    string_to_sign = "AWS4-HMAC-SHA256\n#{amz_date}\n#{credential_scope}\n#{Digest::SHA256.hexdigest(canonical_request)}"

    signing_key = get_signature_key(@secret_key, datestamp, REGION, SERVICE)
    signature = OpenSSL::HMAC.hexdigest("SHA256", signing_key, string_to_sign)

    authorization = "AWS4-HMAC-SHA256 Credential=#{@access_key}/#{credential_scope}, " \
                    "SignedHeaders=#{signed_headers}, Signature=#{signature}"

    {
      "Authorization" => authorization,
      "x-amz-date" => amz_date,
      "x-amz-target" => "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      "host" => "webservices.amazon.co.jp"
    }
  end

  def get_signature_key(key, datestamp, region, service)
    k_date = hmac_sha256("AWS4#{key}", datestamp)
    k_region = hmac_sha256(k_date, region)
    k_service = hmac_sha256(k_region, service)
    hmac_sha256(k_service, "aws4_request")
  end

  def hmac_sha256(key, data)
    OpenSSL::HMAC.digest("SHA256", key, data)
  end

  def parse_response(response)
    return nil unless response.success?

    data = JSON.parse(response.body)
    item = data.dig("ItemsResult", "Items")&.first
    return nil unless item

    price_amount = item.dig("Offers", "Listings")&.first&.dig("Price", "Amount")
    image_url = item.dig("Images", "Primary", "Large", "URL")

    {
      price: price_amount ? (price_amount.to_f).to_i : nil,
      image_url: image_url
    }
  end
end
