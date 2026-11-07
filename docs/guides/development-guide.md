# OpenCode × Cherry Studio × Ollama 開発運用ガイド（改訂版）

## 基本思想

```text
Cherry Studio
  = システムを理解する場所

OpenCode
  = システムを変更する場所

Markdown
  = 共通メモリ
```

---

# AIロール構成

## Cherry Studio Analyst

主な役割:

- 要求分析
- 業務分析
- ADR作成
- 技術選定
- アーキテクチャ設計
- 画像分析
- PDFレビュー

キーワード:

```text
コードより概念
```

利用対象:

- 要件
- 設計書
- 図表
- スクリーンショット
- 写真

---

## OpenCode Analyst

主な役割:

- コード読解
- リファクタリング分析
- PRレビュー
- 依存関係分析
- 技術的負債調査

キーワード:

```text
コードが一次情報
```

利用対象:

- ソースコード
- Git Diff
- ワークスペース
- ログ

---

## OpenCode Coder

主な役割:

- 実装
- テスト生成
- 修正
- コード変換

---

# 使い分けマトリクス

| 分析対象 | Cherry Studio Analyst | OpenCode Analyst |
|----------|----------|----------|
| 要求分析 | ◎ | △ |
| 業務分析 | ◎ | △ |
| ADR | ◎ | △ |
| 設計方針 | ◎ | ○ |
| 設計レビュー | ◎ | ○ |
| コードレビュー | △ | ◎ |
| PRレビュー | △ | ◎ |
| バグ解析 | △ | ◎ |
| 単一ファイル解析 | ○ | ◎ |
| リポジトリ解析 | △ | ◎ |
| UIレビュー | ◎ | △ |
| 画像分析 | ◎ | △ |

---

# 推奨ワークフロー

## 新規開発

```text
Cherry Studio Analyst
    ↓
要求分析
    ↓
ADR
    ↓
Architecture
    ↓
Markdown
    ↓
GitHub
    ↓
OpenCode Coder
    ↓
実装
```

---

## 保守開発

```text
OpenCode Analyst
    ↓
既存コード分析
    ↓
改善案
    ↓
Markdown
    ↓
OpenCode Coder
    ↓
実装
```

---

# ループバック運用

Cherry Studio → OpenCode の一方向ではなく循環型運用を推奨。

```text
Cherry Studio Analyst
    ↓
設計
    ↓
Markdown
    ↓
OpenCode Coder
    ↓
実装
    ↓
OpenCode Analyst
    ↓
レビュー結果
    ↓
Markdown
    ↓
Cherry Studio Analyst
    ↓
設計改善
```

---

# Markdownの位置付け

Markdownは単なる成果物ではなく、AI間の共通メモリとして扱う。

推奨構成:

```text
docs/
├─ requirements/
├─ architecture/
├─ adr/
├─ reviews/
├─ implementation-notes/
└─ ai-findings/
```

---

# コンテキスト管理原則

重要な発見:

```text
性能低下の主因
≒ コンテキストサイズ
```

モデルサイズよりも、毎ターン送信される情報量を最適化する。

推奨:

- 要件分析チャット
- 設計チャット
- 実装チャット
- レビューチャット

を分離する。

---

# モデル運用方針

## Gemma Analyst

```text
num_ctx=65536
thinking=true
temperature=0.2
```

用途:

- 要求分析
- ADR
- レビュー
- 画像分析

---

## Qwen Coder

```text
num_ctx=65536
thinking=false
temperature=0
```

用途:

- 実装
- テスト
- コード生成

---

## Gemma LargeCtx

```text
num_ctx=65536
thinking=true
```

用途:

- 巨大ログ解析
- リポジトリ横断分析
- 長文ドキュメントレビュー

通常運用では利用しない。

---

# 最終結論

```text
Cherry Studio
    = 考える

OpenCode Analyst
    = 理解する

OpenCode Coder
    = 作る

Markdown
    = 記憶する
```

人間とAIの会話を資産化するのではなく、Markdownへ圧縮して循環的に活用する。
