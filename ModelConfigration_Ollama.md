# Ollama モデル構成・作成手順

最終確認日: 2026-10-23

## 1. 概要

Ollama で利用するモデルの構成と、同じモデルを再作成するための手順をまとめる。特定のホスト名や IP アドレスには依存しない。`granite4.1` は対象外とする。

対象モデルは、Ollama ライブラリから取得したベースモデルと、コンテキスト長だけを変更した派生モデルの 2 層構成になっている。

| 役割 | モデル名 | ベースモデル | コンテキスト長 | サイズ | 備考 |
|---|---|---|---:|---:|---|
| Gemma 4 12B（32K） | `gemma4:12b-nvfp4-32k` | `gemma4:12b-nvfp4` | 32,768 | 約 7.7 GB | OpenCode 用 |
| Gemma 4 12B（ベース） | `gemma4:12b-nvfp4` | - | 262,144（モデル上限） | 約 7.7 GB | MLX / nvfp4 |
| Qwen3.5 9B（64K） | `qwen3.5:9b-nvfp4-64k` | `qwen3.5:9b-nvfp4` | 65,536 | 約 7.2 GB | OpenCode 用 |
| Qwen3.5 9B（ベース） | `qwen3.5:9b-nvfp4` | - | 262,144（モデル上限） | 約 7.2 GB | MLX / nvfp4 |

派生モデルはベースモデルの重み（blob）を共有するため、追加で消費するディスク容量はごくわずかである。

## 2. 想定環境

| 項目 | 要件・例 |
|---|---|
| Ollama ホスト | Ollama を実行するマシン。ローカルでも LAN 上の別マシンでもよい |
| CPU / OS | macOS + Apple Silicon（MLX ランナー） |
| メモリ | 16 GB 以上を推奨 |
| Ollama | 0.31.0 以上（本手順は 0.40.8 で確認） |
| 空きディスク | ベースモデル 2 つ分として約 15 GB 以上 |
| ネットワーク | `registry.ollama.ai` へ接続できること |
| API（同一ホスト） | `http://localhost:11434` |
| API（別ホスト） | `http://<ollama-host>:11434` |
| OpenAI 互換 API | 上記 URL の `/v1` |
| `OLLAMA_HOST` | 別マシンから接続する場合は `0.0.0.0:11434` |

### モデルごとの要件

| モデル | 必須 Ollama バージョン | 形式 | ランナー |
|---|---|---|---|
| `gemma4:12b-nvfp4` | 0.31.0 以上 | safetensors | MLX |
| `qwen3.5:9b-nvfp4` | 0.22.0 以上 | safetensors | MLX |

本ドキュメントの `nvfp4` モデルは MLX ランナーを使用するため、Apple Silicon が必要である。Apple Silicon 以外の環境では、同じモデル系列の GGUF 版に読み替えること。その場合、モデル名・サイズ・必要メモリは環境に合わせて変更する。

### 2.1 別マシンから接続する場合

Ollama はデフォルトで `127.0.0.1:11434` のみをリッスンする。OpenCode などを別マシンで動かす場合は、Ollama ホスト側で LAN に公開する。

```sh
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

常駐サービスとして設定する場合の例:

Linux（systemd）:

```sh
sudo systemctl edit ollama.service
```

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

```sh
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

macOS（LaunchAgent / Ollama.app）:

`OLLAMA_HOST=0.0.0.0:11434` を LaunchAgent の `EnvironmentVariables` に設定するか、一時的には次のように設定して Ollama を再起動する。

```sh
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
```

ファイアウォールで TCP 11434 へのアクセスを許可する。Ollama の API には既定で認証がないため、信頼できる LAN 内に限定し、インターネットへ直接公開しないこと。

## 3. 前提条件

- Ollama ホストに Ollama がインストール済みで、`ollama serve` が動作していること
- Ollama 0.31.0 以上
- Apple Silicon マシンであること（`nvfp4` / MLX モデルを使う場合）
- `registry.ollama.ai` からモデルを取得できるネットワーク環境があること
- ベースモデル 2 つ分として約 15 GB の空きディスクがあること
- 以下のコマンドは、原則として Ollama ホスト上で実行する

