# OpenCode 使用時の注意点と回避のための設定

2026-11-28 確定版。配置先は Ollama_Study と Ollama-Study-docs の両リポジトリのルート（ファイル名 `opencode-usage-notes.md`）で、README の ToC／Reference Guide から導線を張る。元文書 `opencode-permissions-and-policies.md` は本書へ統合済みのため削除対象とする。最終行ルール（§2.2）は両リポジトリの AGENTS.md へ直置きするもので、本書の記載は AGENTS.md 側と同一文（実物は AGENTS.md 側が正）。

出典：

- `opencode-permissions-and-policies.md`（OpenCode 公式ドキュメントに基づくリファレンス＋2026-11-25 の実機確認ログ）
- issue #66368（edit の最終行問題）および 2026-11-27 の評価実験
- OpenCode v2.4.1 のモデル自動検出についての 2026-11-24 の実機報告

---

## 0. 概要：なぜ「注意点と回避」が必要か

OpenCode をローカルモデルで運用する中で、モデルの言葉や通常の設定だけでは防げない問題が3件確認された。

1. **過剰な自律性**：ta:auditor が「翻訳した」と述べながら、無許可で git commit / push を実行した（2026-11-24。OWASP LLM06:2025 Excessive Agency に分類）。
2. **edit の最終行問題**：ファイル最終行の編集が失敗したり、編集のたびに末尾の改行が増えたりした（issue #66368）。
3. **モデルの自動検出**：v2.4.1 で、ビルトインのプロバイダ ID `ollama` を使うとサーバーのモデルが自動検出され、config で定義していないベースモデルまで表示・利用可能になった。

共通する教訓は「モデルの約束や推論トレースはセキュリティ境界にならない」ということ。対策は性質の違う3つの層に分かれる。

| 層 | 手段 | 性質 |
|---|---|---|
| 強制 | `permissions` / `policies`（opencode.json） | ツール層で実行を制御する。モデルの判断に委ねない |
| 助言 | AGENTS.md の運用ルール | モデルの振る舞いを寄せる。強制力はない |
| 設定 | プロバイダ ID の付け方 | クライアント側の見え方を決める。サーバー側の制限にはならない |

---

## 1. 強制の層：permissions と policies

### 1.1 使い分け

| 項目 | `permissions` | `policies` |
|---|---|---|
| 目的 | ツール使用時の承認制御 | 利用可否の強制 |
| `effect` | `allow` / `deny` / `ask` | `allow` / `deny` のみ |
| プロンプト | 出せる | 絶対に出ない |
| 保存済み承認との関係 | プロジェクトスコープで効く | 保存済み承認・`ask` より後に適用され hard-deny する |

- 確認させたい操作 → `permissions` の `ask`
- 完全に禁止したい操作 → `policies` の `deny`

### 1.2 採用している設定（git の安全策）

プロジェクト設定にもグローバル設定（`~/.config/opencode/opencode.json`）にも、同じ2ルールを入れている。

```jsonc
"permissions": [
  { "action": "shell", "resource": "git commit *", "effect": "ask" }
],
"policies": [
  { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" }
]
```

- `git commit` → 毎回、実際のコマンドを表示して確認する。**`Allow always` は押さない**（後述）。
- `git push` → OpenCode 内では完全禁止。確認ダイアログも `Allow always` も効かない。
- `policies` の deny はプロジェクト側の設定で解除できない。グローバルの deny は特に強い。

設定を編集した後はサーバーログを確認すること。検証に失敗した policy は黙って無効化される場合がある。

### 1.3 評価順の要点

- 通常の設定項目は「近い設定が勝つ」（グローバル < プロジェクト）。
- `permissions` は後勝ち（last match wins）で、グローバル設定はプロジェクトより後に評価される。
- `policies` は通常設定と逆で、広い（上位の）設定ほど後に評価される。同一ファイル内では書いた順に後勝ちなので、「広い deny → 例外 allow」の順に書く。

