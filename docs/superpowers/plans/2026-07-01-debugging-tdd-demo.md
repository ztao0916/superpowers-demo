# Debugging TDD Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `systematic-debugging` 和 `test-driven-development` 准备可现场演示的 Vue 3 购物车数量控件 demo。

**Architecture:** 复用现有 `CartQuantity` 小组件作为唯一代码演示对象。先修复一个现有边界 bug，用于 debugging 演示；再新增一个 `quantity < 0` 负数量归零边界行为，用于 TDD 演示；最后更新中文演示文档和 prompt。

**Tech Stack:** Vue 3、Vitest、@vue/test-utils、Vite。

---

## File Structure

- Modify: `demo-vue3/src/components/CartQuantity.vue`
  - 修正 `canIncrease` 计算逻辑。
  - 新增局部 `displayQuantity` 计算值，将负数量按 `0` 处理。
  - 不重构组件结构，不新增 props，不调整样式。
- Modify: `demo-vue3/src/components/CartQuantity.test.js`
  - 保留现有三个测试。
  - 新增 `quantity < 0` 时按 `0` 数量处理的边界测试。
- Modify: `README.md`
  - 更新 demo 准备说明和两个现场 prompt。
- Modify: `superpowers-core-workflow.md`
  - 补充这两个 skill 的演示入口和讲解顺序。

## Task 1: systematic-debugging Demo Bug Fix

**Files:**
- Modify: `demo-vue3/src/components/CartQuantity.vue`
- Verify: `demo-vue3/src/components/CartQuantity.test.js`

- [ ] **Step 1: Run the existing failing test to reproduce the bug**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

Expected:

```text
FAIL src/components/CartQuantity.test.js > CartQuantity > allows increasing from zero when stock is available
AssertionError: expected '' to be undefined
```

This confirms the increase button is disabled when `quantity = 0` and `stock = 3`.

- [ ] **Step 2: Identify the root cause in `CartQuantity.vue`**

Read this line:

```js
const canIncrease = computed(() => props.quantity && props.quantity < props.stock)
```

Root cause:

```text
When quantity is 0, JavaScript short-circuits the expression and returns 0.
Vue treats !canIncrease as true, so the increase button becomes disabled.
```

- [ ] **Step 3: Apply the minimal fix**

Change:

```js
const canIncrease = computed(() => props.quantity && props.quantity < props.stock)
```

To:

```js
const canIncrease = computed(() => props.quantity < props.stock)
```

- [ ] **Step 4: Verify the debugging fix**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

Expected:

```text
Test Files  1 passed (1)
Tests  3 passed (3)
```

- [ ] **Step 5: Review the diff**

Run:

```bash
git diff -- demo-vue3/src/components/CartQuantity.vue demo-vue3/src/components/CartQuantity.test.js
```

Expected:

```text
Only CartQuantity.vue changes.
The change is limited to canIncrease.
```

## Task 2: test-driven-development Demo Boundary Test

**Files:**
- Modify: `demo-vue3/src/components/CartQuantity.vue`
- Modify: `demo-vue3/src/components/CartQuantity.test.js`

- [ ] **Step 1: Add the TDD boundary test first**

Add this test after `allows increasing from zero when stock is available`:

```js
  it('treats negative quantity as zero', async () => {
    const wrapper = mount(CartQuantity, {
      props: {
        quantity: -1,
        stock: 3
      }
    })

    expect(wrapper.get('[aria-label="Current quantity"]').text()).toBe('0')
    expect(wrapper.get('button[aria-label="Decrease quantity"]').attributes('disabled')).toBe('')

    const increase = wrapper.get('button[aria-label="Increase quantity"]')

    expect(increase.attributes('disabled')).toBeUndefined()

    await increase.trigger('click')

    expect(wrapper.emitted('update:quantity')).toEqual([[1]])
  })
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

Expected:

```text
FAIL src/components/CartQuantity.test.js > CartQuantity > treats negative quantity as zero
AssertionError: expected '-1' to be '0'
```

This confirms the new test catches missing negative-quantity handling.

- [ ] **Step 3: Add the minimal implementation**

Change:

```js
const canDecrease = computed(() => props.quantity > 0)
const canIncrease = computed(() => props.quantity < props.stock)
```

To:

```js
const displayQuantity = computed(() => Math.max(0, props.quantity))
const canDecrease = computed(() => displayQuantity.value > 0)
const canIncrease = computed(() => displayQuantity.value < props.stock)
```

Also change `increase()` to emit from `displayQuantity.value`:

```js
function increase() {
  if (!canIncrease.value) return
  emit('update:quantity', displayQuantity.value + 1)
}
```

And change the template output to render `displayQuantity`:

```vue
<output class="quantity-value" aria-label="Current quantity">{{ displayQuantity }}</output>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

