<div align="center">

<img src="./docs/logo-banner.png" alt="gacha-ui" width="330" />

**别再对 AI 许愿了——让它一次发 5 个版本,你来挑。**

[![Agent Skill](https://img.shields.io/badge/Agent%20Skill-SKILL.md-111111?style=for-the-badge)](./SKILL.md)
[![支持](https://img.shields.io/badge/%E6%94%AF%E6%8C%81-Claude%20Code%20·%20Codex%20·%20OpenClaw-FFC93C?style=for-the-badge)](#安装)
[![Release](https://img.shields.io/github/v/release/fade2373/gacha-ui?style=for-the-badge&color=35D07F)](https://github.com/fade2373/gacha-ui/releases)
[![License](https://img.shields.io/badge/License-MIT-64748b?style=for-the-badge)](./LICENSE)

<a href="https://fade2373.github.io/gacha-ui/">
  <img src="./docs/hero.png" alt="gacha-ui 在线主页 — 点击看 45s 宣传片" />
</a>
<br/>
<sub><b>▲ 点击打开在线主页,看 45s 宣传片</b></sub>

<br/><br/>

**[English](./README.md) · [中文](./README.zh-CN.md)**

</div>

## 目录

- [演示](#演示)
- [为什么要 gacha-ui](#为什么要-gacha-ui)
- [工作原理](#工作原理)
- [安装](#安装)
- [使用](#使用)
- [目录结构](#目录结构)
- [依赖](#依赖)
- [许可证](#许可证)

## 演示

<p align="center">
  <img src="./promo/preview.gif" alt="gacha-ui — 一次出 5 个版本" width="340" />
  <img src="./promo/preview-pick.gif" alt="gacha-ui — 6 个真实方向,指认锁定" width="340" />
</p>

完整宣传片(45s,中文,3:4 竖版;英文版后续放出):

https://github.com/fade2373/gacha-ui/releases/download/v1.0.0/gacha-ui-promo-cn.mp4

文件直达:[`promo/gacha-ui-promo-cn.mp4`](./promo/gacha-ui-promo-cn.mp4) · 在线主页:[fade2373.github.io/gacha-ui](https://fade2373.github.io/gacha-ui/)

## 为什么要 gacha-ui

让模型直接出一个 UI,得到的是它最*典型*的答案——训练数据的平均值,也就是「AI slop」。让它出一个精修草稿再迭代会好些,但平行原型的研究对天花板说得很直白:**生成**多个候选只拓宽了*你自己*的探索,真正能可测量地提升最终选择质量的,是把它们**并排展示**出来(Dow & Klemmer 2010;Dow 2011)。比较让人能归纳出*原则*(「密的那个读得快,空的那个显高级」),而不是孤立地对着一个产物反应;并排也给了人「批评的许可」。

所以 gacha-ui 让人当评委、模型当生成器,跑一个紧凑的循环。(这就是 [parallelization → evaluator-optimizer](https://www.anthropic.com/engineering/building-effective-agents) 模式,只不过评委席上坐的是人。)完整证据见 [`reference/why-parallel-prototyping.md`](./reference/why-parallel-prototyping.md)。

> 名字的由来:每一轮像「抽一发」——铺开几张候选让你挑,像抽卡。随机的是**形式**;**真实**(真实数据、品牌 token、你已认可的东西)是焊死的。

**两条不可破的底线:**

1. **发散形式,锁死真实。** 每轮只发散一个最未定的维度。已定的一切——加上真实数据、品牌 token、已认可元素——在所有 mockup 里逐字节保持一致。
2. **人来指认,你别替人猜。** 「好看」没有客观标准,自动评判会漏掉品牌/审美契合,所以 skill 永远把候选渲染出来 serve 给你,真正的选择永远由人做。跳过「展示」这一步=整个方法归零。

## 工作原理

```
Gate 0   要不要抽卡?(一行小改 → 直接做)。钉死目标 + 选模式。
  A      侦察:真实数据、品牌 token、目标视口——全部逐字锁死。
  B      发散:N 个一次性 HTML mockup,只动一个轴,强制彼此不同。
  C      展示&选:截图 + 并排 serve;你来挑 / 排序 / 「最好 + 最差」。
  D      抽取:把你的话转成锁定约束(I Like / I Wish / What If)。
  E      收敛:批准了?停滞了?到上限了?→ 在下一个轴上重跑 B–E,或收尾。
  F      落地:用真实技术栈 + 真实数据源把胜出方案做出来。
  G      精修:和认可的 mockup 做视觉 diff,只改有差异的地方。
```

一个端到端的走查例子:[`reference/walkthrough.md`](./reference/walkthrough.md)。

## 安装

把这个目录放进你的 agent 发现 skill 的位置:

| Agent | 位置 |
|---|---|
| Claude Code | `~/.claude/skills/gacha-ui` |
| Codex CLI | `~/.codex/skills/gacha-ui` |
| 其他 agent | 其 skills 目录——或直接把 `SKILL.md` 喂给 agent 当上下文;方法本身就是纯 markdown + 一个 Node 脚本 |

```bash
# Claude Code 示例
git clone https://github.com/fade2373/gacha-ui ~/.claude/skills/gacha-ui
```

截图工具需要 Playwright + Chromium(可选——没装的话 skill 仍会把画廊 serve 出来,你自己开浏览器手动截图):

```bash
npm i -D playwright && npx playwright install chromium
```

支持 skill 的 agent 会自动发现它,无需额外配置。

## 使用

直接用自然语言说你想要什么——当你想*比较* UI 方向时,skill 会自动触发:

- 「这块看着有点廉价 / 不对劲」
- 「让它好看点」
- 「重新设计这张卡片」
- 「给我几个页头的别的方向」
- 设计一个风格还没定的新界面

……或显式调用:`/gacha-ui <要改的区域>`。

它**不会**为一行 CSS 小改触发(直接做就行),也不会在你没要求比较时为「写个新页面」触发——那是「出一个高质量草稿」的活,不是抽卡。

## 目录结构

```
SKILL.md                              agent 读的 playbook
reference/walkthrough.md              一个完整单轮,从头到尾
reference/lock-ledger.md              侦察/保真规则 + 锁定账本 + 选择/收敛协议
reference/diversity-recipe.md         怎么选轴、定 N、强制真发散
reference/style-vocabulary.md         40+ 个具名设计语言,per-card 范本种子库
reference/why-parallel-prototyping.md 方法背后的证据
scripts/serve-and-shoot.js            给每个 mockup 截图 + 并排 grid serve 出来
```

### 脚本

```bash
node scripts/serve-and-shoot.js <dir> [port=auto] [width=1280]
```

给 `<dir>` 里每个 `*.html` 截全页图(2× DPI),生成一个暗色 **grid** 画廊让 mockup 并排,并在空闲端口起一个 detached 本地服务。缺 Playwright 时优雅降级。

## 依赖

- 一个能读 `SKILL.md` 的 AI coding agent(Claude Code、Codex、OpenClaw、Cursor……)
- Node.js(用于截图/serve 脚本)
- Playwright + Chromium(可选,用于自动截图)

## 许可证

[MIT](./LICENSE)

---

<div align="center">

**抽卡的是形式,锁死的是真实。**

</div>