> 注意（未検証の解釈）：「プロジェクトで `Allow always` を押しても、グローバルの `ask` が後勝ちで残る」という §1.2 の運用根拠は、公式ドキュメントの合成順からの**解釈**であり、実機では未検証（2026-11-25 時点）。ドキュメント上明記されているのは「保存済み承認はプロジェクトスコープの allow ルールであること」と「保存済み allow は設定済み deny を覆さないこと」まで。検証する場合は、テスト用プロジェクトで Allow always を保存し、グローバルの ask が残るかを確認する。

### 1.4 `Allow always`（保存済み承認）の扱い

- 保存先は設定ファイルではなく DB（`~/.local/share/opencode/opencode.db` の `permission` テーブル）で、スコープはプロジェクト単位。
- 確認：`opencode api permission.saved.list`（プロジェクト指定は `--param projectID=<project-id>`）
- 削除：`opencode api permission.saved.remove --param id=<permission-id>`（一括削除 API はない）
- 2026-11-25 の実機確認では、全15プロジェクトで保存済み承認は0件だった。
- `cli.json` の `session.permissions` は `prompt` のままにする。`autoaccept` は全承認を自動化し、「確認を残す」という目的に反する。

詳細な構文リファレンス（アクション一覧、ワイルドカード、デフォルト基底ポリシー、policies の全アクション等）は付録Aに統合した。元文書 `opencode-permissions-and-policies.md` は本書への統合完了後に削除する。

---

## 2. 助言の層：AGENTS.md の最終行ルール

### 2.1 問題

OpenCode の edit でファイル最終行（日付・バージョン等の末尾メタデータ）を編集すると、失敗したり、末尾の改行が編集のたびに1つずつ増えたりすることがある（issue #66368）。根本には、同じハーネス内で read と edit がファイル末尾の改行を異なって解釈する問題がある。read の表示では最終行の末尾改行の有無が見えず、モデルがコピー元の形を再現しようとすると齟齬が出る。

これはツールの仕様問題であり、AGENTS.md の注意書きは根本解決ではない。以下のルールは、修正までの回避策として評価済みの実践パターンである。

### 2.2 ルール（AGENTS.md へ直置きする節）

```markdown
## ファイル最終行の編集
- 最終行（日付・バージョン等の末尾メタデータ）の変更は、原則として edit ではなく shell の行置換で行う（例: perl -pi -e 's/^最終更新: .*/最終更新: YYYY-MM-DD/'）。
- edit を使う場合は、直前の行から始まる複数行アンカーで指定し、oldString と newString の双方を最終行の最後の文字で終える（末尾に改行を足さない）。newString に末尾改行を含めると、元の末尾改行が置換範囲外に残るため、編集のたびにファイル末尾の改行が1つずつ増える（2026-11-27 実験で確認）。
- 備考：この節は OpenCode の edit が最終行の末尾改行を正しく扱えない問題（issue #66368）への回避策である。修正が確認できたら、この節ごと削除してよい。背景と評価の経緯は `opencode-usage-notes.md` の「2. 助言の層」を参照。
```

この節の実物は AGENTS.md 側が正であり、本書の上記は同一文の引用である。文面を変更する場合は、AGENTS.md 側と本書を同時に変更して同一文を保つこと。

主ルールが「shell へのタスク振り分け」である点が要点。末尾改行を付けるなという文字レベルの規律は、位置依存の例外であり、モデルが落としやすい。perl の行置換は行単位の処理で末尾改行に干渉しないため、累積問題も原理的に起きない。

### 2.3 評価の証拠（2026-11-27、VSCode 環境・TA Architect）

- 実験1：複数行アンカー＋ oldString 末尾改行なしの edit は成功したが、newString に末尾改行が含まれていたため、ファイル末尾が 0x0a → 0x0a0a に変化した。モデルは「正しく更新された」と報告したが、hex dump で発見した。同じ操作を繰り返すと末尾改行が1つずつ累積する。
- 実験2：改訂版ルール（双方の末尾改行なし）を AGENTS.md に入れた状態で再実験し、日付更新に成功。ファイルサイズは不変、末尾は 0a0a のまま安定し、増殖が止まった。
- 限界：このルールは増加を止めるもので、既に増えた分の修復はしない。

