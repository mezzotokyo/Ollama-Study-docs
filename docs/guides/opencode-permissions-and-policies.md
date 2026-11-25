# OpenCode Permissions / Policies 設定ガイド

OpenCode V2 の `permissions` と `policies` に関する設定リファレンス。
本リポジトリ（`Ollama_Study`）で採用している設定と、動作確認結果を併記する。

> 取得元: <https://opencode.ai/docs/config> / <https://opencode.ai/docs/permissions> / <https://opencode.ai/docs/policies> / <https://opencode.ai/docs/cli/config> / OpenAPI (`/api/permission/saved`)

---

## 1. 全体像

| 項目 | `permissions` | `policies` |
|---|---|---|
| 目的 | エージェントがツールを使う際の承認制御 | 提供者・ツール・連携などの利用可否を強制 |
| 指定できる `effect` | `allow` / `deny` / `ask` | `allow` / `deny` のみ（プロンプトは出せない） |
| プロンプト | 出すことができる | 絶対に出ない |
| 保存済み承認との関係 | 保存済み `allow` がプロジェクトスコープで効く | 保存済み承認・`ask` より後に適用され hard-deny する |
| `allow` の意味 | そのまま利用を許可 | 先行する広い `deny` を解除するだけ（権限を新たに与えない） |
| 主な用途 | 「commit 前に確認したい」 | 「push は絶対に禁止」「provider を禁止」 |

**使い分けの基本**

- 確認させたい操作 → `permissions` の `ask`
- 完全に禁止したい操作 → `policies` の `deny`
- 両方を併用してもよい（むしろ推奨）

---

## 2. 設定ファイルと優先順位

### 2.1 配置場所

| 種別 | パス |
|---|---|
| 管理設定（macOS） | `/Library/Managed Preferences/ai.opencode.managed.plist` |
| システム設定 | `/Library/Application Support/opencode/opencode.json(c)`（macOS）、`/etc/opencode`（Linux） |
| Console ワークスペース | 接続中の OpenCode Console |
| グローバル | `~/.config/opencode/opencode.json(c)` |
| プロジェクト（直接） | `<project>/opencode.json(c)` |
| プロジェクト（`.opencode`） | `<project>/.opencode/opencode.json(c)` |

CLI 固有の設定（テーマ、キーバインド、`session.permissions` など）は **`cli.json`** であり、`opencode.json(c)` には書かない。

```json title="~/.config/opencode/cli.json"
{
  "$schema": "https://opencode.ai/v2/cli.json"
}
```

### 2.2 通常設定の優先順位

通常の設定項目（`model`、`providers` など）は **近い設定が勝つ**。

```text
グローバル < 外側プロジェクト < 内側プロジェクト < システム
```

### 2.3 `permissions` の評価順

`permissions` は **後勝ち（last match wins）** で、ルールは次の順に積まれる。

```text
デフォルト基底ポリシー
  → 低優先度の設定
  → グローバル設定
  → エージェント固有ルール（agents.<id>.permissions）
```

したがって、**グローバルの `ask` はプロジェクトの `allow` より後に評価され、勝つ**。
これが「プロジェクトで `Allow always` を押してもグローバルの確認が残る」根拠になる。

> ドキュメント上、保存済み承認は「プロジェクトスコープの `allow` ルール」と明記されている。
> 保存済み `allow` が設定済み `deny` を覆さないことも明記されている。
> `ask` に対する明示的な記述はないが、上記の合成順からグローバル `ask` が優先されると解釈する。

### 2.4 `policies` の評価順

`policies` は通常設定と **逆** で、広い（上位の）設定ほど後に評価される。

| 権威 | ソース |
|---|---|
| 1（最高） | macOS managed preferences |
| 2 | システム `opencode.json(c)` |
| 3 | 接続中 Console ワークスペース |
| 4 | グローバル `~/.config/opencode/opencode.json(c)` |
| 5 | 直接 `opencode.json(c)`（外側が内側より上位） |
| 6（最低） | `.opencode/opencode.json(c)`（外側が内側より上位） |

同一ファイル内では **書いた順番で後勝ち**。
よって「広い deny → 例外 allow」の順に書く。

---

## 3. `permissions` の書き方

### 3.1 基本形

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git diff *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" },
  ],
}
```

| フィールド | 意味 |
|---|---|
| `action` | ツール権限の種別（下記） |
| `resource` | パス、コマンド、URL、クエリ、スキル ID など |
| `effect` | `allow` / `deny` / `ask` |

`effect` がマッチしなかった場合のデフォルトは `ask`。

### 3.2 主要アクション

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

### 3.3 ワイルドカード

| パターン | 意味 |
|---|---|
| `*` | 0 文字以上（`/` を含む） |
| `?` | ちょうど 1 文字 |

シェルコマンドの `git status *` は、引数なしの `git status` にもマッチする。

### 3.4 デフォルト基底ポリシー

すべてのエージェントは次から始まる。

```jsonc
[
  { "action": "*", "resource": "*", "effect": "allow" },
  { "action": "read", "resource": "*.env", "effect": "ask" },
  { "action": "read", "resource": "*.env.*", "effect": "ask" },
  { "action": "read", "resource": "*.env.example", "effect": "allow" },
]
```

### 3.5 承認ダイアログの選択肢

| 選択 | 挙動 |
|---|---|
| `Allow once` | その 1 回だけ許可 |
| `Allow always` | 許可し、**プロジェクトスコープの `allow` ルールとして保存** |
| `Reject` | 拒否（セッション内の保留中の承認も拒否） |

保存済み承認は設定ファイルを書き換えず、DB の `permission` テーブルに保存される。

---

## 4. `policies` の書き方

### 4.1 基本形

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "policies": [
    { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" },
    { "action": "tool.use", "resource": "edit:*.env", "effect": "deny" },
    { "action": "provider.use", "resource": "openai", "effect": "deny" },
  ],
}
```

