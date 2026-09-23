# P04 V2.9 完整版部署步驟

本版不是補丁包，已整合新版首頁、溫暖快樂風格，以及「我的微笑紀錄／我的回應紀錄」。

## 1. 執行 SQL
Supabase Dashboard → SQL Editor → New Query，執行 `sql_setup.sql`。本 SQL 不刪除舊資料。

## 2. Edge Functions
確認或更新：
- P04_submit_smile_event
- P04_get_home_stats
- P04_get_records_by_date
- P04_get_recent_notice
- P04_get_my_records

Dashboard 中以 ZIP 內各 Function 的 `index.ts` 內容 Deploy。

## 3. config.js
ZIP 故意只提供 `config-sample.js`。請保留 GitHub 上目前可工作的正式 `config.js`，不要覆蓋。
並確認 FUNCTIONS 至少有：
`GET_RECENT_NOTICE` → `/functions/v1/P04_get_recent_notice`
`GET_MY_RECORDS` → `/functions/v1/P04_get_my_records`

## 4. GitHub Pages
將本版前端檔案覆蓋到 P04 repository，但保留正式 `config.js`。

## 5. 強制重新整理
Windows：Ctrl + F5。手機可關閉頁籤再重開。

## 6. 驗收
首頁應看到：
- P04 微笑漣漪
- 慈濟大學 經營管理學系 好玩實驗室 作品
- TCU Smile Ripple
- 新版「點頭微笑」文案
- 前10名微笑王 / 前10名回應王
- 我的微笑紀錄 / 我的回應紀錄（每頁10筆）

## 正式 GitHub Pages 網址
本版正式網址：

`https://bagilu.github.io/P04/`

部署後請以此網址驗收。若 Supabase Auth / Redirect URL、Edge Function CORS 白名單、QR Code 或任何固定網址設定曾使用舊網址，也請同步改成此網址。