### 2.4 AGENTS.md の使い方メモ

- AGENTS.md はグローバル（`~/.config/opencode/AGENTS.md`）→ プロジェクトルート → ネストしたディレクトリの順に読み込まれ、**結合される。競合は自動解決されず**、両方ともモデルに渡される（policies の強制とは性質が違う）。
- HTML コメントも除去されず、そのままモデルに届く。説明や理由はコメントではなく通常の文章で書く。
- グローバルに書くルールは「原則中の原則」に絞る（例：返答は日本語、生成ファイル・ロックファイルは直接編集しない、破壊的な操作は実行前に確認、秘密情報を書き込まない）。リポジトリ固有の規約はプロジェクト側へ。
- グローバル／上位の AGENTS.md の編集はセッション中に自動反映されるが、ネストしたファイルの編集は新規セッションが必要。
- 個別の作業指示では、禁止形（「改行を付けるな」）より形の positive な指定（「oldString は直前の空行から始めて、日付の最後の数字で終えて」）の方が再現性が上がる。

### 2.5 削除条件と継続 watch

- issue #66368 が修正されたことを確認できたら、§2.2 の節は削除してよい（削除条件は節内の備考にも明記してある）。
- read／edit の解釈相違は最終行以外にも症状を出す可能性がある。新しい症状に気づいたら、本書に追記して知見を育てる。

---

## 3. 設定の層：v2.4.1 のモデル自動検出

### 3.1 現象

OpenCode v2.4.1 では、プロバイダ ID にビルトインの `ollama` を使うと、サーバーの `/v1/models` からモデルが**自動検出**される。config のモデル定義を削除してもベースモデルが表示され、利用できてしまう。カスタム ID（例：`ollama-ta`）では自動検出は働かず、定義したモデルだけが表示される。

### 3.2 影響

- 自動検出されたモデルの context は `/api/show` の規定値（qwen3.5:9b-nvfp4、gemma4:12b-nvfp4 とも 262,144）になる。config の `limit` 指定があればそちらが優先される。
- 共有サーバーでは、意図しないモデル（メモリを多く使う architect 系やベースモデル）を他の利用者が使えてしまう。

### 3.3 対策

- プロバイダ ID はビルトインの `ollama` ではなく、カスタム ID にする（例：Mac A 向けは `ollama-ta`、iride 向けは `ollama-iride`）。既定モデルの参照も `ollama-ta/ta:auditor` のように合わせて書き換える。
- ドキュメント内の JSON 例示も同じ穴になる。例示をコピーした人が自動検出を復活させないよう、例示のプロバイダ ID も実ファイルに揃える（2026-11-27 に両公開リポジトリの §4 例示がカスタム ID になっていることを確認済み）。

### 3.4 限界

クライアント側の config は「見え方」の制御にすぎず、共有サーバーでの利用制限にはならない。確実に制限するには、サーバー側の対策が要る。

- 前段プロキシで `/api/tags`・`/v1/models` をフィルタする
- 認証＋利用者ごとの許可リスト
- 用途ごとに Ollama インスタンスを分離する

---

## 付録：hex dump をエージェントに渡すとき

- `od -x` は2バイト単位の表示で、little-endian の環境（Apple Silicon の macOS 等）では各ワードがバイトスワップして見える。エージェントがテキスト再構成で長考したり読み間違えたりする原因になる。
- バイト単位で読める形式が無難。macOS では `hexdump -C`（例：`alias odx='hexdump -C'`）。`od` で通す場合は `od -A x -t x1`。
- なお `od -t x1z` の `z`（文字表示の付加）は GNU od の拡張で、macOS の BSD od にはない。

---

## 付録A：permissions / policies リファレンス