| フィールド | 値 |
|---|---|
| `action` | `provider.use` / `tool.use` / `integration.connect` / `integration.use` / `mcp.use` / `skill.use` / `plugin.use` / `websearch.use` |
| `resource` | 文字列またはワイルドカード |
| `effect` | `allow` / `deny` |

### 4.2 `tool.use`

`permissions` のチェックを **hard-deny** する。resource は `<action>:<value>`。

```jsonc
{
  "policies": [
    { "action": "tool.use", "resource": "shell:*", "effect": "deny" },
    { "action": "tool.use", "resource": "shell:git status *", "effect": "allow" },
  ],
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
- エージェントルールと保存済み承認の **後に** 適用される
- `ask` も `Allow always` も上書きして `deny` にする
- `allow` は単に先行する broad deny を解除するだけであり、権限を与えるわけではない
- 何もマッチしなければ許可

### 4.3 その他のアクション

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

### 4.4 非推奨フィールド

`experimental.policies` は非推奨。トップレベルの `policies` を使う。

```jsonc
// 非推奨
"experimental": {
  "policies": [{ "action": "provider.use", "resource": "openai", "effect": "deny" }]
}
```

---

## 5. 本リポジトリの設定（確認時点）

### 5.1 プロジェクト設定 `opencode.json`

```jsonc
"model": "ollama/ta:auditor",
"permissions": [
  { "action": "shell", "resource": "git commit *", "effect": "ask" }
],
"policies": [
  { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" }
]
```

- `git commit` → 毎回確認
- `git push` → OpenCode 内では完全禁止

### 5.2 グローバル設定 `~/.config/opencode/opencode.json`

同じ 2 ルールがグローバルにも設定されている。

```jsonc
"permissions": [
  { "action": "shell", "resource": "git commit *", "effect": "ask" }
],
"policies": [
  { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" }
]
```

これにより、仮にプロジェクト側で `Allow always` を押しても、グローバルの `ask` が後勝ちで残る。

### 5.3 `cli.json` の注意点

`session.permissions` は CLI 側の設定で、`prompt` / `autoaccept` を取る。

```jsonc
{
  "session": {
    "permissions": "prompt"
  }
}
```

`autoaccept` は全承認を自動化するため、意図に反する。目的が「確認を残す」なら `prompt` のままにする。

---

## 6. 永続的な yes（`Allow always`）の扱い

### 6.1 保存先とスコープ

- 保存先: `~/.local/share/opencode/opencode.db` の `permission` テーブル
- キー: `project_id` + `action` + `resource`
- スコープ: **プロジェクト単位**。全プロジェクト共通にはならない
- グローバル設定ファイルは書き換えられない

```sql
CREATE TABLE `permission` (
  `id` text PRIMARY KEY,
  `project_id` text NOT NULL,
  `action` text NOT NULL,
  `resource` text NOT NULL,
  `time_created` integer NOT NULL,
  `time_updated` integer NOT NULL
);
```

### 6.2 API による確認・削除

```bash
# 現在の Location のプロジェクトの保存済み承認一覧
opencode api permission.saved.list

# プロジェクトを指定
opencode api permission.saved.list --param projectID=<project-id>

# 1 件削除
opencode api permission.saved.remove --param id=<permission-id>

# プロジェクト一覧
opencode api project.list
```

HTTP 形式:

```bash
opencode api GET /api/permission/saved
opencode api DELETE /api/permission/saved/<id>
```

- 一括削除 API はない。一覧の ID を順に削除する
- 未回答の承認リクエストは `/api/session/{sessionID}/permission` 系で別扱い

### 6.3 DB 直接リセット（非推奨）

```sql
DELETE FROM permission;
```

実施する場合:

1. 事前に DB をバックアップする
2. `opencode service stop` でサービスを停止する
3. 設定ファイルの `permissions` / `policies` は消えないことを理解する

---

## 7. 動作確認ログ（2026-11-25）

この環境で実施した確認結果:

```bash
$ opencode api permission.saved.list
{"data":[]}

$ sqlite3 ~/.local/share/opencode/opencode.db "SELECT COUNT(*) FROM permission;"
0
```

全 15 プロジェクトに対して `permission.saved.list` を実行したが、すべて `0` 件。
よってリセット対象は存在しなかった。

---

## 8. 判断チャート

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

---

## 9. 参照

- <https://opencode.ai/docs/config>
- <https://opencode.ai/docs/permissions>
- <https://opencode.ai/docs/policies>
- <https://opencode.ai/docs/cli/config>
- <https://opencode.ai/config.json>（スキーマ）
- <https://opencode.ai/docs/openapi.json>（`permission.saved.*` / `project.list`）
