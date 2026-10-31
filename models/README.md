# Models（Ollama ペルソナ定義）

OpenCode から利用する Ollama 派生モデル（ペルソナ）の Modelfile を管理します。
ベースモデルの重みを共有するため、派生モデルの追加ディスク消費はほとんどありません。

## モデル一覧

| Modelfile | モデル名 | 役割 | ベース |
|---|---|---|---|
| `ethical_architect.modelfile` | `iride:ethical_architect` | Analyst（設計・ADR・倫理分析） | `gemma4:12b-nvfp4` |
| `expert_engineer.modelfile` | `iride:expert_engineer` | Coder（実装・テスト生成） | `qwen3.5:9b-nvfp4` |
| `technical_auditor.modelfile` | `iride:technical_auditor` | Auditor（検証・セキュリティ監査） | `qwen3.5:9b-nvfp4` |

## 作成・再作成

```bash
cd /Users/shin1/Dev/Ollama_Study/models

ollama create iride:ethical_architect -f ethical_architect.modelfile
ollama create iride:expert_engineer   -f expert_engineer.modelfile
ollama create iride:technical_auditor -f technical_auditor.modelfile
```

リモートの Ollama ホストへ反映する場合:

```bash
OLLAMA_HOST=http://iride.local:11434 ollama create iride:technical_auditor -f technical_auditor.modelfile
```

## 関連ドキュメント

- モデル構成・パラメータ・運用フロー: [`docs/setup/ollama-models.md`](../docs/setup/ollama-models.md)
- ペルソナ定義の考え方: [`docs/guides/how-to-define-persona.md`](../docs/guides/how-to-define-persona.md)
- OpenCode 設定（Source of Truth）: [`opencode.json`](../opencode.json)
