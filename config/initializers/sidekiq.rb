Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0") }

  config.on(:startup) do
    schedule = {
      "fetch_gpu_prices" => {
        "cron" => "0 21 * * *", # 6:00 AM JST (UTC+9)
        "class" => "FetchGpuPricesJob",
        "queue" => "default"
      }
    }
    Sidekiq::Cron::Job.load_from_hash(schedule)
  end
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0") }
end
