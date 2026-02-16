#!/usr/bin/env bash
set -o errexit

bundle install
yarn install

# JS/CSS ビルド
yarn build
yarn build:css

# Rails アセット
bundle exec rails assets:precompile

# DB
bundle exec rails db:migrate

# 初回のみシードデータ投入（GPUが0件の場合）
bundle exec rails runner "FetchGpuPricesJob rescue nil; exit(Gpu.count == 0 ? 0 : 1)" 2>/dev/null && bundle exec rails db:seed || echo "Seed skipped (data exists)"
