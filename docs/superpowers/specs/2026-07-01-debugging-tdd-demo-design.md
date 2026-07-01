# systematic-debugging 与 test-driven-development Demo 设计

## 背景

当前项目用于演示 superpowers 工作流。已有 `demo-vue3` Vue 3 示例工程，其中 `CartQuantity` 组件保留了一个适合现场演示的边界 bug：当数量为 `0` 且仍有库存时，增加按钮被错误禁用。

本次新增两个 skill 的 demo 演示材料：

- `systematic-debugging`：演示 bug 修复时先复现、再定位根因、最后最小修复并验证。
- `test-driven-development`：演示行为变更时先写失败测试，再写最小实现。

## 演示目标

### systematic-debugging

使用 `CartQuantity` 的现有失败测试作为演示起点。

演示要让观众看到：

1. Codex 不直接猜修复，而是先运行测试复现问题。
2. Codex 阅读失败信息和相关组件代码。
3. Codex 明确根因：`props.quantity && props.quantity < props.stock` 在 `quantity = 0` 时短路为 `0`，导致增加按钮被禁用。
4. Codex 只做最小修复：将可增加判断改为 `props.quantity < props.stock`。
5. Codex 重新运行测试，证明问题修复。

### test-driven-development

在同一个 `CartQuantity` 组件上新增一个很小的边界行为：

> 当接口返回异常负库存时，组件必须按 `0` 库存处理，增加按钮禁用，点击后不能触发 `update:quantity`。

演示要让观众看到：

1. Codex 先写测试定义期望行为。
2. Codex 先运行测试，确认测试能约束该行为。
3. Codex 再做最小实现或确认已有最小实现已满足。
4. Codex 重新运行测试，证明行为被保护。

## 演示方式

采用“代码演示 + 中文讲稿提示”的形式，不新增复杂页面。

原因：

- 这两个 skill 的核心价值是工程流程，不是 UI 展示。
- `CartQuantity` 组件足够小，现场容易理解。
- 同一个组件可以连续承载两个 demo，减少业务上下文切换。

## 文件范围

预计涉及文件：

- `demo-vue3/src/components/CartQuantity.vue`
- `demo-vue3/src/components/CartQuantity.test.js`
- `README.md`
- `superpowers-core-workflow.md`

不修改仓库监控大屏相关文件。

## Demo Prompt

### systematic-debugging prompt

```text
这是一个禅道 bug 任务。请使用 systematic-debugging，先复现问题，再定位根因，做最小修复并验证。

问题：购物车数量控件在 quantity = 0 且 stock > 0 时，增加按钮被禁用，导致无法从 0 增加到 1。
```

### test-driven-development prompt

```text
这是一个行为变更任务。请使用 test-driven-development，先写失败测试，再做最小实现并验证。

需求：购物车数量控件在 stock < 0 时，必须按 0 库存处理，增加按钮禁用，点击后不能触发 update:quantity。
```

## 验收标准

1. `CartQuantity` bug 被最小修复。
2. `CartQuantity` 增加 `stock < 0` 边界测试。
3. `CartQuantity.test.js` 相关测试全部通过。
4. 全量测试中，不能因为本次改动新增失败。
5. 中文文档和 README 能说明两个 demo 的演示入口、推荐 prompt 和预期过程。

## 非目标

- 不新增 UI 页面。
- 不引入新的测试框架或依赖。
- 不重构 `CartQuantity` 之外的代码。
- 不修改仓库监控大屏实现。