## 4. 作成手順

以下のコマンドは POSIX 互換の範囲で記載しており、bash / zsh のどちらでもそのまま実行できる。macOS の既定シェルは zsh である。コードブロックの言語指定 `sh` は、特定のシェルに依存しない共通構文であることを示す。

### 4.1 Ollama の動作確認

Ollama ホスト上で、バージョンと API の応答を確認する。

```sh
OLLAMA_SERVER="http://localhost:11434"
ollama --version
curl -s "$OLLAMA_SERVER/api/version"
```

`api/version` が `{"version":"0.40.8"}` のように応答すれば起動済み。別ホストの Ollama を操作する場合は、`OLLAMA_SERVER` をそのホストに変更する。

```sh
OLLAMA_SERVER="http://<ollama-host>:11434"
```

### 4.2 ベースモデルの取得

Ollama ライブラリからベースモデルを取得する。重みはこの `pull` で取得されるため、別マシンから blob を転送する必要はない。

```sh
ollama pull gemma4:12b-nvfp4
ollama pull qwen3.5:9b-nvfp4
```

取得結果を確認する。

```sh
ollama list
```

### 4.3 Modelfile の作成

コンテキスト長を変更するための Modelfile を配置する。保存先は `~/ollama-modelfiles` とする。任意のディレクトリでよいが、以降のコマンド例と合わせる。

```sh
mkdir -p ~/ollama-modelfiles
```

#### Gemma 4 12B（32K）用

`~/ollama-modelfiles/gemma4-12b-nvfp4-32k.Modelfile`

```dockerfile
FROM gemma4:12b-nvfp4
PARAMETER num_ctx 32768
```

#### Qwen3.5 9B（64K）用

`~/ollama-modelfiles/qwen3.5-9b-nvfp4-64k.Modelfile`

```dockerfile
FROM qwen3.5:9b-nvfp4
PARAMETER num_ctx 65536
```

Modelfile で指定していないサンプリングパラメータ（`temperature`、`top_p`、`top_k` など）は、ベースモデルの値がそのまま継承される。変更する場合は、必要な `PARAMETER` を追記する。

### 4.4 派生モデルの作成

```sh
ollama create gemma4:12b-nvfp4-32k \
  -f ~/ollama-modelfiles/gemma4-12b-nvfp4-32k.Modelfile

ollama create qwen3.5:9b-nvfp4-64k \
  -f ~/ollama-modelfiles/qwen3.5-9b-nvfp4-64k.Modelfile
```

同じタグに対して再実行すると、既存の派生モデルが上書きされる。

### 4.5 作成結果の確認

```sh
ollama list
```

対象の 4 モデルが表示されることを確認する（ID は再作成時に変わるため参考値）。

```text
NAME                    ID              SIZE      MODIFIED
gemma4:12b-nvfp4-32k    52fb2b7e1d48    7.7 GB    ...
gemma4:12b-nvfp4        ded7a2735003    7.7 GB    ...
qwen3.5:9b-nvfp4-64k    4f817c312264    7.2 GB    ...
qwen3.5:9b-nvfp4        8218177ac78e    7.2 GB    ...
```

コンテキスト長を確認する。

```sh
ollama show gemma4:12b-nvfp4-32k
ollama show qwen3.5:9b-nvfp4-64k
```

`Parameters` に以下が表示されればよい。

- `gemma4:12b-nvfp4-32k` → `num_ctx 32768`
- `qwen3.5:9b-nvfp4-64k` → `num_ctx 65536`

簡単な推論確認も行う。

```sh
ollama run qwen3.5:9b-nvfp4-64k "1+1 は?"
ollama run gemma4:12b-nvfp4-32k "1+1 は?"
```

実行中のコンテキスト長は `ollama ps` で確認できる。

```sh
ollama ps
```

### 4.6 API 経由の確認

OpenAI 互換 API を確認する。同一ホストからは `localhost`、別ホストからは Ollama ホストを使う。

```sh
OLLAMA_SERVER="http://localhost:11434"
curl -s "$OLLAMA_SERVER/v1/models"
```