Expected:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
```

- [ ] **Step 5: Confirm the implementation remains minimal**

Read `demo-vue3/src/components/CartQuantity.vue`.

Expected implementation:

```js
const displayQuantity = computed(() => Math.max(0, props.quantity))
const canDecrease = computed(() => displayQuantity.value > 0)
const canIncrease = computed(() => displayQuantity.value < props.stock)
```

Do not add props, watchers, style changes, or additional validation branches.

- [ ] **Step 6: Review the diff**

Run:

```bash
git diff -- demo-vue3/src/components/CartQuantity.vue demo-vue3/src/components/CartQuantity.test.js
```

Expected:

```text
CartQuantity.vue contains displayQuantity and the canIncrease fix.
CartQuantity.test.js contains one new negative-quantity test.
```

## Task 3: Update Chinese Demo Documentation

**Files:**
- Modify: `README.md`
- Modify: `superpowers-core-workflow.md`

- [ ] **Step 1: Update `README.md` demo preparation section**

Replace the current demo preparation and prompt sections with this content:

````md
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

### test-driven-development

```text
这是一个行为变更任务。请使用 test-driven-development，先写失败测试，再做最小实现并验证。

需求：购物车数量控件在 quantity < 0 时，必须按 0 数量处理，展示为 0，减少按钮禁用，仍可在有库存时从 0 增加到 1。
```
````

- [ ] **Step 2: Update `superpowers-core-workflow.md` skill sections**

In the `systematic-debugging` section, add:

```md
**本项目 demo：**
`demo-vue3/src/components/CartQuantity.vue` 中保留了一个边界 bug。运行 `CartQuantity.test.js` 可以复现：`quantity = 0` 且 `stock > 0` 时，增加按钮不应该禁用，但当前测试失败。演示时重点看 Codex 是否先复现、再读失败信息和代码、最后只修改 `canIncrease` 判断。
```

In the `test-driven-development` section, add:

```md
**本项目 demo：**
在 `CartQuantity.test.js` 中先新增 `quantity < 0` 的边界测试，确认测试失败后，再用最小实现把负数量按 `0` 处理。演示重点不是多写代码，而是让 Codex 先用测试说清楚“什么叫改对了”。
```

- [ ] **Step 3: Verify documentation diff**

Run:

```bash
git diff -- README.md superpowers-core-workflow.md
```

Expected:

```text
Only Chinese demo instructions and prompts changed.
No unrelated sections are rewritten.
```

## Task 4: Final Verification and Commit

**Files:**
- Verify: all files changed by Tasks 1-3

- [ ] **Step 1: Run the focused CartQuantity test**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3 src/components/CartQuantity.test.js
```

Expected:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
```

- [ ] **Step 2: Run full test suite**

Run:

```bash
cd demo-vue3
npx vitest run --configLoader runner --root C:\Users\epean\Desktop\qiankun\superpowers-demo\demo-vue3
```

Expected:

```text
Test Files  3 passed (3)
Tests  14 passed (14)
```

- [ ] **Step 3: Run production build**

Run:

```bash
cd demo-vue3
npx vite build --configLoader runner
```

Expected:

```text
✓ built
```

- [ ] **Step 4: Review final diff**

Run:

```bash
git diff --stat
git diff -- demo-vue3/src/components/CartQuantity.vue demo-vue3/src/components/CartQuantity.test.js README.md superpowers-core-workflow.md
```

Expected:

```text
Only the planned files changed.
No warehouse dashboard files changed.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add demo-vue3/src/components/CartQuantity.vue demo-vue3/src/components/CartQuantity.test.js README.md superpowers-core-workflow.md
git commit -m "feat: add debugging and tdd demos"
```

Expected:

```text
Commit succeeds with only planned files staged.
```
