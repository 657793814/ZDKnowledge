# 🎙️ 知识动力 TTS 文本朗诵方案

> 方案文档 · 最后更新：2026-07-22
> 状态：**全部实现 ✅**

---

## 一、需求场景

| 场景 | 内容 | 优先级 | 状态 |
|------|------|:------:|:----:|
| **知识点详情页** | 核心定义、要点、公式、例题、策略、易错点 | 🔴 P0 | ✅ |
| **随堂练习** | 题目 + 选项 + 答案解析 + AI 深度解析 | 🔴 P0 | ✅ |
| **AI 导师回答** | AI 对问题的解答 | 🟡 P1 | ✅ |
| **错题本** | 错题题目 + 正确答案 + 解析 | 🟡 P1 | ✅ |
| **学习统计** | AI 学习建议 | 🟡 P1 | ✅ |
| **知识图谱节点** | 节点名称 / 摘要 | 🟢 P2 | 📋 可选 |
| **搜索结果** | 摘要朗读 | 🟢 P2 | 📋 可选 |

---

## 二、方案选型

| 方案 | 原理 | 中文效果 | 费用 | 离线 | 延迟 | 状态 |
|------|------|:--------:|:----:|:----:|:----:|:----:|
| **Web Speech API** | 浏览器原生 `SpeechSynthesisUtterance` | ⭐⭐⭐ | 免费 | ✅ | 极低 | ✅ 兜底 |
| **Edge TTS** | 微软 Azure 免费接口（后端代理） | ⭐⭐⭐⭐⭐ | 免费 | ❌ | 低 | ✅ 主力 |
| **Math-to-Speech** | 公式转自然语言预处理 | ⭐⭐⭐⭐ | — | — | — | ✅ P3 |

---

## 三、架构

```
┌──────────────────────────────────────────────────────────────┐
│                  前端 (React)                                  │
│  ┌────────────────────┐    ┌──────────────────────────────┐  │
│  │ TTSButton           │───▶│  useTTS Hook (双引擎)        │  │
│  │ TTSSectionFloating  │    │  ┌────────────┐             │  │
│  │   Button            │    │  │ Edge TTS   │ ← ← + fetch │  │
│  └────────────────────┘    │  │ (优先)     │              │  │
│                             │  ├────────────┤             │  │
│  数学预处理器                │  │ Web Speech │ (降级)      │  │
│  mathToSpeech.ts ──────────▶│  └────────────┘             │  │
│                            └──────────────────────────────┘  │
│                                                              │
│  集成页面：KnowledgeDetail / PracticePage / AiChatPanel       │
│           WrongBookPage / StatsPage                           │
└──────────────────────┬───────────────────────────────────────┘
                       │ POST /api/tts
                       ▼
┌──────────────────────────────────────────────────────────────┐
│            后端 (Express :3001)                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  routes/tts.ts                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────┐        │  │
│  │  │ edge-tts CLI     │  │ TTSCache (LRU 200)   │        │  │
│  │  │ → audio/mpeg     │  │ 同文本不重复生成      │        │  │
│  │  └─────────────────┘  └──────────────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 四、引擎策略

### 优先级：Edge TTS > Web Speech API

```
speak(text)
  ├── Engine = 'edge'  │ 'auto'
  │   ├── mathToSpeech(text) → 公式预处理
  │   ├── POST /api/tts → edge-tts → audio/mpeg
  │   ├── ✅ 成功 → <audio> 播放
  │   └── ❌ 失败 → 降级 Web Speech API（auto 模式）
  │
  └── Engine = 'webspeech'
      └── mathToSpeech(text) → SpeechSynthesisUtterance
