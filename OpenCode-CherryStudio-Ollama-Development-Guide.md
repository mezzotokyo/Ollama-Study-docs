# OpenCode × Cherry Studio × Ollama 開発運用ガイド

## 目的

ローカルLLM環境を活用し、

- 要求分析
- 設計
- コード生成
- レビュー
- ドキュメント作成
- 画像分析

を効率的に行うための運用ノウハウをまとめる。

本ガイドは以下の構成を前提とする。

```text
Remote AI Server
└─ Ollama
    ├─ gemma4:12b-nvfp4-analyst
    ├─ qwen3.5:9b-nvfp4-coder
    └─ gemma4:12b-nvfp4-largectx

Client
├─ VSCode + OpenCode
└─ Cherry Studio
```

## 基本方針

AIチャットをそのまま開発に利用するのではなく、

```text
考える
↓
整理する
↓
作る
```

の工程を分離する。

```text
Cherry Studio
↓
分析・構想・整理

Markdown
↓
成果物

OpenCode
↓
実装・修正
```

を基本フローとする。

## 各ツールの役割

### Cherry Studio

役割：思考空間

主な用途:
- 要求分析
- システム設計
- ADR作成
- 技術選定
- リスク分析
- 設計レビュー
- 画像分析
- ドキュメント要約

### OpenCode

役割：作業空間

主な用途:
- コード読解
- 実装
- テスト作成
- リファクタリング
- バグ修正

## モデルの役割分担

### Gemma Analyst

- num_ctx=32768
- thinking=true
- temperature=0.2

用途:
- 分析
- 設計
- ADR
- レビュー

### Qwen Coder

- num_ctx=32768
- thinking=false
- temperature=0
- presence_penalty=0

用途:
- 実装
- テスト作成
- コード生成

### Gemma LargeCtx

- num_ctx=65536
- thinking=true
- temperature=0.2

用途:
- 大規模解析
- 長文レビュー
- 複数ファイル横断分析

## 推奨開発フロー

### 新規開発

1. Cherry Studio + Gemma Analyst で要求分析
2. Markdown設計書を作成
3. OpenCode + Qwen Coder で実装
4. Gemma Analyst でレビュー

### 保守開発

既存コードが一次情報の場合は OpenCode を起点とする。

## コンテキスト管理方針

性能低下の主因はモデルサイズよりもコンテキストサイズである。

### 良い運用

- 要件分析チャット
- 設計チャット
- 実装チャット
- レビューチャット

を分離する。

### 悪い運用

朝から夜まで同一チャットを継続する。

## Markdownを成果物として扱う

```text
Cherry Studio
↓
分析

Markdown
↓
決定事項

OpenCode
↓
実装
```

## コードサイズ指針

- 推奨: 300〜800行
- 許容: 1000行程度
- 分割検討: 1500行超
- リファクタリング対象: 3000行超

## ドキュメントサイズ指針

- 1文書1テーマ
- 10〜15ページ超で分割を検討

## 画像分析活用

Gemma Analyst の活用例:
- 建築分析
- 旅行写真分析
- 案内板読解
- UIレビュー
- アーキテクチャ図レビュー

## プライバシー方針

### Local Tier

- Ollama
- Gemma
- Qwen

用途:
- 設計書
- ソースコード
- ADR
- 機密資料

### Public Tier

公開情報のみを扱う。

## 運用上の重要な発見

1. Gemma Analyst は画像分析や旅行支援にも有効。
2. OpenCode の重さはモデルよりコンテキスト肥大化の影響が大きい。
3. 32Kを標準、64Kを例外利用とする。

## 最終指針

```text
Cherry Studio = 考える
Markdown = 決定事項を固定する
OpenCode = 作る
```

AIとの会話を資産にするのではなく、Markdownへ圧縮・構造化して次工程へ引き継ぐ。