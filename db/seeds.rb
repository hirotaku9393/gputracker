puts "GPUデータを投入中..."

# AIBパートナー（ボードパートナー）
NVIDIA_PARTNERS = ["ASUS ROG STRIX", "ASUS TUF Gaming", "ASUS DUAL", "MSI SUPRIM X", "MSI GAMING X TRIO", "MSI VENTUS 3X", "GIGABYTE AORUS Master", "GIGABYTE GAMING OC", "GIGABYTE EAGLE OC", "ZOTAC GAMING Trinity", "ZOTAC GAMING AMP", "PALIT GameRock", "PALIT JetStream", "GAINWARD Phantom", "ELSA S.A.C", "Colorful iGame Ultra", "INNO3D iCHILL X3"]
AMD_PARTNERS = ["SAPPHIRE NITRO+", "SAPPHIRE PULSE", "PowerColor Red Devil", "PowerColor Hellhound", "XFX MERC 310", "XFX SWFT 309", "ASRock Taichi", "ASRock Phantom Gaming", "ASUS ROG STRIX", "ASUS TUF Gaming", "MSI GAMING X TRIO", "MSI MECH", "GIGABYTE GAMING OC", "GIGABYTE EAGLE"]
INTEL_PARTNERS = ["ASRock Phantom Gaming", "SPARKLE Titan", "SPARKLE Elf"]

