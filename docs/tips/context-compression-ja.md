# AI支援開発におけるコンテキスト圧縮Tips

## 目的

本ドキュメントは以下の環境において、

- Cherry Studio
- OpenCode
- Ollama
- Analyst / Coder ワークフロー

のコンテキスト消費を抑え、より長時間・高品質なセッションを維持するための実践的なノウハウをまとめたものである。

---

# 基本原則

会話は「作業メモリ（Working Memory）」、

Markdownは「長期記憶（Long-Term Memory）」として扱う。

```text
会話
 ↓
知識の抽出
 ↓
Markdown
 ↓
共通メモリ
```

会話履歴そのものを記憶として保持し続けない。

---

# Tip 1: 共通メモリへ知識を圧縮する

## 問題

長時間の議論はコンテキストを急速に消費する。

例

```text
要件定義
 ↓
設計議論
 ↓
実装方針検討
 ↓
レビュー
 ↓
改善提案
```

---

## 対策

定期的にMarkdownへ要約・圧縮する。

例

```text
Requirements.md

Architecture.md

ADR-001.md

Review_Report.md

AI_Findings.md
```

---

## 効果

例えば

```text
50,000トークン
```

の会話を

```text
2,000〜5,000トークン
```

程度の知識へ圧縮できる。

---

# Tip 2: 共通メモリは英語で記述する

## 発見

同じ内容でも英語の方がトークン消費が少ない場合が多い。

例

日本語

```markdown
# 認証認可方式の見直し
```

英語

```markdown
# Authentication Strategy Review
```

---

## 推奨対象

以下は可能な限り英語で記述する。

- ADR
- Architecture
- AI Findings
- Shared Memory
- OpenCode用の作業メモ

---

## 効果

- コンテキスト消費削減
- 用語の統一
- モデル間の意味伝達改善
- セッション寿命の延長

---

# Tip 3: Refinementセッションは英語で行う

## 発見

対象システムやドキュメントが日本語でも、

AIとの改善・分析・リファインメント作業を英語で行うとコンテキスト消費を抑えられる。

例

```text
日本語要件
 ↓
英語で分析
 ↓
英語で共通メモリ作成
 ↓
英語で改善サイクル
```

---

## 効果

より多くの改善サイクルを1つのセッション内で回せる。

実際に複数の Improvement を単一セッションで完了できた。

---

# Tip 4: 「考える」と「作る」を分離する

## Cherry Studio

役割

```text
分析

設計

レビュー

意思決定
```

生成物

```text
Requirements

Architecture

ADR

AI Findings
```

---

## OpenCode

役割

```text
コード理解

実装

リファクタリング

テスト作成
```

入力

```text
Requirements

Architecture

ADR
```

---

## 効果

実装セッションが設計議論を抱え込まなくなる。

---

# Tip 5: セッションは使い切る前にリセットする

## 悪い例

```text
要件

↓

設計

↓

実装

↓

レビュー

↓

追加要件

↓

さらに実装
```

を同一チャットで継続する。

---

## 良い例

```text
要件整理
 ↓
Requirements.md

新規チャット

設計
 ↓
Architecture.md

新規チャット

実装
```

---

## 効果

コンテキスト使用量を低く維持できる。

---

# Tip 6: 情報の成熟度で保存場所を分ける

## Working Memory

会話

特徴

```text
一時的

探索的

破棄可能
```

例

- ブレインストーミング
- 設計議論
- 仮説検討

---

## Shared Memory

Markdown

特徴

```text
構造化済み

再利用可能

共有可能
```

例

```text
ADR

Architecture

AI Findings
```

---

## Archive

特徴

```text
参照専用

変更不要
```

例

```text
完了済ADR

旧設計

過去の意思決定
```

---

# Tip 7: Context Usage を監視する

## Green

```text
0%〜70%
```

通常運転。

---

## Yellow

```text
70%〜90%
```

整理を開始する。

共通メモリへ反映を始める。

---

## Orange

```text
90%〜100%
```

要約と知識圧縮を行う。

セッション終了準備。

---

## Red

```text
100%以上
```

新規チャットへの移行を検討する。

会話を積み増しし続けない。

---

# Tip 8: ADRを圧縮アーティファクトとして利用する

## 悪い例

毎回説明する

```text
なぜJWTなのか

なぜRedisなのか

なぜイベント駆動なのか
```

---

## 良い例

```markdown
# ADR-003 Authentication Strategy

## Context

...

## Decision

Use JWT

## Alternatives

Session Auth
OAuth

## Consequences

...
```

---

## 効果

数百のメッセージを1つの文書へ圧縮できる。

---

# Tip 9: OpenCodeへ渡す情報を最小化する

## 避ける

```text
会話履歴全部
```

---

## 推奨

```text
Requirements.md

Architecture.md

ADR

必要なコードのみ
```

---

## 効果

- Promptサイズ削減
- 応答速度向上
- 実装品質向上

---

# Tip 10: 共通メモリを唯一の情報源とする

## 信頼しないもの

```text
過去チャットの記憶
```

---

## 信頼するもの

```text
docs/architecture/

docs/adr/

docs/ai-findings/

.opencode/shared/
```

---

# 重要な学び

コンテキストウィンドウを大きくすることよりも、

```text
知識を圧縮する

↓

知識を永続化する

↓

必要なときだけ再利用する
```

ことの方が効果が大きい。

---

# ベストプラクティス

```text
会話
 ↓
共通メモリ
 ↓
新しいセッション
```

を繰り返す。

以下は避ける。

```text
会話
 ↓
会話
 ↓
会話
 ↓
110Kトークン
 ↓
性能劣化
```

---

# 実践から得られた知見

以下の組み合わせは特に効果が高かった。

```text
✅ 共通メモリをMarkdown化

✅ 共通メモリを英語化

✅ AIとのRefinementを英語化

✅ セッションを適切に分割

✅ AnalystとCoderの役割分離
```

これらを組み合わせることで、

コンテキスト消費を抑えながら、より多くの改善サイクルを1つのセッション内で実行できる。