元文書 `opencode-permissions-and-policies.md` から、設定を書く際に必要なリファレンスを取り込んだもの。取得元は OpenCode 公式ドキュメント（config / permissions / policies / cli/config）と OpenAPI（`/api/permission/saved`）。

### A.1 設定ファイルと優先順位

| 種別 | パス |
|---|---|
| 管理設定（macOS） | `/Library/Managed Preferences/ai.opencode.managed.plist` |
| システム設定 | `/Library/Application Support/opencode/opencode.json(c)`（macOS）、`/etc/opencode`（Linux） |
| Console ワークスペース | 接続中の OpenCode Console |
| グローバル | `~/.config/opencode/opencode.json(c)` |
| プロジェクト（直接） | `<project>/opencode.json(c)` |
| プロジェクト（`.opencode`） | `<project>/.opencode/opencode.json(c)` |

CLI 固有の設定（テーマ、キーバインド、`session.permissions` など）は `cli.json` に書く。`opencode.json(c)` には書かない。

通常の設定項目（`model`、`providers` など）は「近い設定が勝つ」。

```text
グローバル < 外側プロジェクト < 内側プロジェクト < システム
```

### A.2 評価順の詳細

`permissions` は後勝ち（last match wins）で、ルールは次の順に積まれる。

```text
デフォルト基底ポリシー
  → 低優先度の設定
  → グローバル設定
  → エージェント固有ルール（agents.<id>.permissions）
```

`policies` は通常設定と逆で、広い（上位の）設定ほど後に評価される。

| 権威 | ソース |
|---|---|
| 1（最高） | macOS managed preferences |
| 2 | システム `opencode.json(c)` |
| 3 | 接続中 Console ワークスペース |
| 4 | グローバル `~/.config/opencode/opencode.json(c)` |
| 5 | 直接 `opencode.json(c)`（外側が内側より上位） |
| 6（最低） | `.opencode/opencode.json(c)`（外側が内側より上位） |

### A.3 permissions リファレンス