```

- **在线时**：Edge TTS 自动启用，音质极好，支持多语音
- **离线时**：请求失败，自动降级到 Web Speech API，零中断

---

## 五、文件清单

### 后端

| 文件 | 说明 |
|------|------|
| `node-server/src/routes/tts.ts` | POST /tts → edge-tts CLI，GET /tts/voices |
| `node-server/src/utils/ttsCache.ts` | LRU 缓存（200 条），防重复生成 |
| — `node-server/src/index.ts` | 注册 `/tts` 路由 |

### 前端

| 文件 | 说明 |
|------|------|
| `web/src/hooks/useTTS.ts` | 双引擎核心 Hook（自动降级） |
| `web/src/utils/mathToSpeech.ts` | 数学公式→中文朗读预处理 |
| `web/src/utils/stripHtml.ts` | HTML 标签剥离（保留 $...$） |
| `web/src/api/tts.ts` | fetch TTS API（原生 fetch） |
| `web/src/components/TTS/TTSButton.tsx` | 🔊/⏹ 切换按钮组件 |
| `web/src/components/TTS/index.ts` | 组件导出 |
| — `web/src/components/index.ts` | 注册导出 |

### 集成页面

| 页面 | 集成点 |
|------|--------|
| `KnowledgeDetail.tsx` | 标题旁全文朗读 + 每节右上角悬浮按钮 |
| `PracticePage.tsx` | 每道题 + 每题解析结果 + AI 深度解析 |
| `AiChatPanel.tsx` | 每条 AI 回复气泡下方 |
| `WrongBookPage.tsx` | 每条错题卡片（题目+答案+解析） |
| `StatsPage.tsx` | AI 学习建议文本 |

---

## 六、文本处理流程

### 6.1 提取流程

```
Section 原始数据
  │  extractSectionText()
  │  收集 content / formulas / items / steps / result / solution
  ├──▶ stripHtml()          // 去掉 HTML 标签，保留 $...$
  ├──▶ 组合为纯文本
  └──▶ speak(text)
        ├──▶ mathToSpeech()  // LaTeX → 自然语言
        └──▶ Edge TTS / Web Speech
```

### 6.2 Math-to-Speech 转化示例

| LaTeX | 朗读文本 |
|-------|----------|
| `$x^2$` | x 的平方 |
| `$\frac{a}{b}$` | a 分之 b |
| `$\sqrt{x}$` | 根号 x |
| `$\sum_{i=1}^n$` | 求和 i 等于 1 到 n |
| `$\alpha > \beta$` | 阿尔法 大于 贝塔 |
| `$\int f(x) dx$` | 积分 f x d x |
| `$\sin \theta$` | 正弦 西塔 |
| `$a \neq 0$` | a 不等于 0 |

---

## 七、后端 API

### POST /api/tts

将文本合成为 MP3 音频。

**Request:**
```json
{
  "text": "要朗读的文本",
  "voice": "zh-CN-XiaoxiaoNeural",   // 可选，默认晓晓
  "rate": 1.0                         // 可选，0.5~2.0
}
```

**Response:** `audio/mpeg` 二进制流

**Headers:** `X-TTS-Cache: hit | miss`

### GET /api/tts/voices

返回支持的中文语音列表。

**Response:**
```json
[
  { "voice": "zh-CN-XiaoxiaoNeural", "label": "晓晓（女）" },
  { "voice": "zh-CN-YunxiNeural", "label": "云希（男）" },
  ...
]
```

---

## 八、Tauri 桌面端

- Web Speech API 在 Tauri WebView 中同样可用，无需额外改动
- Edge TTS 请求走 HTTP，生产环境后端运行在 `localhost:3001`
- macOS 下 Web Speech API 引擎 = NSSpeechSynthesizer
- 不强求 Rust 侧集成 `tts` crate（不增加编译复杂度）

---

## 九、方案优势

| 维度 | 评价 |
|------|------|
| **成本** | 零元（Web Speech 免费 + Edge TTS 免费） |
| **覆盖** | 5 个场景页面，43 个组件实例 |
| **在线效果** | Edge TTS 行业顶级（微软 Azure 引擎） |
| **离线能力** | Web Speech API 自动降级 |
| **公式朗读** | 120+ 数学符号映射，自然中文表达 |
| **可扩展** | TTSButton 可在任意页面复用 |