チャット補完の確認例:

```sh
curl -s "$OLLAMA_SERVER/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen3.5:9b-nvfp4-64k",
    "messages": [
      {"role": "user", "content": "1+1 は?"}
    ]
  }'
```

`gemma4:12b-nvfp4-32k` を確認する場合は `model` を差し替える。

## 5. OpenCode 側の設定

OpenCode の `opencode.json` では、Ollama の OpenAI 互換エンドポイントを指定する。`limit.context` は Modelfile の `num_ctx` と一致させる。

```json
{
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "gemma4:12b-nvfp4-32k": {
          "name": "Gemma 4 12B (32K)",
          "limit": {
            "context": 32768,
            "output": 8192
          }
        },
        "qwen3.5:9b-nvfp4-64k": {
          "name": "Qwen3.5 9B (64K)",
          "limit": {
            "context": 65536,
            "output": 8192
          }
        }
      }
    }
  }
}
```

- OpenCode と Ollama が別マシンの場合は、`baseURL` を `http://<ollama-host>:11434/v1` に変更する。
- `limit.output` の 8192 は例。必要に応じて調整する。
- モデル名は Ollama のタグと完全一致させる。
- 設定変更後は OpenCode を再起動する。

## 6. パラメータ構成

派生モデルで明示的に変更しているのは `num_ctx` のみである。それ以外はベースモデルから継承される。

### gemma4:12b-nvfp4-32k

| パラメータ | 値 | 由来 |
|---|---:|---|
| `num_ctx` | 32768 | 派生 Modelfile |
| `temperature` | 1 | ベースモデル |
| `top_k` | 64 | ベースモデル |
| `top_p` | 0.95 | ベースモデル |

モデルの最大コンテキスト長は 262,144。32K に制限しているのは、搭載メモリに対する KV キャッシュの負荷を抑えるため。利用可能なメモリが多い環境では `num_ctx` を増やせる。

### qwen3.5:9b-nvfp4-64k

| パラメータ | 値 | 由来 |
|---|---:|---|
| `num_ctx` | 65536 | 派生 Modelfile |
| `min_p` | 0 | ベースモデル |
| `presence_penalty` | 1.5 | ベースモデル |
| `repeat_penalty` | 1 | ベースモデル |
| `temperature` | 1 | ベースモデル |
| `top_k` | 20 | ベースモデル |
| `top_p` | 0.95 | ベースモデル |

モデルの最大コンテキスト長は 262,144。64K に制限している理由は Gemma 4 と同様。

## 7. 変更・再作成・削除

### コンテキスト長を変更する

1. 対象の Modelfile の `num_ctx` を変更する
2. `ollama create <モデル名> -f <Modelfile>` を再実行する
3. `ollama show <モデル名>` で `num_ctx` を確認する
4. `opencode.json` の `limit.context` を同じ値に更新する
5. OpenCode を再起動する

### 派生モデルを削除する

```sh
ollama rm gemma4:12b-nvfp4-32k
ollama rm qwen3.5:9b-nvfp4-64k
```

ベースモデルは派生モデルの作成元であるため、派生モデルより先に削除しない。

```sh
ollama rm gemma4:12b-nvfp4
ollama rm qwen3.5:9b-nvfp4
```

### Modelfile のバックアップ

派生モデルの定義は Modelfile のみで再現できるため、`~/ollama-modelfiles` をバックアップまたは構成管理しておく。重み（`~/.ollama/models/blobs`）をコピーする必要はなく、展開先でベースモデルを `ollama pull` してから `ollama create` すればよい。

## 8. トラブルシューティング

