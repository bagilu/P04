# P04 微笑漣漪 V3.0 — One Code, One Scan

正式網址：`https://bagilu.github.io/P04/`

## 核心 UX
V3.0 正式採用「一人一碼、一掃到底」。

每個人的「我的微笑碼」內容為：

`https://bagilu.github.io/P04/?to=ACCOUNT&name=NICKNAME`

因此：
- 對方用手機相機掃碼 → 直接進入 P04 回應流程。
- 第一次使用者若尚未設定自己資料 → 先設定 → 原本掃到的對象仍保留 → 不需再掃。
- 已設定使用者 → 掃碼後直接選擇「微笑／問候／鼓勵／幫助」。
- 從首頁主動進站時，才使用「掃描對方的微笑碼」。
- 首頁不再放「進入網站」QR Code。

## 視覺
Sunny Campus / 陽光校園風：
明亮、溫暖、有生命力，但保留大學專題網站需要的乾淨與專業。

## Function
- P04_submit_smile_event
- P04_get_home_stats
- P04_get_records_by_date
- P04_get_recent_notice
- P04_get_my_records

## 設定檔
ZIP 僅提供 `config-sample.js`。
正式部署請保留既有 `config.js`，並確認 `SITE_URL` 已是：
`https://bagilu.github.io/P04/`
