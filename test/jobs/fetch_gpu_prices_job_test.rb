require "test_helper"

class FetchGpuPricesJobTest < ActiveSupport::TestCase
  def setup
    ENV["AMAZON_ACCESS_KEY"] ||= "test_access_key"
    ENV["AMAZON_SECRET_KEY"] ||= "test_secret_key"
    ENV["AMAZON_PARTNER_TAG"] ||= "test_partner_tag"
  end

  test "perform creates price history when price is returned" do
    gpu = gpus(:rtx_4090) # has amazon_asin
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, { price: 50000, image_url: "https://new-img.example.com/gpu.jpg" }, [gpu.amazon_asin])

    AmazonPaapiClient.stub(:new, mock_client) do
      Kernel.stub(:sleep, nil) do
        assert_difference "PriceHistory.count", 1 do
          FetchGpuPricesJob.new.perform
        end
      end
    end

    gpu.reload
    assert_equal 50000, gpu.current_price
    assert_equal "https://new-img.example.com/gpu.jpg", gpu.image_url
    mock_client.verify
  end

  test "perform updates image_url when returned" do
    gpu = gpus(:rtx_4090)
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, { price: 60000, image_url: "https://updated-img.example.com/gpu.jpg" }, [gpu.amazon_asin])

    AmazonPaapiClient.stub(:new, mock_client) do
      Kernel.stub(:sleep, nil) do
        FetchGpuPricesJob.new.perform
      end
    end

    assert_equal "https://updated-img.example.com/gpu.jpg", gpu.reload.image_url
    mock_client.verify
  end

  test "perform does not update image_url when nil" do
    gpu = gpus(:rtx_4090)
    original_image = gpu.image_url
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, { price: 60000, image_url: nil }, [gpu.amazon_asin])

    AmazonPaapiClient.stub(:new, mock_client) do
      Kernel.stub(:sleep, nil) do
        FetchGpuPricesJob.new.perform
      end
    end

    assert_equal original_image, gpu.reload.image_url
    mock_client.verify
  end

  test "perform skips gpu when fetch_price returns nil" do
    gpu = gpus(:rtx_4090)
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, nil, [gpu.amazon_asin])

    AmazonPaapiClient.stub(:new, mock_client) do
      Kernel.stub(:sleep, nil) do
        assert_no_difference "PriceHistory.count" do
          FetchGpuPricesJob.new.perform
        end
      end
    end
    mock_client.verify
  end

  test "perform skips gpu when result has no price" do
    gpu = gpus(:rtx_4090)
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, { price: nil, image_url: nil }, [gpu.amazon_asin])

    AmazonPaapiClient.stub(:new, mock_client) do
      Kernel.stub(:sleep, nil) do
        assert_no_difference "PriceHistory.count" do
          FetchGpuPricesJob.new.perform
        end
      end
    end
    mock_client.verify
  end

  test "perform logs error and continues on exception" do
    gpu = gpus(:rtx_4090)
    mock_client = Minitest::Mock.new
    mock_client.expect(:fetch_price, ->(_asin) { raise StandardError, "API Error" }, [gpu.amazon_asin])

    logged = []
    Rails.logger.stub(:error, ->(msg) { logged << msg }) do
      AmazonPaapiClient.stub(:new, mock_client) do
        Kernel.stub(:sleep, nil) do
          assert_no_difference "PriceHistory.count" do
            FetchGpuPricesJob.new.perform
          end
        end
      end
    end

    assert logged.any? { |m| m.include?("GPU価格取得失敗") }
  end

  test "perform only processes gpus with amazon_asin" do
    # rx_7900_xtx and zero_price_gpu have no amazon_asin
    mock_client = Minitest::Mock.new
    # Only expect one call (rtx_4090)
    mock_client.expect(:fetch_price, { price: 70000, image_url: nil }, [gpus(:rtx_4090).amazon_asin])

    assert_difference "PriceHistory.count", 1 do
      AmazonPaapiClient.stub(:new, mock_client) do
        FetchGpuPricesJob.new.perform
      end
    end
    mock_client.verify
  end
end
