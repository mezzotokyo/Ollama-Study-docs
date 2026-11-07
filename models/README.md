# Models（Ollama ペルソナ定義）

OpenCode から利用する Ollama 派生モデル（ペルソナ）の Modelfile を管理します。
ベースモデルの重みを共有するため、派生モデルの追加ディスク消費はほとんどありません。

## モデル一覧

| Modelfile | モデル名 | 役割 | ベース |
|---|---|---|---|
| `architect.modelfile` | `ta:architect` | Analyst（設計・ADR・倫理分析） | `gemma4:12b-nvfp4` |
| `engineer.modelfile` | `ta:engineer` | Coder（実装・テスト生成） | `qwen3.5:9b-nvfp4` |
| `auditor.modelfile` | `ta:auditor` | Auditor（検証・セキュリティ監査） | `qwen3.5:9b-nvfp4` |

## 作成・再作成

モデル作成には、このディレクトリの Modelfile を使用します。

```bash
cd ..

ollama create ta:architect -f models/architect.modelfile
ollama create ta:engineer  -f models/engineer.modelfile
ollama create ta:auditor   -f models/auditor.modelfile
```

リモートの Ollama ホストへ反映する場合:

```bash
OLLAMA_HOST=http://TA-MBAir.local:11434 ollama create ta:auditor -f models/auditor.modelfile
```

## 関連ドキュメント

- モデル構成・パラメータ・運用フロー: [`docs/setup/ollama-models.md`](../docs/setup/ollama-models.md)
- ペルソナ定義の考え方: [`docs/guides/how-to-define-persona.md`](../docs/guides/how-to-define-persona.md)
- OpenCode 設定（Source of Truth）: [`opencode.json`](../opencode.json)