# ベースGPUデータ（リファレンス）
base_gpus = [
  # NVIDIA RTX 50 シリーズ
  { series: "RTX 5090", manufacturer: "NVIDIA", vram: 32, score: 40000, base_price: 398_000, partners: NVIDIA_PARTNERS[0..9] },
  { series: "RTX 5080", manufacturer: "NVIDIA", vram: 16, score: 33000, base_price: 228_000, partners: NVIDIA_PARTNERS[0..11] },
  { series: "RTX 5070 Ti", manufacturer: "NVIDIA", vram: 16, score: 28000, base_price: 168_000, partners: NVIDIA_PARTNERS[0..12] },
  { series: "RTX 5070", manufacturer: "NVIDIA", vram: 12, score: 25000, base_price: 118_000, partners: NVIDIA_PARTNERS[0..13] },

  # NVIDIA RTX 40 シリーズ
  { series: "RTX 4090", manufacturer: "NVIDIA", vram: 24, score: 36000, base_price: 298_000, partners: NVIDIA_PARTNERS[0..9] },
  { series: "RTX 4080 SUPER", manufacturer: "NVIDIA", vram: 16, score: 28500, base_price: 178_000, partners: NVIDIA_PARTNERS[0..10] },
  { series: "RTX 4070 Ti SUPER", manufacturer: "NVIDIA", vram: 16, score: 24500, base_price: 138_000, partners: NVIDIA_PARTNERS[0..12] },
  { series: "RTX 4070 SUPER", manufacturer: "NVIDIA", vram: 12, score: 22000, base_price: 108_000, partners: NVIDIA_PARTNERS[0..12] },
  { series: "RTX 4070", manufacturer: "NVIDIA", vram: 12, score: 18000, base_price: 88_000, partners: NVIDIA_PARTNERS[0..10] },
  { series: "RTX 4060 Ti 16GB", manufacturer: "NVIDIA", vram: 16, score: 15000, base_price: 72_000, partners: NVIDIA_PARTNERS[0..8] },
  { series: "RTX 4060 Ti 8GB", manufacturer: "NVIDIA", vram: 8, score: 14500, base_price: 62_000, partners: NVIDIA_PARTNERS[0..10] },
  { series: "RTX 4060", manufacturer: "NVIDIA", vram: 8, score: 11500, base_price: 45_000, partners: NVIDIA_PARTNERS[0..10] },

  # NVIDIA RTX 30 シリーズ（旧世代・在庫品）
  { series: "RTX 3090 Ti", manufacturer: "NVIDIA", vram: 24, score: 21500, base_price: 198_000, partners: ["ASUS ROG STRIX", "MSI SUPRIM X", "GIGABYTE AORUS Master", "ZOTAC GAMING Trinity"] },
  { series: "RTX 3090", manufacturer: "NVIDIA", vram: 24, score: 20000, base_price: 178_000, partners: ["ASUS TUF Gaming", "MSI GAMING X TRIO", "GIGABYTE GAMING OC", "ZOTAC GAMING AMP", "PALIT GameRock"] },
  { series: "RTX 3080 Ti", manufacturer: "NVIDIA", vram: 12, score: 19000, base_price: 128_000, partners: ["ASUS ROG STRIX", "MSI SUPRIM X", "GIGABYTE AORUS Master", "ZOTAC GAMING Trinity", "PALIT GameRock"] },
  { series: "RTX 3080 10GB", manufacturer: "NVIDIA", vram: 10, score: 17500, base_price: 98_000, partners: ["ASUS TUF Gaming", "MSI VENTUS 3X", "GIGABYTE EAGLE OC", "ZOTAC GAMING Trinity"] },
  { series: "RTX 3070 Ti", manufacturer: "NVIDIA", vram: 8, score: 14800, base_price: 78_000, partners: ["ASUS ROG STRIX", "MSI GAMING X TRIO", "GIGABYTE GAMING OC"] },
  { series: "RTX 3070", manufacturer: "NVIDIA", vram: 8, score: 13500, base_price: 68_000, partners: ["ASUS DUAL", "MSI VENTUS 3X", "GIGABYTE EAGLE OC", "ZOTAC GAMING AMP"] },
  { series: "RTX 3060 Ti", manufacturer: "NVIDIA", vram: 8, score: 12000, base_price: 52_000, partners: ["ASUS TUF Gaming", "MSI GAMING X TRIO", "GIGABYTE GAMING OC", "PALIT JetStream"] },
  { series: "RTX 3060 12GB", manufacturer: "NVIDIA", vram: 12, score: 9000, base_price: 42_000, partners: ["ASUS DUAL", "MSI VENTUS 3X", "GIGABYTE EAGLE OC", "ZOTAC GAMING AMP", "PALIT JetStream"] },

  # AMD RX 9000 シリーズ
  { series: "RX 9070 XT", manufacturer: "AMD", vram: 16, score: 24000, base_price: 108_000, partners: AMD_PARTNERS[0..7] },
  { series: "RX 9070", manufacturer: "AMD", vram: 16, score: 21000, base_price: 88_000, partners: AMD_PARTNERS[0..7] },

  # AMD RX 7000 シリーズ
  { series: "RX 7900 XTX", manufacturer: "AMD", vram: 24, score: 26000, base_price: 148_000, partners: AMD_PARTNERS[0..7] },
  { series: "RX 7900 XT", manufacturer: "AMD", vram: 20, score: 22500, base_price: 118_000, partners: AMD_PARTNERS[0..7] },
  { series: "RX 7900 GRE", manufacturer: "AMD", vram: 16, score: 20000, base_price: 88_000, partners: AMD_PARTNERS[0..5] },
  { series: "RX 7800 XT", manufacturer: "AMD", vram: 16, score: 18500, base_price: 75_000, partners: AMD_PARTNERS[0..9] },
  { series: "RX 7700 XT", manufacturer: "AMD", vram: 12, score: 15500, base_price: 62_000, partners: AMD_PARTNERS[0..7] },
  { series: "RX 7600 XT", manufacturer: "AMD", vram: 16, score: 11500, base_price: 48_000, partners: AMD_PARTNERS[0..5] },
  { series: "RX 7600", manufacturer: "AMD", vram: 8, score: 10500, base_price: 38_000, partners: AMD_PARTNERS[0..7] },

  # AMD RX 6000 シリーズ（旧世代）
  { series: "RX 6950 XT", manufacturer: "AMD", vram: 16, score: 18000, base_price: 98_000, partners: ["SAPPHIRE NITRO+", "PowerColor Red Devil", "XFX MERC 310", "ASRock Phantom Gaming"] },
  { series: "RX 6800 XT", manufacturer: "AMD", vram: 16, score: 15500, base_price: 72_000, partners: ["SAPPHIRE NITRO+", "PowerColor Red Devil", "ASUS ROG STRIX", "MSI GAMING X TRIO"] },
  { series: "RX 6800", manufacturer: "AMD", vram: 16, score: 14000, base_price: 62_000, partners: ["SAPPHIRE PULSE", "PowerColor Hellhound", "ASRock Phantom Gaming"] },
  { series: "RX 6750 XT", manufacturer: "AMD", vram: 12, score: 12000, base_price: 48_000, partners: ["SAPPHIRE NITRO+", "PowerColor Red Devil", "XFX SWFT 309"] },
  { series: "RX 6700 XT", manufacturer: "AMD", vram: 12, score: 11000, base_price: 42_000, partners: ["SAPPHIRE PULSE", "PowerColor Hellhound", "MSI MECH", "GIGABYTE EAGLE"] },
  { series: "RX 6650 XT", manufacturer: "AMD", vram: 8, score: 9500, base_price: 32_000, partners: ["SAPPHIRE PULSE", "PowerColor Hellhound", "XFX SWFT 309"] },

  # Intel Arc
  { series: "Arc B580", manufacturer: "Intel", vram: 12, score: 12000, base_price: 38_000, partners: INTEL_PARTNERS + ["ASUS DUAL", "MSI GAMING X TRIO"] },
  { series: "Arc A770 16GB", manufacturer: "Intel", vram: 16, score: 13000, base_price: 42_000, partners: INTEL_PARTNERS + ["ASUS ROG STRIX"] },
  { series: "Arc A750", manufacturer: "Intel", vram: 8, score: 10500, base_price: 28_000, partners: INTEL_PARTNERS },
  { series: "Arc A580", manufacturer: "Intel", vram: 8, score: 8500, base_price: 24_000, partners: ["ASRock Phantom Gaming", "SPARKLE Elf"] },
]

