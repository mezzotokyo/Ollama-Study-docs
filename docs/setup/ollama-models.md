# Ollama モデル構成（統合）

最終更新: 2026-11-07
対象環境: TA-MBAir.local:11434（Ollama v0.40.15 / macOS + Apple Silicon MLX）
対象リポジトリ: `/Users/shin1/Dev/Ollama_Study`

## 1. 概要

本書は、OpenCode から利用する Ollama モデルの現在の構成・用途・作成手順を統合したものです。
ベースモデルは必要最小限とし、用途別に `models/*.modelfile` で派生モデル（ペルソナ）を作成しています。

- OpenCode 設定（Source of Truth）: `opencode.json`
- ペルソナ定義（Modelfile）: `models/*.modelfile`

## 2. 現在の構成（TA-MBAir.local）

### ベースモデル

```text
gemma4:12b-nvfp4      (base) - Ethical Architect のベース
qwen3.5:9b-nvfp4      (base) - Expert Engineer / Technical Auditor のベース
```

### 派生モデル（ペルソナ）

```text
ta:architect   (Analyst) - 設計・レビュー・ADR・倫理分析
ta:engineer    (Coder)   - 実装・テスト生成・リファクタ
ta:auditor     (Auditor) - 検証・セキュリティ監査・品質保証
```

### 用途別パラメータ

| モデル名 | 用途 | ベース | num_ctx | temperature | その他 | 備考 |
|---|---|---|---|---|---|---|
| ta:architect | Analyst（設計・レビュー・ADR・倫理分析） | gemma4:12b-nvfp4 | 65536 | 0.2 | SYSTEM プロンプト | 既定モデル。5 視点分析と倫理リスクの早期指摘を担当 |
| ta:engineer | Coder（実装・コード生成・テスト生成・リファクタ） | qwen3.5:9b-nvfp4 | 65536 | 0.0 | stop `<\|im_end\|>`, `<\|endoftext\|>` | OpenCode 側で `think: false`, `presence_penalty: 0` を指定 |
| ta:auditor | Auditor（検証・セキュリティ監査・品質保証） | qwen3.5:9b-nvfp4 | 65536 | 0.0 | stop `<\|im_end\|>`, `<\|endoftext\|>` | 敵対的レビュー、ADR 適合性の確認を担当 |

## 3. ペルソナ定義（Modelfile の SYSTEM プロンプト概要）

### ta:architect（Analyst / 設計・倫理）

- 役割: Senior Software Architect and Ethical Strategist（開発プロセスの「良心」）
- 倫理方針: プライバシー・バイアス・アクセシビリティ・社会的影響のリスクを先回りして指摘する
- 5 視点分析: Functional / User Experience / Business / Organizational / Social・Legal
- 運用ルール:
  - Why before How（技術案より先に理由を説明する）
  - ADR（Architecture Decision Record）の主執筆者
  - 要求に潜む技術的・倫理的複雑性を必ず指摘する
  - 箇条書きと Mermaid 図を用いた構造化された分析

### ta:engineer（Coder / 実装）

- 役割: Expert Software Engineer（Analyst の設計を高品質なコードへ変換する専門家）
- 運用ルール:
  - ADR の厳守（設計変更が必要なら停止し、再分析を要求する）
  - Test-First（機能追加・不具合修正には必ずテストを添付する）
  - クリーンコード（可読性・命名規則・モジュール性を優先する）
  - 簡潔な報告（コード・変更点の要約・実行したテストの確認）
  - 技術的ブロッカーや依存問題は即時報告し、推測で修正しない
- 主なタスク: 機能実装 / 単体・結合テスト生成 / 不具合修正・リファクタ / コード変換・移行

### ta:auditor（Auditor / 検証・監査）

- 役割: Senior Quality Assurance and Security Auditor（本番環境の「門番」）
- 検証の原則: 実装が承認済み設計と一致し、安全基準を満たすことを敵対的に検証する
- 検証基準:
  - Functional Accuracy（ADR・設計どおりに動作するか）
  - UX Consistency（意図したユーザーフローと一致するか）
  - Security & Privacy（データ漏洩・安全でないエンドポイント・プライバシー侵害がないか）
  - Side-Effect Analysis（回帰・副次的な破壊がないか）
  - Code Quality（クリーンで保守可能かつ高性能か）
- 運用ルール:
  - ADR から逸脱したコードは却下する
  - すべての機能に対応するテストがあることを確認する
  - Pass/Fail・具体的な指摘・必要な修正を簡潔に報告する
  - 不明点は推測せず確認を求める

## 4. OpenCode 設定

設定ファイル: `/Users/shin1/Dev/Ollama_Study/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama (TA-MBAir)",
      "options": {
        "baseURL": "http://TA-MBAir.local:11434/v1"
      },
      "models": {
        "ta:architect": {
          "name": "Ethical Architect (Analysis)",
          "limit": {
            "context": 65536,
            "output": 8192
          }
        },
        "ta:auditor": {
          "name": "Technical Auditor (Review)",
          "limit": {
            "context": 65536,
            "output": 8192
          }
        },
        "ta:engineer": {
          "name": "Expert Engineer (Coding)",
          "limit": {
            "context": 65536,
            "output": 8192
          },
          "options": {
            "num_ctx": 65536,
            "think": false,
            "temperature": 0,
            "presence_penalty": 0
          }
        }
      }
    }
  },
  "model": "ta:architect"
}
```

