#!/usr/bin/env bash
set -o errexit

bundle install
yarn install

# JS/CSS ビルド
yarn build
yarn build:css

# Rails アセット
bundle exec rails assets:precompile

# DB: 初回は schema:load、以降は migrate を実行
bundle exec rails db:prepare

# 初回のみシードデータ投入（GPUが0件の場合）
bundle exec rails runner "exit(Gpu.count == 0 ? 0 : 1)" 2>/dev/null && bundle exec rails db:seed || echo "Seed skipped (data exists)"
