# Ollama 推論サーバー構築手順（常駐化・macOS / Windows）

LAN 内の 1 台を **常設の Ollama 推論サーバー**として構築し、別マシン上の **opencode** から OpenAI 互換 API（`<サーバーIP>:11434/v1`）で接続するための手順。

## 概要

- **接続元**: LAN 内の別マシン（サーバー自身で開発作業を行わない構成を推奨）
- **サーバー**: 常時稼働する常設サーバー（ログアウト・再起動後も自動起動）
- **プロバイダー**: Ollama（LM Studio は使用しない）
- **API エンドポイント**: `http://<サーバーIP>:11434/v1`（OpenAI 互換）
- **接続例**: `http://TA-MBAir.local:11434/v1`

## 1. 構成

```text
┌──────────────────┐        HTTP/OpenAI互換API        ┌──────────────────────┐
│  クライアント     │ ───────────────────────────────▶│  推論サーバー          │
│  opencode        │    http://<サーバーIP>:11434/v1  │  Ollama :11434（常駐）  │
└──────────────────┘                                   └──────────────────────┘
```

Ollama は既定で `127.0.0.1:11434` にしかバインドしないため、**LAN からの接続には `OLLAMA_HOST=0.0.0.0:11434` の設定が必須**です。

本手順は**常駐化（起動時自動起動・ログアウト後も稼働）を前提**に記述します。

## 2. サーバー構築（常駐化）

サーバーマシン上で実施します。

### 2.1 macOS

