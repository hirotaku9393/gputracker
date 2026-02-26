require "test_helper"

class AmazonPaapiClientTest < ActiveSupport::TestCase
  def setup
    ENV["AMAZON_ACCESS_KEY"] ||= "test_access_key"
    ENV["AMAZON_SECRET_KEY"] ||= "test_secret_key"
    ENV["AMAZON_PARTNER_TAG"] ||= "test_partner_tag"
    @client = AmazonPaapiClient.new
  end

  # --- fetch_price ---

  test "fetch_price returns price and image_url on success" do
    response_body = {
      "ItemsResult" => {
        "Items" => [
          {
            "Offers" => { "Listings" => [{ "Price" => { "Amount" => "89800" } }] },
            "Images" => { "Primary" => { "Large" => { "URL" => "https://example.com/gpu.jpg" } } }
          }
        ]
      }
    }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN1")
      assert_equal 89800, result[:price]
      assert_equal "https://example.com/gpu.jpg", result[:image_url]
    end
    mock_response.verify
  end

  test "fetch_price returns nil price when no listings" do
    response_body = {
      "ItemsResult" => {
        "Items" => [
          {
            "Offers" => { "Listings" => [] },
            "Images" => { "Primary" => { "Large" => { "URL" => "https://example.com/gpu.jpg" } } }
          }
        ]
      }
    }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN2")
      assert_nil result[:price]
    end
    mock_response.verify
  end

  test "fetch_price returns nil when response is not successful" do
    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, false)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN3")
      assert_nil result
    end
    mock_response.verify
  end

  test "fetch_price returns nil when no items in response" do
    response_body = { "ItemsResult" => { "Items" => [] } }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN4")
      assert_nil result
    end
    mock_response.verify
  end

  test "fetch_price returns nil when ItemsResult is missing" do
    response_body = { "Errors" => [{ "Code" => "ItemNotAccessible" }] }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN5")
      assert_nil result
    end
    mock_response.verify
  end

  test "fetch_price handles item with price but no image" do
    response_body = {
      "ItemsResult" => {
        "Items" => [
          {
            "Offers" => { "Listings" => [{ "Price" => { "Amount" => "50000" } }] },
            "Images" => {}
          }
        ]
      }
    }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN6")
      assert_equal 50000, result[:price]
      assert_nil result[:image_url]
    end
    mock_response.verify
  end

  test "fetch_price handles item with no Listings key" do
    response_body = {
      "ItemsResult" => {
        "Items" => [
          {
            "Offers" => {},
            "Images" => { "Primary" => { "Large" => { "URL" => "https://example.com/gpu.jpg" } } }
          }
        ]
      }
    }.to_json

    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, true)
    mock_response.expect(:body, response_body)

    Faraday.stub(:post, ->(_url, &_block) { mock_response }) do
      result = @client.fetch_price("B0TESTASIN8")
      assert_nil result[:price]
      assert_not_nil result[:image_url]
    end
    mock_response.verify
  end

  # --- sign_request (indirectly tested via fetch_price) ---

  test "fetch_price generates valid authorization headers" do
    captured_headers = nil
    mock_response = Minitest::Mock.new
    mock_response.expect(:success?, false)

    stub_post = lambda do |_url, &block|
      req = Object.new
      def req.headers; @headers ||= {}; end
      def req.headers=(val); @headers = val; end
      def req.body=(val); end
      block.call(req)
      captured_headers = req.headers
      mock_response
    end

    Faraday.stub(:post, stub_post) do
      @client.fetch_price("B0TESTASIN7")
    end

    assert_not_nil captured_headers
    assert captured_headers.key?("Authorization") || captured_headers.key?("x-amz-date")
    mock_response.verify
  end
end
