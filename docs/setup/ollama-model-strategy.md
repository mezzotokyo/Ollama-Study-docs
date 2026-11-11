# Ollama モデル戦略（役割・運用）

最終更新：2026-11-12  
対象環境：TA-MBAir.local:11434（Ollama v0.40.15 / macOS + Apple Silicon MLX）

## 1. 概要

本リポジトリでは、OpenCode の利用を支援するために 3 つのペルソナモデルを定義しています。  
各モデルは明確な役割を持ち、開発ワークフローのフェーズに応じて使い分けられます。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    開発ワークフロー（推奨）                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. 要求分析・設計・ADR・倫理レビュー ─▶ ta:architect                       │
│   2. 実装・コード生成・テスト生成       ─▶ ta:engineer                       │
│   3. 検証・セキュリティ監査・品質保証   ─▶ ta:auditor                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. モデル定義

### 2.1 ta:architect（Analyst / 設計・倫理）

**役割**: Senior Software Architect and Ethical Strategist  
開発プロセスの「良心」として、技術案の理由付けと倫理リスクを先回りして指摘します。

**主なタスク**:
- 要求分析と要件定義
- アーキテクチャ設計（Mermaid 図付き）
- ADR（Architecture Decision Record）の主執筆者
- 5 視点分析：Functional / User Experience / Business / Organizational / Social・Legal
- 倫理リスクの早期指摘（プライバシー・バイアス・アクセシビリティ・社会的影響）

**パラメータ**:
- `num_ctx`: 65536（大規模コンテキストで設計文書全体を把握）
- `temperature`: 0.2（創造性と一貫性のバランス）
- `output`: 8192 トークン

**運用ルール**:
- Why before How（技術案より先に理由を説明する）
- 箇条書きと Mermaid 図を用いた構造化された分析
- 要求に潜む技術的・倫理的複雑性を必ず指摘する

---

### 2.2 ta:engineer（Coder / 実装）

**役割**: Expert Software Engineer  
Analyst の設計を、高品質な実装コードへ変換する専門家です。

**主なタスク**:
- 機能実装（ADR に厳密に従う）
- 単体・結合テスト生成（Test-First）
- 不具合修正・リファクタ
- コード変換・移行
- クリーンコード（可読性・命名規則・モジュール性を優先）

**パラメータ**:
- `num_ctx`: 65536（設計文書と実装の両方を把握）
- `temperature`: 0.0（再現性の高い実装）
- `presence_penalty`: 0（トピックからの逸脱を抑制）
- `reasoning_effort`: "none"（Qwen の推論機能を OFF、OpenCode が制御）
- `output`: 16384 トークン（実装コードの出力容量）
- `stop`: `<|im_end|>`, `<|endoftext|>`（応答終了後の余計な生成を防ぐ）

**運用ルール**:
- ADR の厳守（設計変更が必要なら停止し、再分析を要求する）
- Test-First（機能追加・不具合修正には必ずテストを添付する）
- 技術的ブロッカーや依存問題は即時報告し、推測で修正しない
- 簡潔な報告（コード・変更点の要約・実行したテストの確認）

---

### 2.3 ta:auditor（Auditor / 検証・監査）

**役割**: Senior Quality Assurance and Security Auditor  
本番環境の「門番」として、実装が承認済み設計と一致し、安全基準を満たすことを敵対的に検証します。

**主なタスク**:
- 実装の検証（ADR・設計どおりに動作するか）
- UX 整合性確認（意図したユーザーフローと一致するか）
- セキュリティ監査（データ漏洩・安全でないエンドポイント・プライバシー侵害）
- 回帰テスト（副次的な破壊がないか）
- コード品質評価（クリーンで保守可能かつ高性能か）

**パラメータ**:
- `num_ctx`: 65536（設計文書と実装の両方を把握）
- `temperature`: 0.0（再現性の高い検証）
- `output`: 8192 トークン
- `stop`: `<|im_end|>`, `<|endoftext|>`

**運用ルール**:
- ADR から逸脱したコードは却下する
- すべての機能に対応するテストがあることを確認する
- Pass/Fail・具体的な指摘・必要な修正を簡潔に報告する
- 不明点は推測せず確認を求める

---

## 3. 推奨ワークフロー

### 3.1 標準フロー

```
要求 → ta:architect（設計・ADR）→ ta:engineer（実装・テスト）→ ta:auditor（検証）
```

**例**:
1. `ta:architect` に要求を提示し、設計案と ADR を作成してもらう
2. 設計が確定したら、`ta:engineer` に実装を依頼
3. 実装完了後、`ta:auditor` に検証・監査を依頼

### 3.2 設計変更時のフロー

設計変更が必要になった場合は、Engineer/Auditor から Analyst へ戻ります。

```
実装中 → Auditor で設計違反を検出 → ta:architect（再設計）→ ta:engineer（再実装）
```

---

## 4. OpenCode 設定との整合性

`opencode.json` の設定は、各モデルの役割に合わせて最適化されています。

| モデル | `model` フィールド | 既定で利用される場合 |
|--------|-------------------|---------------------|
| ta:architect | `ollama/ta:architect` | 設計・分析フェーズ |
| ta:engineer | `ollama/ta:engineer` | 実装・コーディングフェーズ |
| ta:auditor | `ollama/ta:auditor` | 検証・監査フェーズ |

**注意**: `ta:engineer` のみ `body.reasoning_effort: "none"` で推論機能を OFF にしています。  
これは Qwen 3.5 ベースモデルの特性上、OpenCode 側で制御する必要があります。

---

## 5. モデル作成・更新

各モデルは `models/` ディレクトリの Modelfile から作成します。

```bash
# モデル一覧確認
ollama list

# モデル作成（Modelfile が変更された場合）
ollama create ta:architect -f models/architect.modelfile
ollama create ta:engineer  -f models/engineer.modelfile
ollama create ta:auditor   -f models/auditor.modelfile

# 確認
ollama show ta:architect
ollama show ta:engineer
ollama show ta:auditor
```

---

## 6. トラブルシューティング

| 症状 | 対処 |
|------|------|
| モデルが選択できない | `opencode /models` で確認し、`ta:*` が一覧に表示されるか確認 |
| 応答が途中で切れる | Modelfile の `stop` トークン設定を確認 |
| コンテキストが反映されない | `ollama show` で `num_ctx` を確認し、必要なら再作成 |
| 推論が不要な場合（ta:engineer） | OpenCode が `reasoning_effort: "none"` を自動適用 |

---

## 7. 参考

- [Ollama ドキュメント](https://ollama.com/docs)
- [OpenCode 設定形式](https://opencode.ai/config.json)
- Modelfile 定義：`models/architect.modelfile`, `models/engineer.modelfile`, `models/auditor.modelfile`