| 症状 | 確認・対処 |
|---|---|
| `pull` 時にバージョン不適合のエラーが出る | Ollama を 0.31.0 以上へ更新する |
| MLX ランナーが起動しない | Apple Silicon か確認する。Apple Silicon 以外では GGUF 版のモデルを使用する |
| 別マシンから接続できない | Ollama が `0.0.0.0:11434` でリッスンしているか確認する。`OLLAMA_HOST`、ファイアウォール、NAT の設定も確認する |
| `localhost` では接続できるが別ホストから接続できない | `baseURL` に `localhost` ではなく Ollama ホストを指定する |
| OpenCode でモデルが見つからない | `ollama list` のタグと `opencode.json` のモデル名が完全一致しているか確認する |
| 応答が遅い / メモリ不足になる | `ollama ps` で実行中モデルを確認し、`num_ctx` を下げる。搭載メモリに合わせてモデルサイズも見直す |
| コンテキスト長が反映されない | `ollama show <モデル名>` の `num_ctx` と `opencode.json` の `limit.context` を確認する。変更後はモデルの再作成が必要 |
| モデルの取得に失敗する | `registry.ollama.ai` への接続、プロキシ設定、タグ名の誤りを確認する |
| ディスク容量が不足する | `~/.ollama/models` の使用量を確認する。`OLLAMA_MODELS` で保存先を変更できる |

## 9. 補足

- 派生モデルは `ollama create` 時にベースモデルの blob を参照するため、重みの二重保存は発生しない。
- ベースモデルは Ollama ライブラリの `nvfp4` 量子化版（MLX 形式）を使用している。
- `granite4.1` は本ドキュメントの対象外。
- モデル実体は Ollama ホストの `~/.ollama/models` に保存される。`OLLAMA_MODELS` を設定している場合はそのディレクトリ。
- 再現性が必要な場合は、`ollama show <モデル名>` でダイジェストを確認し、ベースモデルの更新による差分に注意する。

## 10. OpenCode との連携（パラメーター設定）

### モデルの表示について

OpenCode は Ollama の全モデルを自動検出しません。`~/.config/opencode/opencode.json`（またはプロジェクトルートの `opencode.json`）の `provider.ollama.models` に明示的に定義したモデルのみがモデル選択に表示されます。

Ollama 側で派生モデルを作成した場合でも、`opencode.json` に追記しないとピッカーには現れません。

### opencode.json での設定例

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://<ollama-host>:11434/v1"
      },
      "models": {
        "gemma4:12b-nvfp4-16k-temp02": {
          "name": "Gemma 4 12B (16K, temp 0.2)",
          "options": {
            "temperature": 0.2,
            "num_ctx": 16384
          },
          "limit": {
            "context": 16384,
            "output": 8192
          }
        }
      }
    }
  },
  "model": "opencode/big-pickle"
}
```

### パラメーター上書きの注意点

| パラメーター | 信頼性 | 補足 |
|---|---|---|
| `temperature` | 比較的安定 | `options.temperature` で渡すことが可能。OpenCode からの上書きが有効な場合が多いです。 |
| `num_ctx` | 不安定 | `options.num_ctx` を指定しても、モデルが既に Ollama 上でロード済みの場合は無視されることがあります。また、Ollama のバージョンによって挙動が異なります。 |
| `limit.context` | UI のみ | OpenCode のトークン表示・上限判定用であり、実際のコンテキスト長を変更しません。実際の値は Ollama 側と一致させる必要があります。 |

### 推奨される運用

- **チャット中に動的に変更することはできない**: OpenCode には会話中に `temperature` / `num_ctx` を切り替えるコマンドは存在しません。
- **派生モデルを使うのが最も確実**: `num_ctx` や `temperature` などの推論パラメータは Modelfile に焼き込んで `ollama create` で派生モデルを作成するのが正攻法です。
- **定義の追加が必須**: 新しい派生モデルを使う場合は、必ず `opencode.json` の `provider.ollama.models` にエントリを追加してください（キーは Ollama のタグ名と完全一致させます）。
- **設定変更後は再起動**: `opencode.json` を編集した後は OpenCode を再起動するか、設定が読み込まれるまで待機してください。

## 付録: 動作確認環境の一例

本手順は以下に相当する環境で確認している。ホスト名は環境ごとに読み替えること。

| 項目 | 値 |
|---|---|
| ハードウェア | Apple Silicon / 16 GB 以上のユニファイドメモリ |
| OS | macOS / Linux |
| Ollama | 0.40.8 以上 |
| モデルの実行形式 | MLX（safetensors） |
