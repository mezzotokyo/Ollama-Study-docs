# Ollama + OpenCode 運用メモ（設計インプット）

## 概要

OpenCode からリモート Ollama を利用する構成について、Keep Alive、KV キャッシュ、Gemma 4 と Qwen 3.5 の役割分担、および推奨パラメータを整理した。

> 最新のモデル名・パラメータ・運用フローは [モデル構成（Ollama Models）](../setup/ollama-models.md) を正とします。本書は設計判断の背景メモです。

---

## Ollama Keep Alive

LaunchDaemon (`/Library/LaunchDaemons/com.ollama.serve.plist`) にて以下を設定。

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>HOME</key>
    <string>/Users/ta000</string>

    <key>OLLAMA_HOST</key>
    <string>0.0.0.0:11434</string>

    <key>OLLAMA_KEEP_ALIVE</key>
    <string>24h</string>
</dict>
```

### 目的

- モデルの再ロード時間を削減
- GPU/VRAM 上へモデルを保持
- OpenCode からの再接続時の応答速度向上

### 補足

- `KeepAlive=true` は Ollama プロセスの自動再起動
- `OLLAMA_KEEP_ALIVE=24h` はモデル保持期間
- 両者は役割が異なる

> **Configuration Note:** The example plist configuration contains a local user path (`/Users/ta000`). Please update this to match your environment before deploying the LaunchDaemon.

---

## KV キャッシュ肥大化問題

### 症状

長時間 OpenCode を利用すると:

- TTFT の悪化
- 推論速度低下
- レスポンス開始遅延
- GPU メモリ消費増大

### 原因

Keep Alive よりも以下の影響が大きい。

```text
会話履歴
+ ソースコード
+ RAG結果
+ diff
+ ツール出力
```

が継続的にコンテキストへ蓄積される。

### 推奨対策

1. OpenCode の新規チャット開始
2. num_ctx を縮小
3. 必要時のみ大コンテキストモデル使用
4. Ollama 再起動は最終手段

---

## Gemma 4 設定

### 現在の構成

```text
Model: Gemma 4 12.4B
Quantization: NVFP4
num_ctx: 65536
thinking: true
temperature: 0.2
```

### 主な用途

- 要求分析
- ユースケース整理
- 上流設計
- ADR 作成
- レビュー
- リファクタリング方針策定

### 特徴

- 指示追従が強い
- 長時間セッションでも方針がぶれにくい
- 保守的だが安定
- レビュー品質が高い

### 推奨

```text
num_ctx=65536
thinking=true
```

設計用途では Think ON を維持。

---

## Qwen 3.5 設定

### 現在の構成

```text
Model: Qwen 3.5 9.4B
Quantization: NVFP4
num_ctx: 65536
thinking: false（ta:engineer。ta:auditor は既定の true）
presence_penalty: 0（ta:engineer のみ OpenCode で指定）
```

### 主な用途

- 初期コード生成
- プロトタイプ作成
- CRUD 実装
- テストコード雛形作成

### 特徴

- 積極的にコードを書く
- 推測ベースの提案が多い
- 実装速度が速い
- 長時間セッションでは品質変動が出やすい

### 推奨

```text
num_ctx=65536
thinking=false
```

高速な実装用モデルとして利用。

---

## Gemma と Qwen の役割分担

### Gemma

```text
考える担当
```

担当領域:

- 要求分析
- 設計
- レビュー
- 品質改善
- リファクタリング

### Qwen

```text
手を動かす担当
```

担当領域:

- コード生成
- サンプル作成
- CRUD 実装
- 単体テスト生成

---

## 推奨モデル構成

### Ethical Architect（Analyst / `ta:architect`）

```text
FROM gemma4:12b-nvfp4
num_ctx=65536
thinking=true
temperature=0.2
```

用途:

- 要件定義
- 基本設計
- 詳細設計
- ADR 作成
- レビュー

### Expert Engineer（Coder / `ta:engineer`）

```text
FROM qwen3.5:9b-nvfp4
num_ctx=65536
thinking=false
temperature=0.0
presence_penalty=0
stop=<|im_end|>, <|endoftext|>
```

用途:

- 実装
- コード生成
- テスト生成

### Technical Auditor（Auditor / `ta:auditor`）

```text
FROM qwen3.5:9b-nvfp4
num_ctx=65536
thinking=true（既定）
temperature=0.0
stop=<|im_end|>, <|endoftext|>
```

用途:

- 設計・ADR との適合性検証
- セキュリティ・プライバシー監査
- 回帰・副作用チェック

### Large Context（任意）

派生モデルは既定で `num_ctx=65536` です。さらに大きなコンテキストが必要な場合のみ、専用の派生モデルを `models/` に追加してください。

---

## 運用方針（推奨）

### フェーズ1: 要求分析

```text
Gemma
Think ON
```

### フェーズ2: 設計書作成

```text
Gemma
Think ON
```

### フェーズ3: 実装開始

```text
Qwen
Think OFF
```

### フェーズ4: 実装拡張

```text
Qwen
Think OFF
```

### フェーズ5: レビュー

```text
Gemma
Think ON
```

### フェーズ6: リファクタリング

```text
Gemma
Think ON
```

---

## 結論

現在の役割分担は非常に合理的である。

推奨構成:

```text
Gemma4
  num_ctx=65536
  thinking=true

Qwen3.5
  num_ctx=65536
  thinking=false
```

調整優先順位:

1. num_ctx
2. thinking
3. モデル選択
4. temperature

性能維持のためにはパラメータ微調整よりも、OpenCode セッションの寿命管理とコンテキスト肥大化の抑制を重視する。
