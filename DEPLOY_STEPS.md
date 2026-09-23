# P04 V3.0 完整部署步驟

## Step 1 — SQL
Supabase Dashboard → SQL Editor，執行 `sql_setup.sql`。
本版不刪除既有 P04 資料。

## Step 2 — Edge Functions
在 Supabase Dashboard → Edge Functions 逐一確認／更新：
1. `P04_submit_smile_event`
2. `P04_get_home_stats`
3. `P04_get_records_by_date`
4. `P04_get_recent_notice`
5. `P04_get_my_records`

請使用 ZIP 內各 Function 資料夾的完整 `index.ts`。

## Step 3 — Secrets
確認 Edge Functions 可取得 `SUPABASE_SERVICE_ROLE_KEY`。
不要把 service role key 放到前端。

## Step 4 — config.js
ZIP 只提供 `config-sample.js`，避免覆蓋正式設定。

請保留您目前正式的 `config.js`，但一定要確認：

```javascript
SITE_URL: 'https://bagilu.github.io/P04/'
```

並確認 FUNCTIONS 五個 URL 都指向目前 Supabase Project。

## Step 5 — GitHub Pages
將 V3.0 前端檔案覆蓋到 P04 repository。
不要刪除您正式的 `config.js`。

正式網址：
`https://bagilu.github.io/P04/`

## Step 6 — 強制重新整理
Windows：`Ctrl + F5`
手機：關閉舊頁籤後重新開啟。

## Step 7 — V3.0 驗收流程

### A. 首頁
首頁不應再出現「首次使用請掃描」的網站入口 QR Code。

應看到兩個主要操作：
- 掃描對方的微笑碼
- 我的微笑碼

### B. 我的微笑碼
打開後 QR Code 應編碼：
`https://bagilu.github.io/P04/?to=自己的帳號&name=自己的暱稱`

不再只是校園 Email。

### C. 已設定使用者
A 打開自己的微笑碼 → B 掃 A → B 應直接看到「你正在回應 A」→ 點選微笑／問候／鼓勵／幫助 → 完成。

### D. 第一次使用者
B 尚未設定資料 → 掃 A 的微笑碼 → P04 先要求 B 設定帳號與暱稱 → 儲存後直接顯示 A 的回應選項 → 不需要重新掃 A。

### E. 個人紀錄
首頁下方應保留：
- 前10名微笑王
- 前10名回應王
- 我的微笑紀錄（每頁10筆）
- 我的回應紀錄（每頁10筆）
