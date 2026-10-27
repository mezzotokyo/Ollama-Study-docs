# Verification & Validation Phase

The development workflow is not complete until the implementation is verified. Every task must include a verification step.

## Verification Standards
- **Unit/Integration Tests:** The Coder must provide and run tests for the new functionality.
- **Regression Testing:** For Brownfield tasks, ensure existing functionality remains intact.
- **Style & Standards:** Ensure the code adheres to the project's style guide.
- **Performance Check:** If applicable, verify that the change doesn't introduce significant latency or memory overhead.

## Workflow Integration
`実装 (OpenCode Coder) -> 検証 (Verification) -> 共通メモリ更新 (Final Review)`