count = 0
total_histories = 0

base_gpus.each do |base|
  base[:partners].each do |partner|
    name = "#{partner} #{base[:manufacturer]} #{base[:series]}"

    # パートナーごとの価格差（OC版は高め、エントリー版は安め等）
    price_modifier = case partner
                     when /ROG STRIX|SUPRIM|AORUS Master|NITRO\+|Red Devil|Taichi|iGame Ultra|iCHILL/
                       rand(1.08..1.20)
                     when /TUF Gaming|GAMING X|GameRock|Phantom Gaming|MERC/
                       rand(1.03..1.10)
                     when /DUAL|VENTUS|EAGLE|PULSE|Hellhound|SWFT|MECH|JetStream|Elf/
                       rand(0.95..1.03)
                     else
                       rand(0.98..1.05)
                     end

    adjusted_price = (base[:base_price] * price_modifier).round

    # スコアも微調整（OC版は少し高い）
    score_modifier = case partner
                     when /ROG STRIX|SUPRIM|AORUS Master|NITRO\+|Red Devil|iCHILL/
                       rand(1.01..1.04)
                     else
                       rand(0.98..1.01)
                     end
    adjusted_score = (base[:score] * score_modifier).round

    asin = "B0#{SecureRandom.hex(5).upcase}"

    gpu = Gpu.find_or_create_by!(name: name) do |g|
      g.manufacturer = base[:manufacturer]
      g.series = base[:series]
      g.vram = base[:vram]
      g.benchmark_score = adjusted_score
      g.amazon_asin = asin
    end

    next if gpu.price_histories.exists?

    # 過去30日分の価格履歴
    30.downto(0) do |days_ago|
      variation = rand(-0.05..0.05)
      price = (adjusted_price * (1 + variation)).round
      gpu.price_histories.create!(
        price: price,
        recorded_at: days_ago.days.ago.beginning_of_day
      )
      total_histories += 1
    end

    count += 1
    print "\r  #{count}件目: #{name}"
  end
end

puts ""
puts "#{Gpu.count}件のGPUデータを投入しました"
puts "#{PriceHistory.count}件の価格履歴を作成しました"
