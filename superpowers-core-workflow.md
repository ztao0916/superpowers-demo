# Superpowers 核心工作流

这份文档只介绍七个最常用的 skill。主线不是“记住 skill 名称”，而是把 Codex 放进日常开发流程里：拿到禅道任务，理解需求，隔离分支，拆计划，开发验证，再准备合并。

## 一条主线

```text
禅道任务
  -> using-superpowers
  -> brainstorming
  -> using-git-worktrees
  -> writing-plans
  -> systematic-debugging / test-driven-development
  -> verification-before-completion
```

这条线适合两类常见任务：

- 新页面、新功能、新模块。
- 老需求优化、历史逻辑调整、bug 修复。

## 1. using-superpowers

`using-superpowers` 是入口 skill。它的作用是让 Codex 先判断当前任务应该进入哪种工作流，而不是直接开始写代码。

适合在每次开始任务时使用，尤其是禅道任务描述比较短、上下文比较散的时候。

常用 prompt：

```text
Please use using-superpowers first, then decide which workflow fits this Zentao task.
```

看点：

- Codex 是否先识别任务类型。
- Codex 是否说明后续会用哪些 skill。
- Codex 是否避免直接进入实现。

## 2. brainstorming

`brainstorming` 用来把模糊需求变清楚。禅道任务里经常只有一句话，或者只写了现象，没有写边界、页面状态、接口影响和验收方式。

适合这些情况：

- 新页面只有大概描述。
- 老需求要优化，但没有说清楚保留哪些行为。
- 产品描述里有多个可能解释。
- 不确定影响哪些页面、接口、权限或状态。

常用 prompt：

```text
Please use brainstorming before implementation. Help me clarify the smallest useful version of this Zentao task first.
```

Codex 应该帮忙问清楚：

- 这个任务要解决什么问题。
- 页面或逻辑的边界在哪里。
- 哪些已有行为不能变。
- 需要哪些验收条件。
- 是否需要拆成多个独立任务。

分享时可以强调：需求不清时，好的 Codex 不是马上写代码，而是先帮我们把任务变成可执行说明。

## 3. using-git-worktrees

`using-git-worktrees` 用来隔离并行需求。一个人同时处理多个禅道任务时，如果都堆在同一个目录和分支里，很容易出现未提交改动互相影响、切分支困难、回滚不清晰的问题。

适合这些情况：

- 同时开发多个禅道任务。
- 当前目录已有未完成改动，但又要插入另一个需求。
- 某个任务需要独立分支开发。
- 一个需求准备合并到 `dev`，另一个需求还不能合并。

常用 prompt：

```text
Please use using-git-worktrees to set up an isolated workspace for this Zentao task before making changes.
```

Codex 应该做的事：

- 先判断当前是否已经在隔离工作区。
- 如果需要，再创建独立 worktree 和分支。
- 在新工作区里安装依赖、跑基线测试。
- 确认当前工作区干净后再开始改代码。

分享时可以强调：worktree 不是为了炫技，而是为了让每个任务有自己的上下文，方便开发、验证、回滚和合并。

## 4. writing-plans

`writing-plans` 用来在较大改动前写计划。新页面、跨多个组件的优化、接口联动、权限逻辑调整，都不适合让 Codex 直接开改。

适合这些情况：

- 新页面或新模块。
- 一个任务会改多个文件。
- 需要同时改前端页面、接口调用和状态处理。
- 老需求优化涉及兼容历史行为。

常用 prompt：

```text
Please use writing-plans before editing files. Include the files to touch, implementation steps, and verification commands.
```

计划里应该包含：

- 要改哪些文件。
- 每一步改什么。
- 哪些行为要保持不变。
- 如何验证。
- 哪些测试或手动检查必须跑。

分享时可以强调：计划不是形式主义。它可以提前暴露任务范围，避免 Codex 一边猜一边改。

## 5. systematic-debugging