### 設定のポイント

- 既定モデルは `ta:architect`（分析・設計フェーズを先に通す）
- 3 モデルともコンテキストは 65536、最大出力は 8192
- `ta:engineer` のみ `think: false`（Qwen の思考抑制を OpenCode 側で制御）
- モデル名は `ta:` 名前空間で統一し、Ollama 上の派生モデル名と一致させる

## 5. 派生モデル作成手順（TA-MBAir.local）

TA-MBAir.local 上の `ta:*` モデルは、`models/` の以下の Modelfile から作成します。

| モデル名 | Modelfile |
|---|---|
| `ta:architect` | `models/architect.modelfile` |
| `ta:engineer` | `models/engineer.modelfile` |
| `ta:auditor` | `models/auditor.modelfile` |

```bash
cd /Users/shin1/Dev/Ollama_Study

ollama create ta:architect -f models/architect.modelfile
ollama create ta:engineer  -f models/engineer.modelfile
ollama create ta:auditor   -f models/auditor.modelfile
```

作成後の確認:

```bash
ollama list
ollama show ta:architect
ollama show ta:engineer
ollama show ta:auditor
```

再作成（Modelfile 変更時）は同じ `ollama create` を再実行します。ベースモデルの重みを共有するため、追加のディスク消費はほとんどありません。

### Modelfile の内容

```dockerfile
# models/architect.modelfile
FROM gemma4:12b-nvfp4
PARAMETER temperature 0.2
PARAMETER num_ctx 65536
SYSTEM """..."""   # 倫理戦略家・5 視点分析・ADR 主執筆

# models/engineer.modelfile
FROM qwen3.5:9b-nvfp4
PARAMETER temperature 0.0
PARAMETER num_ctx 65536
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
SYSTEM """..."""   # ADR 厳守・Test-First・クリーンコード

# models/auditor.modelfile
FROM qwen3.5:9b-nvfp4
PARAMETER temperature 0.0
PARAMETER num_ctx 65536
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
SYSTEM """..."""   # 敵対的検証・セキュリティ監査・Pass/Fail 報告
```

### stop パラメータについて

`ta:engineer` と `ta:auditor` の以下の 2 行は「停止トークン（Stop Sequences）」を定義しています（同一の Qwen 3.5 ベースのため共通）。

```dockerfile
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
```

- モデルが `<|im_end|>` または `<|endoftext|>` を生成した時点で出力を終了させる
- 応答終了後の余計な生成（自問自答・重複・幻覚的な続き）を防ぐ
- Qwen 系の指示追従フォーマットにおける標準的な終端トークンであり、出力をアプリケーションへ正確に返すために必要

## 6. 運用方針（ワークフロー）

| フェーズ | モデル | 備考 |
|---|---|---|
| 要求分析・設計・ADR・倫理レビュー | ta:architect | Think ON（既定）。まずここを通す |
| 実装・コード生成・テスト生成 | ta:engineer | Think OFF（`options.think: false`）。ADR に厳密に従う |
| 検証・セキュリティ監査・品質保証 | ta:auditor | 敵対的レビュー。Pass/Fail と修正点を報告 |

推奨フロー: **Analyst（設計・ADR）→ Engineer（実装・テスト）→ Auditor（検証・監査）**。
設計変更が必要になった場合は Auditor/Engineer から Analyst へ戻し、ADR を更新します。

## 7. 注意事項

- `ollama ps` の CONTEXT は実際にロードされた KV バッファサイズを表す
- 一度小さいサイズでロードされたモデルのコンテキストはリサイズ不可
- `think` は Renderer/PARSER 依存のため `PARAMETER think` は未対応。思考抑制は OpenCode 側の `options.think: false` で制御する
- KV キャッシュ肥大対策: 新規チャット開始、コンテキスト縮小、必要時のみ大コンテキストを使用
- Go 側の `presence_penalty` は Modelfile ではなく OpenCode の `options` で指定している

## 8. 技術仕様と環境構成

### 実行環境

- **Ollama ホスト**: `TA-MBAir.local:11434`
- **Apple Silicon (MLX)**: `nvfp4` モデルを使用するため必須
- **ネットワーク**: `OLLAMA_HOST=0.0.0.0:11434` により別マシンからのアクセスを許可

### モデルの制約

- **Gemma 4 12B**: 32K/64K 制限は、搭載メモリに対する KV キャッシュ負荷を抑えるため
- **派生モデル**: ベースモデルの重みを共有するため、追加のディスク容量はほとんど消費しない
- **Qwen 3.5 9B**: `ta:engineer` / `ta:auditor` で共通利用。パラメータのみで役割を分離

## 9. トラブルシューティング

| 症状 | 確認・対処 |
|---|---|
| `pull` 時のバージョン不適合 | Ollama を 0.31.0 以上へ更新 |
| MLX ランナーが起動しない | Apple Silicon か確認。他 OS は GGUF 形式を使用 |
| 別マシンから接続できない | `OLLAMA_HOST` 設定とファイアウォールを確認 |
| コンテキストが反映されない | `ollama show` で `num_ctx` を確認し、必要なら再作成 |
| モデルが見つからない | `ollama list` で `ta:*` を確認し、`ollama create` を再実行 |
| 応答が途中で切れる | `stop` トークン設定と Modelfile の SYSTEM プロンプトを確認 |
| KV キャッシュの肥大 | 新規チャットを開始し、不要な時以外は `num_ctx` を大きくしない |
