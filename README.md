# Manifestation Research · 顯化研究文獻周報

> 每週自動從 PubMed 搜尋顯化（Manifestation）相關研究文獻，由 NVIDIA Nemotron 3 Super 分析整理成繁體中文週報。

🌐 **線上瀏覽：** https://u8901006.github.io/Manifestation-Research/

---

## 研究範圍

本計畫追蹤「顯化」及相關心理機制的學術研究，涵蓋：

| 領域 | 涵蓋主題 |
|------|---------|
| 直接顯化論述 | manifestation、law of attraction、vision board、New Thought |
| 心理機制 | 期望效應、安慰劑、自我效能、樂觀、目標設定、心智意象 |
| 認知偏誤 | 確認偏誤、自我實現預言、想像膨脹、動機推理 |
| 臨界臨床概念 | 魔術性思考、思想-行動融合、幻覺控制 |
| 神經科學 | 預測處理、主動推理、回饋預測、預設模式網絡 |
| 社會文化 | 靈性、New Age、繁盛福音、演算法文化、幸福感 |
| 實證方法 | 隨機對照試驗、縱貫研究、系統性回顧、後設分析 |

## 技術架構

```
PubMed E-utilities  →  Node.js 24  →  NVIDIA Nemotron 3 Super  →  GitHub Pages
   (搜尋文獻)          (去重+篩選)      (AI 分析+分類)            (靜態部署)
```

- **排程：** 每週日 台北時間 05:55（UTC 週六 21:55）
- **資料來源：** PubMed E-utilities API
- **AI 模型：** NVIDIA Nemotron 3 Super（fallback: Nemotron 3 Nano）
- **Token 上限：** 50,000
- **API 逾時：** 480 秒
- **去重機制：** `data/seen-papers.json` 記錄所有已總結的 PMID，每週僅處理新文獻

## 搜尋策略

共 10 組 PubMed 查詢，涵蓋不同面向：

1. 直接顯化論述（manifestation, law of attraction, vision board）
2. 期望與安慰劑（response expectancy, placebo effect, meaning response）
3. 心智意象與目標追求（mental imagery, visualization, mental rehearsal）
4. 正向幻想與心理對比（positive fantasies, mental contrasting, WOOP）
5. 魔術性思考與精神病理（magical thinking, thought-action fusion）
6. 預測處理與信念（predictive processing, active inference, Bayesian brain）
7. 樂觀與自我效能（optimism, hope theory, self-efficacy, growth mindset）
8. 靈性與心理健康（spirituality, prayer, prosperity gospel）
9. 認知偏誤與信念形成（confirmation bias, self-fulfilling prophecy）
10. 肯定語與自我對話（self-affirmation, affirmations, positive thinking）

## 本地開發

```bash
# 安裝（無外部依賴，僅需 Node.js 22+）
node scripts/fetch-papers.mjs --days 21 --max-papers 60
node scripts/generate-report.mjs --input papers.json
node scripts/generate-index.mjs
```

### 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `NVIDIA_API_KEY` | NVIDIA API 金鑰（**必填**） | — |
| `NVIDIA_API_BASE` | NVIDIA API 端點 | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_TIMEOUT_MS` | API 逾時（毫秒） | `480000` |
| `NVIDIA_MAX_TOKENS` | 最大 token 數 | `16384` |
| `NVIDIA_MODELS` | 模型 fallback 鏈 | `nvidia/nemotron-3-super-120b-a12b,nvidia/nemotron-3-nano-30b-a3b` |
| `NCBI_API_KEY` | NCBI API 金鑰（可選，提升速率） | — |

## 相關連結

- 🏥 [李政洋身心診所](https://www.leepsyclinic.com/)
- 📩 [訂閱電子報](https://blog.leepsyclinic.com/)
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/CYlee)

## 授權

程式碼採用 MIT 授權。文獻摘要內容由 AI 生成，僅供學術參考，原始論文版權歸各出版商所有。