#### (1) インストール
1. [ollama.com/download](https://ollama.com/download) からインストーラを取得し、`Ollama.app` を Applications へ配置（または `curl -fsSL https://ollama.com/install.sh | sh`）
2. 一度起動して動作を確認

```sh
ollama --version
```

#### (2) 既存のユーザー起動を停止
メニューバーの Ollama を **Quit** して停止します。

```sh
launchctl bootout gui/$(id -u)/com.ollama.ollama 2>/dev/null || true
```

#### (3) LaunchDaemon を作成（常駐化）
システム領域の LaunchDaemon として登録します。

`/Library/LaunchDaemons/com.ollama.serve.plist` を作成します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>KeepAlive</key>
	<true/>
	<key>Label</key>
	<string>com.ollama.serve</string>
	<key>ProcessType</key>
	<string>Background</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/bin/sudo</string>
		<string>-u</string>
		<string>ta000</string>
		<string>-H</string>
		<string>/usr/bin/env</string>
		<string>HOME=/Users/ta000</string>
		<string>USER=ta000</string>
		<string>LOGNAME=ta000</string>
		<string>OLLAMA_HOST=0.0.0.0:11434</string>
		<string>OLLAMA_MODELS=/Users/ta000/.ollama/models</string>
		<string>OLLAMA_KEEP_ALIVE=24h</string>
		<string>/Applications/Ollama.app/Contents/Resources/ollama</string>
		<string>serve</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>StandardErrorPath</key>
	<string>/var/log/ollama.err.log</string>
	<key>StandardOutPath</key>
	<string>/var/log/ollama.out.log</string>
</dict>
</plist>
```

> - `launchctl setenv` で設定した環境変数は LaunchDaemon には引き継がれません。`OLLAMA_HOST` などの環境変数は、`ProgramArguments` 内の `/usr/bin/env` に直接記載します。
> - 本 plist は `sudo -u ta000` で Ollama を起動するため、モデルの格納先は `/Users/ta000/.ollama/models` です。既存のモデルがある場合は、そのパスへ移すか、改めて `ollama pull` してください。
> - ブラウザから直接 CORS アクセスしたい場合のみ `OLLAMA_ORIGINS` を `ProgramArguments` の `/usr/bin/env` に追加します（opencode からの利用では不要）。

所有者・権限を設定してロードします。

```sh
sudo chown root:wheel /Library/LaunchDaemons/com.ollama.serve.plist
sudo chmod 644 /Library/LaunchDaemons/com.ollama.serve.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.ollama.serve.plist
```

#### (4) 確認
```sh
sudo launchctl print system/com.ollama.serve | head -n 20
ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null
curl http://<サーバーIP>:11434/api/version
```

`curl` が `{"version":"..."}` を返せばサーバーは常駐稼働中です。

> **注意**: `0.0.0.0` へのバインドは全ネットワークインターフェースに公開します。信頼できる LAN のみで使用し、必要に応じてファイアウォールで 11434 を制限してください。

常駐解除・停止:

```sh
sudo launchctl bootout system /Library/LaunchDaemons/com.ollama.serve.plist
sudo rm /Library/LaunchDaemons/com.ollama.serve.plist
```

### 2.2 Windows（NSSM で常駐化）

#### (1) インストール
1. [ollama.com/download](https://ollama.com/download) からインストーラ（`.exe`）を取得・実行
2. 一度起動して動作を確認（タスクトレイの Ollama アイコン）

#### (2) 環境変数の設定（ユーザー環境変数）
Ollama は Windows のユーザー環境変数を継承します。

1. Ollama を終了（タスクトレイ → **Quit**）
2. **設定 → システム → 詳細設定 → 環境変数** を開く
3. ユーザー環境変数に以下を追加:

| 名前 | 値 |
|------|----|
| `OLLAMA_HOST` | `0.0.0.0:11434` |

保存後、Ollama を再起動して一時的に疎通確認します。

#### (3) ファイアウォール許可
プライベートネットワーク向けに 11434/TCP を許可します（管理者権限の PowerShell）。

```powershell
New-NetFirewallRule -DisplayName "Ollama LAN" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow
```

#### (4) NSSM で Windows サービスとして常駐化
トレイ常駐の Ollama を **Quit** し、サービスとして登録します。

Scoop で NSSM を導入します（未導入の場合）。

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
$env:Path += ";$env:USERPROFILE\scoop\shims"
scoop install nssm
```

管理者権限の PowerShell でサービスを登録・起動します。

```powershell
nssm install Ollama "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" serve
nssm set Ollama AppEnvironmentExtra OLLAMA_HOST=0.0.0.0:11434 OLLAMA_MODELS=C:\ProgramData\Ollama\models
nssm set Ollama Start SERVICE_AUTO_START
nssm start Ollama
```

> `nssm install` の実行ファイルパスは実際のインストール先に合わせてください。サービスは LocalSystem で動作するため、モデル格納先を `C:\ProgramData\Ollama\models` に明示します。既存モデルは移動するか、後述の手順で改めて取得してください。

#### (5) 確認
```powershell
Get-Service Ollama
ipconfig
curl.exe http://<サーバーIP>:11434/api/version
```

`curl.exe` が `{"version":"..."}` を返せば常駐化は成功しています（ログオフ・再起動後も自動起動）。

常駐解除・停止:

```powershell
nssm stop Ollama
nssm remove Ollama confirm
```

> Windows PowerShell 5.1 では `curl` が `Invoke-WebRequest` のエイリアスのため、`curl.exe` と明示するか `Invoke-RestMethod` を使用してください。

## 3. モデルの準備（サーバー上で実行）

サーバーが常駐稼働した状態で、**サーバーマシン上**でモデルを取得・エイリアス作成します。

### 3.1 ベースモデルの取得
[ollama.com/library](https://ollama.com/library) から必要なモデルを pull します。

本リポジトリの `opencode.json` で定義しているモデルとベースモデル:

| opencode.json のモデル ID | 名前 | ベースモデル（取得コマンド） |
|---------------------------|------|------------------------------|
| `ta:architect` | Ethical Architect (Analysis) | `gemma4:12b-nvfp4`（`ollama pull gemma4:12b-nvfp4`） |
| `ta:engineer` | Expert Engineer (Coding) | `qwen3.5:9b-nvfp4`（`ollama pull qwen3.5:9b-nvfp4`） |
| `ta:auditor` | Technical Auditor (Review) | `qwen3.5:9b-nvfp4`（`ollama pull qwen3.5:9b-nvfp4`） |

```sh
ollama pull gemma4:12b-nvfp4
ollama pull qwen3.5:9b-nvfp4
ollama list
```

派生モデル（`ta:*`）は `models/*.modelfile` から作成します。手順の詳細は [モデル構成（Ollama Models）](ollama-models.md) を参照してください。

> 名前に `-mlx` を含むモデルは **Apple Silicon（Metal）向けの量子化モデル**です。実行には Apple Silicon の macOS（サーバー）が必要で、Intel Mac では動作しません。ベースモデルを pull する際も `-mlx` 付きのタグを使用してください。

### 3.2 参考: エイリアス作成（context 制限）
以下は、context 長を制限した別名モデルを作る場合の例です（現在の `ta:*` 構成では、`models/*.modelfile` 内で `num_ctx` を指定済みのため必須ではありません）。

例（`gemma4:e4b-mlx-64k`、`num_ctx=65536`）:

```sh
cat > /tmp/Modelfile.gemma4.e4b.mlx64k <<'EOF'
FROM gemma4:e4b-mlx
PARAMETER num_ctx 65536
EOF
ollama create gemma4:e4b-mlx-64k -f /tmp/Modelfile.gemma4.e4b.mlx64k
```

例（`gemma4:12b-mlx-32k`、`num_ctx=32768`）:

```sh
cat > /tmp/Modelfile.gemma4.12b.mlx32k <<'EOF'
FROM gemma4:12b-mlx
PARAMETER num_ctx 32768
EOF
ollama create gemma4:12b-mlx-32k -f /tmp/Modelfile.gemma4.12b.mlx32k
```

例（`qwen3.5:4b-mlx-64k`、`num_ctx=65536`）:

```sh
cat > /tmp/Modelfile.qwen3.5.4b.mlx64k <<'EOF'
FROM qwen3.5:4b-mlx
PARAMETER num_ctx 65536
EOF
ollama create qwen3.5:4b-mlx-64k -f /tmp/Modelfile.qwen3.5.4b.mlx64k
```

例（`qwen3:8b-40k`、`num_ctx=40960`）:

```sh
cat > /tmp/Modelfile.qwen3.8b.40k <<'EOF'
FROM qwen3:8b
PARAMETER num_ctx 40960
EOF
ollama create qwen3:8b-40k -f /tmp/Modelfile.qwen3.8b.40k
```

作成後に一覧を確認します。

```sh
ollama list
```

> context 長を大きくすると KV キャッシュの分だけメモリ使用量が増加します。サーバーのメモリ量に応じて調整してください。

## 4. クライアント側設定（opencode）

クライアントマシン（別マシン）のリポジトリで `opencode.json` を設定します。

> 以下は別構成の設定例です。本リポジトリの最新設定（`ta:*`）はルートの `opencode.json` と [モデル構成（Ollama Models）](ollama-models.md) を参照してください。

```json
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    "ollama": {
      "name": "Ollama (local)",
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": {
        "baseURL": "http://<サーバーIP>:11434/v1"
      },
      "models": {
        "gemma4:e4b-mlx": {
          "name": "Gemma 4 E4B (Ollama)"
        },
        "gemma4:e4b-mlx-64k": {
          "name": "Gemma 4 E4B (64K)",
          "limit": {
            "context": 65536,
            "output": 8192
          }
        },
        "gemma4:12b-mlx-32k": {
          "name": "Gemma 4 12B (32K)",
          "limit": {
            "context": 32768,
            "output": 8192
          }
        },
        "qwen3.5:4b-mlx-64k": {
          "name": "Qwen3.5 4B (64K)",
          "limit": {
            "context": 65536,
            "output": 8192
          }
        },
        "qwen3:8b-40k": {
          "name": "Qwen3 8B (40K)",
          "limit": {
            "context": 40960,
            "output": 8192
          }
        }
      }
    }
  }
}
```

- `<サーバーIP>` はサーバーマシンの LAN IP またはホスト名に置き換えます（例: `TA-MBAir.local`）
- モデル ID はサーバー上の `ollama list` のタグと一致させます
- 接続には V2 純正の `@opencode/ai/providers/openai-compatible` を使用します

## 5. 他の開発支援ツールからの接続

opencode 以外のツールでも、**OpenAI 互換 API（`http://<サーバーIP>:11434/v1`）** を指定すれば同じサーバーを利用できます。以下は代表例です（モデル ID は `ollama list` のタグに合わせます）。

### Aider（ターミナル CLI）

Ollama のネイティブ provider を使う場合は `ollama_chat/` プレフィックスを付けます。

```sh
export OLLAMA_API_BASE=http://<サーバーIP>:11434
aider --model ollama_chat/qwen3:8b
```

OpenAI 互換 API を使う場合は base URL とダミーのキーを設定します。

```sh
export OPENAI_API_BASE=http://<サーバーIP>:11434/v1
export OPENAI_API_KEY=ollama
aider --model openai/qwen3:8b
```

### Cline（VS Code 拡張 / CLI）

1. 設定で API Provider に **Ollama**（または **OpenAI Compatible**）を選ぶ
2. Base URL に `http://<サーバーIP>:11434`（OpenAI Compatible の場合は `http://<サーバーIP>:11434/v1`）を入力
3. モデル ID に `ollama list` のタグを入力（例: `qwen3:8b`）

CLI 版は `ollama launch cline` で自動設定できます。

### Continue（VS Code / JetBrains 拡張）

VS Code に Continue 拡張を導入し、`~/.continue/config.yaml` にモデルを追加します。

> 本構成（LAN 内の Ollama サーバーへ接続）で、VS Code + Continue の動作を確認済みです。

```yaml
models:
  - name: Gemma 4 12B (32K)
    provider: ollama
    model: gemma4:12b-mlx-32k
    apiBase: http://<サーバーIP>:11434
    roles: [chat, edit, apply]
    defaultCompletionOptions:
      contextLength: 32768
      maxTokens: 8192
      temperature: 0.2
  - name: Qwen3 8B (40K)
    provider: ollama
    model: qwen3:8b-40k
    apiBase: http://<サーバーIP>:11434
    roles: [chat, edit, apply]
    defaultCompletionOptions:
      contextLength: 40960
      maxTokens: 8192
      temperature: 0.1
```

- `defaultCompletionOptions` の `contextLength` はサーバー側エイリアスの `num_ctx`（32K / 40K）に揃え、`maxTokens` は `opencode.json` の `output`（8192）と揃えます。`temperature` はコーディング向けに低め（0.1〜0.2）にします
- Continue は**インライン補完**にも対応します（小さめのモデルを `roles: [autocomplete]` に割り当てる）
- VS Code 拡張の Cline / Roo Code / Kilo Code、チャット UI の Open WebUI / LibreChat なども同様に OpenAI 互換エンドポイントを指定できます

> モデル名は `ollama list` のタグと完全に一致させます。agentic な利用では、tool 呼び出しに対応し、context を 32k〜64k 確保できるモデルを選びます。

## 6. 疎通確認

### クライアントからの疎通確認
```sh
curl http://<サーバーIP>:11434/v1/models
```

モデル一覧が JSON で返れば接続成功です。

Windows（PowerShell）では `curl.exe` または `Invoke-RestMethod` を使用してください。

opencode からモデルが選択・利用できることを確認します。CLI では `opencode models`、TUI では `/models` で一覧を確認できます。

## 7. 切り替え・モデル評価

プロバイダを切り替える場合は `opencode.json` の `"model"` を `provider/model` 形式（例: `ollama/ta:engineer`）で書き換えるか、opencode 起動時のプロバイダ選択で Ollama 側を選びます。

`opencode.json` の変更は OpenCode 2.x では自動的に反映されます。反映されない場合は `/reload` で設定を再読み込みしてください。

## 8. 参考

- Ollama FAQ（環境変数・ログなど）: <https://docs.ollama.com/faq>
- モデルライブラリ: <https://ollama.com/library>
- モデル格納先（既定）
  - macOS: `~/.ollama/models`（LaunchDaemon 使用時は `OLLAMA_MODELS` で明示したパス）
  - Windows: `%USERPROFILE%\.ollama\models`（サービス使用時は `OLLAMA_MODELS` で明示したパス）
- ログ
  - macOS: `~/.ollama/logs/server.log`（LaunchDaemon 使用時は `/var/log/ollama.out.log` 等）
  - Windows: `%LOCALAPPDATA%\Ollama\server.log`
- opencode 設定の詳細: `opencode.json`（リポジトリルート）
