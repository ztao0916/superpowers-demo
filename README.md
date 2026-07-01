# Superpowers 分享材料

这里保留两类内容：

- [superpowers-core-workflow.md](superpowers-core-workflow.md)：为什么使用 `superpowers`，以及核心 skill 的使用场景。
- [demo-vue3](demo-vue3)：用于现场演示的 Vue 3 小 demo。

## 分享主线

先讲核心 skill：开发前选流程、澄清需求、拆计划、隔离工作区；开发中用证据调试、用测试定义行为；完成前必须验证。

## Demo 准备

```bash
cd demo-vue3
npm install
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

初始测试预期会失败。这个失败就是 `systematic-debugging` 的演示起点。

查看页面：

```bash
npm run dev
```

## 现场 Demo Prompt

### systematic-debugging

```text
这是一个禅道 bug 任务。请使用 systematic-debugging，先复现问题，再定位根因，做最小修复并验证。

问题：购物车数量控件在 quantity = 0 且 stock > 0 时，增加按钮被禁用，导致无法从 0 增加到 1。
```

预设 bug：当数量为 `0` 且仍有库存时，增加按钮被错误禁用。正确行为是可以从 `0` 增加到 `1`。

### test-driven-development

```text
这是一个行为变更任务。请使用 test-driven-development，先写失败测试，再做最小实现并验证。

需求：购物车数量控件在 quantity < 0 时，必须按 0 数量处理，展示为 0，减少按钮禁用，仍可在有库存时从 0 增加到 1。
```

演示重点：先写测试看到 RED，再写最小实现看到 GREEN。TDD 不是为了多写测试，而是为了先定义“什么叫改对了”。
