class FetchGpuPricesJob
  include Sidekiq::Job

  def perform
    client = AmazonPaapiClient.new
    gpus = Gpu.where.not(amazon_asin: nil)

    gpus.find_each do |gpu|
      begin
        result = client.fetch_price(gpu.amazon_asin)

        if result && result[:price]
          gpu.price_histories.create!(
            price: result[:price],
            recorded_at: Time.current
          )

          gpu.update!(image_url: result[:image_url]) if result[:image_url].present?
        end

        sleep 1 # PA-API レート制限対応
      rescue => e
        Rails.logger.error("GPU価格取得失敗 [#{gpu.name}]: #{e.message}")
      end
    end
  end
end
