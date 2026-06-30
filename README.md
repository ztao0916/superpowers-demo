# Superpowers 分享材料

这里保留两类内容：

- [superpowers-core-workflow.md](superpowers-core-workflow.md)：围绕禅道任务整理的七个核心 skill。
- [demo-vue3](demo-vue3)：用于现场演示的 Vue 3 小 bug。

## 分享主线

这次只介绍七个 skill：

- `using-superpowers`
- `brainstorming`
- `using-git-worktrees`
- `writing-plans`
- `systematic-debugging`
- `test-driven-development`
- `verification-before-completion`

主线是从禅道任务出发，讲清楚 Codex 在新页面、老需求优化、bug 修复时应该怎么被约束。

## Demo 准备

```bash
cd demo-vue3
npm install
npm test
```

初始测试预期会失败。这个失败就是演示起点。

查看页面：

```bash
npm run dev
```

## 现场 Demo Prompt

在 `demo-vue3` 目录里对 Codex 使用这个 prompt：

```text
There is a boundary bug in the cart quantity control. Please use systematic debugging: reproduce the failure, identify the cause, make the smallest fix, and verify with tests.
```

预设 bug：当数量为 `0` 且仍有库存时，增加按钮被错误禁用。正确行为是可以从 `0` 增加到 `1`。