`systematic-debugging` 用来修 bug。老需求优化里经常会遇到“这个页面某种情况下不对”“以前好像不是这样”的问题，这时候最怕 Codex 直接猜原因。

适合这些情况：

- 禅道任务是 bug。
- 现象能描述，但原因不清楚。
- 线上或测试环境出现边界问题。
- 老逻辑改动后出现回归。

常用 prompt：

```text
Please use systematic debugging. Reproduce the issue, identify the cause, make the smallest fix, and verify it.
```

Codex 应该按这个顺序走：

1. 复现问题。
2. 找到证据。
3. 定位原因。
4. 做最小修复。
5. 重新验证。

分享时可以强调：bugfix 的核心不是“改得快”，而是“知道自己为什么这么改”。

## 6. test-driven-development

`test-driven-development` 用来处理新行为和行为变化。它要求先写失败测试，再写实现。不是所有前端页面都容易完整自动化测试，但核心逻辑、工具函数、状态变更、边界规则都很适合。

适合这些情况：

- 新增业务规则。
- 修改已有判断逻辑。
- 修复一个可以自动化复现的 bug。
- 抽取或调整公共函数。

常用 prompt：

```text
Please use TDD. Write the failing test first, run it, implement the minimum code, then verify.
```

Codex 应该做到：

- 先写一个能失败的测试。
- 运行测试，确认失败原因正确。
- 写最小实现。
- 重新运行测试。
- 必要时再清理代码。

分享时可以强调：TDD 不是为了多写测试，而是为了证明 Codex 真的理解了行为变化。

## 7. verification-before-completion

`verification-before-completion` 用在收尾。Codex 很容易在“代码改完”后直接说完成，但团队真正需要的是可验证的完成。

适合这些情况：

- 准备提交代码。
- 准备提测。
- 准备合并到 `dev` 或 `master`。
- Codex 已经声称修好了某个问题。

常用 prompt：

```text
Please use verification-before-completion. Run the relevant checks and report exactly what passed or failed.
```

验证内容可以包括：

- 单元测试。
- 类型检查。
- lint。
- 构建。
- 关键页面手动验证。
- 与禅道验收点逐条对照。

分享时可以强调：完成不是“看起来改好了”，而是“有命令、有结果、有证据”。

## 新页面任务怎么用

新页面或新模块可以按这个顺序：

```text
using-superpowers
  -> brainstorming
  -> using-git-worktrees
  -> writing-plans
  -> test-driven-development
  -> verification-before-completion
```

示例 prompt：

```text
This is a Zentao task for a new Vue 3 page. Please use using-superpowers, clarify the requirement with brainstorming, set up an isolated worktree, write an implementation plan, then implement with tests where practical and verify before completion.
```

## 老需求优化怎么用

老需求优化可以按这个顺序：

```text
using-superpowers
  -> brainstorming
  -> using-git-worktrees
  -> writing-plans
  -> systematic-debugging / test-driven-development
  -> verification-before-completion
```

示例 prompt：

```text
This Zentao task updates an existing requirement. Please use using-superpowers, clarify which existing behavior must stay unchanged, set up an isolated worktree, write a plan, and verify the final change against the acceptance points.
```

## Bug 任务怎么用

bug 任务可以按这个顺序：

```text
using-superpowers
  -> using-git-worktrees
  -> systematic-debugging
  -> test-driven-development
  -> verification-before-completion
```

示例 prompt：

```text
This Zentao task is a bug report. Please use using-git-worktrees for isolation, then systematic debugging to reproduce and diagnose it. If practical, add a failing test before the fix, then verify before completion.
```

## 最小团队约定

- 每个禅道任务开始时，先让 Codex 判断该用哪些 skill。
- 需求不清时，先 `brainstorming`，不要直接实现。
- 多个任务并行时，先 `using-git-worktrees`。
- 大改动前，先 `writing-plans`。
- bug 任务优先 `systematic-debugging`。
- 行为变化尽量用 `test-driven-development`。
- 合并或提测前，必须 `verification-before-completion`。
