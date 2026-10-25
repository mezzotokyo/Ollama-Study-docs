# Ollama モデル構成（統合）

最終更新: 2026-10-25  
対象環境: iride.local:11434（Ollama v0.40.9 / macOS + Apple Silicon MLX）

## 1. 概要
本書は、OpenCode から利用する Ollama モデルの現在の構成・用途・作成手順を統合したものです。  
ベースモデルは必要最小限とし、用途別に Modelfile で派生モデルを作成しています。

## 2. 現在の構成（iride.local）

### モデル一覧
```text
gemma4:12b-nvfp4              (base)
gemma4:12b-nvfp4-analyst      (派生) - 設計・レビュー用
gemma4:12b-nvfp4-largectx     (派生) - 大規模解析用
qwen3.5:9b-nvfp4              (base)
qwen3.5:9b-nvfp4-coder        (派生) - 実装用
granite4.1:3b                 (検証用)
```

### 用途別パラメータ
| モデル名 | 用途 | ベース | num_ctx | thinking | temperature | その他 | 備考 |
|---|---|---|---|---|---|---|---|
| gemma4:12b-nvfp4-analyst | Analyst（設計・レビュー・ADR・リファクタ方針） | gemma4:12b-nvfp4 | 32768 | true | 0.2 | top_k=64, top_p=0.95 | OpenCode デフォルト。保守的で指示追従性が高く、方針がぶれにくい |
| qwen3.5:9b-nvfp4-coder | Coder（実装・コード生成・CRUD・テスト生成） | qwen3.5:9b-nvfp4 | 32768 | false（クライアント指定） | 0 | presence_penalty=0, repeat_penalty=1.0, top_k=64, top_p=0.95 | 実装速度重視。OpenCode で think: false を指定 |
| gemma4:12b-nvfp4-largectx | Large Context（大規模コードベース解析・横断リファクタ・巨大ログ） | gemma4:12b-nvfp4 | 65536 | true | 0.2 | top_k=64, top_p=0.95 | 必要時のみ使用。KVキャッシュ肥大に注意 |

## 3. OpenCode 設定
/Users/shin1/Dev/Ollama_Study/opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama (iride)",
      "options": {
        "baseURL": "http://iride.local:11434/v1"
      },
      "models": {
        "gemma4:12b-nvfp4-analyst": {
          "name": "Gemma4 Analyst (設計・レビュー)",
          "limit": { "context": 32768, "output": 8192 }
        },
        "qwen3.5:9b-nvfp4-coder": {
          "name": "Qwen35 Coder (実装)",
          "limit": { "context": 32768, "output": 8192 },
          "options": {
            "num_ctx": 32768,
            "think": false,
            "temperature": 0,
            "presence_penalty": 0
          }
        },
        "gemma4:12b-nvfp4-largectx": {
          "name": "Gemma4 Large Context (横断解析)",
          "limit": { "context": 65536, "output": 8192 }
        }
      }
    }
  },
  "model": "ollama/gemma4:12b-nvfp4-analyst"
}
```

## 4. 派生モデル作成手順（iride.local）

### Analyst
```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
cat > /tmp/Modelfile.gemma4-analyst << 'EOF'
FROM gemma4:12b-nvfp4
PARAMETER num_ctx 32768
PARAMETER temperature 0.2
PARAMETER top_k 64
PARAMETER top_p 0.95
EOF
ollama create gemma4:12b-nvfp4-analyst -f /tmp/Modelfile.gemma4-analyst
```

### Coder
```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
cat > /tmp/Modelfile.qwen-coder << 'EOF'
FROM qwen3.5:9b-nvfp4
PARAMETER num_ctx 32768
PARAMETER temperature 0
PARAMETER presence_penalty 0
PARAMETER repeat_penalty 1.0
PARAMETER top_k 64
PARAMETER top_p 0.95
EOF
ollama create qwen3.5:9b-nvfp4-coder -f /tmp/Modelfile.qwen-coder
```

### Large Context
```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
cat > /tmp/Modelfile.gemma4-largectx << 'EOF'
FROM gemma4:12b-nvfp4
PARAMETER num_ctx 65536
PARAMETER temperature 0.2
PARAMETER top_k 64
PARAMETER top_p 0.95
EOF
ollama create gemma4:12b-nvfp4-largectx -f /tmp/Modelfile.gemma4-largectx
```

## 5. 運用方針
| フェーズ | モデル | 備考 |
|---|---|---|
| 要求分析・設計・ADR・レビュー | gemma4:12b-nvfp4-analyst | Think ON（既定） |
| 実装・コード生成・テスト生成 | qwen3.5:9b-nvfp4-coder | Think OFF 意図（OpenCode options.think: false） |
| 横断解析・大規模リファクタ・ログ解析 | gemma4:12b-nvfp4-largectx | 必要時のみ、num_ctx 65536 |

## 6. 注意事項
- ollama ps の CONTEXT は実際にロードされた KV バッファサイズを表す。
- 一度小さいサイズでロードされたモデルのコンテキストはリサイズ不可。
- think は Renderer/PARSER 依存のため PARAMETER think は未対応。Coder の思考抑制は OpenCode 側の options.think: false で制御する。
- KVキャッシュ肥大対策: 新規チャット開始、コンテキスト縮小、必要時のみ大コンテキストモデルを使用。

## 7. 技術仕様と環境構成
### 実行環境
- **Ollama ホスト**: `iride.local:11434`
- **Apple Silicon (MLX)**: `nvfp4` モデルを使用するため必要。
- **ネットワーク**: `OLLAMA_HOST=0.0.0.0:11434` による別マシンからのアクセス許可。

### モデルの制約
- **Gemma 4 12B**: 32K/64K 制限は、搭載メモリに対する KV キャッシュの負荷を抑えるため。
- **派生モデル**: ベースモデルの重みを共有するため、追加のディスク容量はほとんど消費しない。

## 8. トラブルシューティング
| 症状 | 確認・対処 |
|---|---|
| `pull` 時のバージョン不適合 | Ollama を 0.31.0 以上へ更新 |
| MLX ランナーが起動しない | Apple Silicon か確認。他 OS は GGUF 形式を使用 |
| 別マシンから接続できない | `OLLAMA_HOST` 設定とファイアウォールを確認 |
| コンテキストが反映されない | `ollama show` で `num_ctx` を確認し、必要なら再作成 |
| KV キャッシュの肥大 | 新規チャットを開始し、不要な時以外は `num_ctx` を大きくしない |