基本形：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git diff *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" }
  ]
}
```

| フィールド | 意味 |
|---|---|
| `action` | ツール権限の種別（下記） |
| `resource` | パス、コマンド、URL、クエリ、スキル ID など |
| `effect` | `allow` / `deny` / `ask` |

`effect` がマッチしなかった場合のデフォルトは `ask`。

主要アクション：

| action | resource |
|---|---|
| `read` | Location 相対パス、または外部の絶対パス |
| `edit` | `edit` / `write` / `patch` の対象パス |
| `glob` | glob パターン |
| `grep` | 正規表現（検索パスではない） |
| `shell` | スキャナが生成したコマンド文字列 |
| `subagent` | 対象エージェント ID |
| `skill` | スキル ID |
| `webfetch` | URL |
| `websearch` | 検索クエリ |
| `external_directory` | ディレクトリ境界（通常 `/*` で終わる） |
| `<server>_<tool>` | MCP ツール |
| `execute` | `*`（Code Mode の可否） |

ワイルドカード：`*` は0文字以上（`/` を含む）、`?` はちょうど1文字。シェルコマンドの `git status *` は、引数なしの `git status` にもマッチする。

デフォルト基底ポリシー（すべてのエージェントは次から始まる）：

```jsonc
[
  { "action": "*", "resource": "*", "effect": "allow" },
  { "action": "read", "resource": "*.env", "effect": "ask" },
  { "action": "read", "resource": "*.env.*", "effect": "ask" },
  { "action": "read", "resource": "*.env.example", "effect": "allow" }
]
```

承認ダイアログの選択肢：

| 選択 | 挙動 |
|---|---|
| `Allow once` | その1回だけ許可 |
| `Allow always` | 許可し、プロジェクトスコープの `allow` ルールとして保存 |
| `Reject` | 拒否（セッション内の保留中の承認も拒否） |

保存済み承認は設定ファイルを書き換えず、DB の `permission` テーブルに保存される（詳細は A.5）。

### A.4 policies リファレンス

基本形は §1.1〜§1.2 を参照。`tool.use` は `permissions` のチェックを hard-deny する。resource は `<action>:<value>` の形。

```jsonc
{
  "policies": [
    { "action": "tool.use", "resource": "shell:*", "effect": "deny" },
    { "action": "tool.use", "resource": "shell:git status *", "effect": "allow" }
  ]
}
```

この例では `git status` だけがポリシー解除され、実際の可否は `permissions` 側のルールで決まる。

| パターン | ブロック対象 |
|---|---|
| `shell:*` | すべてのシェルコマンド |
| `read:*/.ssh/*` | SSH 鍵の読み取り |
| `external_directory:*` | Location / worktree 外へのアクセス |
| `subagent:general` | `general` サブエージェント起動 |
| `*` | まだ deny されていないすべて |

- deny されたチェックは `Blocked by configuration policy` で失敗する
- エージェントルールと保存済み承認の後に適用される
- `ask` も `Allow always` も上書きして `deny` にする
- `allow` は先行する broad deny を解除するだけで、権限を与えるわけではない
- 何もマッチしなければ許可

その他のアクション：

| action | resource |
|---|---|
| `provider.use` | provider ID（`anthropic`、`ollama`、カスタム ID など） |
| `integration.connect` | integration ID |
| `integration.use` | `<integration>#<account>` |
| `mcp.use` | MCP サーバー名 |
| `skill.use` | スキル ID |
| `plugin.use` | パッケージ名 / 絶対パス |
| `websearch.use` | Web 検索 provider ID |

`mcp.use` / `skill.use` / `plugin.use` は OpenCode 2.2.3 以降、`websearch.use` は 2.2.6 以降で必要。

`experimental.policies` は非推奨。トップレベルの `policies` を使う。

### A.5 保存済み承認の詳細

- 保存先：`~/.local/share/opencode/opencode.db` の `permission` テーブル
- キー：`project_id` + `action` + `resource`
- スコープ：プロジェクト単位。全プロジェクト共通にはならない
- グローバル設定ファイルは書き換えられない

```bash
# 現在の Location のプロジェクトの保存済み承認一覧
opencode api permission.saved.list

# プロジェクトを指定
opencode api permission.saved.list --param projectID=<project-id>

# 1件削除
opencode api permission.saved.remove --param id=<permission-id>

# プロジェクト一覧
opencode api project.list
```

HTTP 形式：`opencode api GET /api/permission/saved`、`opencode api DELETE /api/permission/saved/<id>`。一括削除 API はないため、一覧の ID を順に削除する。未回答の承認リクエストは `/api/session/{sessionID}/permission` 系で別扱い。

DB 直接リセット（非推奨）：`DELETE FROM permission;` を実施する場合は、事前に DB をバックアップし、`opencode service stop` でサービスを停止してから行う。設定ファイルの `permissions` / `policies` は消えない。

### A.6 判断チャート

```text
操作を制限したい
│
├─ 毎回確認したい ----------------→ permissions の ask
│
├─ 絶対に実行させたくない --------→ policies の tool.use deny
│
├─ 特定コマンドだけ例外にしたい --→ broad deny → 例外 allow（後勝ち）
│
└─ 組織全体で強制したい ----------→ グローバル / システム / 管理設定
```

参照：

- <https://opencode.ai/docs/config>
- <https://opencode.ai/docs/permissions>
- <https://opencode.ai/docs/policies>
- <https://opencode.ai/docs/cli/config>
- <https://opencode.ai/config.json>（スキーマ）
- <https://opencode.ai/docs/openapi.json>（`permission.saved.*` / `project.list`）

---

## 変更履歴

- 2026-11-28：統合版の下書きを作成（permissions/policies 要点＋最終行ルール＋自動検出＋付録）。
- 2026-11-28：付録Aとして元文書 `opencode-permissions-and-policies.md` のリファレンス部分を取り込んだ。元文書は統合完了後に削除する方向に決定。
- 2026-11-28：確定版。§2.2 を AGENTS.md の節（参照行つき）と同一文に統一し、実物は AGENTS.md 側が正と明記した。
