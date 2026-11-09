---
title: logisim-circuit-design
description: |-
  吉大大二logisim计算机硬件设计实验skill，可安装到workbuddy，deepseekharness以及其他angent工具
  GitHub仓库地址：https://github.com/CosmoXing/logisim-circuit-design.git
pubDate: 2026-11-09
category: 技术
tags: []
pinned: true
draft: false
---
# Logisim Circuit Design Skill

> 让 AI 用代码画出能跑的 Logisim 数字电路 —— 生成的 `.circ` 打开即用，自带绘图工具条，并通过真值表与测试向量验证。

!\[License: MIT]\([https://img.shields.io/badge/License-MIT-green.svg](https://img.shields.io/badge/License-MIT-green.svg))
!\[Logisim]\([https://img.shields.io/badge/Logisim--evolution-5.0.0-blue.svg](https://img.shields.io/badge/Logisim--evolution-5.0.0-blue.svg))

---

## 这是什么

一个面向 AI 编程助手（WorkBuddy / Claude Code 等支持 `SKILL.md` 的 agent）的技能包，把「用 Logisim 画电路」这件事变成可编程、可验证的流程：

* **不再手点画布**：电路由 Python 脚本生成 `.circ` XML，坐标全部按实测常量计算。
* **不再靠肉眼看通断**：`verify.py` 直接调 Logisim 命令行跑真值表与测试向量，输出「通过 N，失败 M」。
* **不再踩重复的坑**：20 条实战踩坑（端口偏移、位宽不兼容、OOM、autosave、工具栏缺失…）都写成了「症状 → 根因 → 修法」。

适用场景：数字逻辑作业、课程设计、需要"只用门电路、不许用现成芯片、不许用隧道"的题目，以及要交付模块图 / 展开图 / 用例电路 / 波形截图的场合。

## 为什么需要它

用 LLM 直接生成 `.circ` 文件有三个硬门槛，靠猜是过不去的：

| 门槛          | 现实                                                   |
| ----------- | ---------------------------------------------------- |
| 端口坐标是像素级精确的 | 子电路端口 y 间距是 **10** 不是 20，差 10px 就断线，且**没有任何报错**      |
| 失败是静默的      | 组件名写错会被**丢弃**，整条网络变 `E`；导线穿过端口会让 Logisim **死循环 OOM** |
| 验收靠仿真       | 必须能跑真值表 / 测试向量，否则"看起来对"等于没做                          |

这个技能把上述三点都固化成了常量、生成器和验证脚本。

## 特性

* 🧱 **分层生成**：`顶层 → 功能模块 → 门级`，子电路实例化、总线拆分/合并、数码管显示全部封装好。
* 🔌 **自动布线**：`router.py` 提供通道布线器，自动避开共线重叠与端点压线（这两者是 Logisim 里最常见的隐性短路）。
* ✅ **命令行验证**：`verify.py` 支持 `table` / `stats` / `vector` 三种模式，自动寻找最高版本 jar、自动解码 GBK 输出。
* 🛡️ **失败即拦截**：布线有网络没布通时 `G.check()` 直接抛异常，阻止写出会让 Logisim 崩掉的文件。
* 📚 **坑表即文档**：`references/pitfalls.md` 收录 20 条，每条都有症状、根因、定位手法。
* 📦 **零依赖**：纯标准库 Python，不需要装任何包。

## 安装

技能就是"一个有 `SKILL.md` 的目录"。把它放到 agent 的技能目录即可：

```bash
git clone https://github.com/CosmoXing/logisim-circuit-design.git
cp -r logisim-circuit-design ~/.workbuddy/skills/logisim-circuit-design   # WorkBuddy
# 或
cp -r logisim-circuit-design ~/.claude/skills/logisim-circuit-design      # Claude Code
```

也可以直接下载打包好的压缩包 [`dist/logisim-circuit-design.zip`](dist/logisim-circuit-design.zip)，解压到上述目录即可（压缩包内已带 `logisim-circuit-design/` 顶层目录，不要重复嵌套）。目录名建议保持 `logisim-circuit-design`。

## 快速开始

```python
import sys; sys.path.insert(0, "scripts")
import logisim_gen as G

b  = G.pin(120, 60, "a")
b += G.pin(120, 140, "b")
b += G.pin(320, 60, "s", "output")
b += G.gate(240, 100, "XOR")                 # loc 是输出口
b += G.path((120, 60), (220, 80))
b += G.path((120, 140), (220, 120))
b += G.path((240, 100), (320, 60))

open("demo.circ", "w", encoding="utf-8", newline="\n").write(G.project([("main", b)]))
```

```bash
python scripts/verify.py table  demo.circ
python scripts/verify.py stats  demo.circ
python scripts/verify.py vector main vec.txt demo.circ
```

`verify.py vector` 会打印每条失败明细，并在末尾汇总：

```
通过：7，失败：0
[结果] 通过 7，失败 0
```

## 目录结构

```
logisim-circuit-design/
├── SKILL.md                  # 主文件：何时用 / 工作流 / 铁律 / 坐标速查 / 症状表
├── references/
│   ├── circ-format.md        # .circ XML 骨架、库索引、组件写法、toolbar、3.9↔5.0 差异
│   ├── geometry.md           # 端口与尺寸常量、导线连通语义、布局与压缩、截图规范
│   ├── verification.md       # CLI 用法、.vec 格式、用例设计、双工程策略
│   └── pitfalls.md           # 20 条实战坑：症状 / 根因 / 定位 / 解决
├── scripts/
│   ├── logisim_gen.py        # pin/gate/sub/splitter/display/project/translate/check
│   ├── router.py             # 通道布线器
│   └── verify.py             # 命令行验证包装器
├── assets/
│   └── full-adder.circ       # 已知可用（真值表 8/8）的最小参考工程
└── examples/
    └── bcd4-adder/           # 4 位 BCD 加法器：32 个全加器、5 位数码管、无隧道
```

## 五条铁律

| # | 铁律                           | 违反的后果                                            |
| - | ---------------------------- | ------------------------------------------------ |
| 1 | 导线终点必须**精确落在端口像素**上          | 差 10px 就断线，无任何报错                                 |
| 2 | 子电路实例只做 **≤3 入 / ≤2 出**      | 9 入 5 出的模块端口位置全错，输出恒 `U`                         |
| 3 | 导线**不要穿过**子电路端口              | `WireRepair.doOverlaps` 死循环 → `OutOfMemoryError` |
| 4 | 位宽严格匹配（数码管数据口恒 4 位）          | 橙色「位宽不兼容」，整条网络变 `E`                              |
| 5 | 生成的 `.circ` 必须自带 `<toolbar>` | 打开后没有绘图工具条，以为软件坏了                                |

## 坐标速查

| 对象                | 坐标（`loc` 为锚点）                                             |
| ----------------- | --------------------------------------------------------- |
| 2 输入门             | `loc` 是**输出**口；输入口 `(loc.x-20, loc.y±20)`；入线画到 `loc.x-10` |
| NOT 门             | 输入口 `(loc.x-20, loc.y)`                                   |
| 子电路实例             | 输入 `(loc.x-30, loc.y+10i)`；输出 `(loc.x, loc.y+10j)`；框宽恒 30 |
| 分线器·拆位            | 合并侧 `loc`；分线侧 `(loc.x+20, loc.y-20+10i)`，`bit0` 在最上       |
| 分线器·合并            | 4 位从右侧送入，`loc` 输出；位序 `o = i3 i2 i1 i0`                    |
| Hex Digit Display | `loc` = 数据口（固定 4 位）；小数点口 `(loc.x+20, loc.y)`              |
| 导线连通              | 十字交叉**不**连；端点压线**会**连；共线重叠**会**连                          |

## 实战案例：4 位 BCD 加法器

`examples/bcd4-adder/` 是完整可复现的例子，满足「只用门电路 + 禁止隧道 + 三级模块化」的作业要求：

* 结构：`main → BCD1 ×4 → FA ×8`，共 **32 个全加器**、5 个数码管显示 `cout s3 s2 s1 s0`。
* 验证：全加器真值表 **8/8**；单个 BCD1 合法输入 **200/200**；整机 7 条边界向量 **7 通过 0 失败**。
* 用例覆盖：`1234+5678`、`9999+1`、`0+0+cin`、`9999+9999`、`1239+1239`、`1999+2999+cin`、`0+0`。

```bash
cd examples/bcd4-adder
python ../../scripts/verify.py vector main bcd4.vec demo_test.circ
```

## 踩过的坑（节选）

| 症状                      | 根因                                     |
| ----------------------- | -------------------------------------- |
| 输出全 `U`，探针点不动           | 模块端口太多（9 入 5 出会算错），拆成 ≤3 入 / ≤2 出      |
| 橙色「位宽不兼容」               | 1 位信号直接接 4 位数码管，需用分线器补零                |
| 打开报「加载电路文件出错」           | 同目录残留 `.xxx.circ.autosave`             |
| 没有绘图工具条                 | toolbar 配置是**逐文件保存**的，文件里缺 `<toolbar>` |
| 载入直接 `OutOfMemoryError` | 导线穿过子电路端口，或布线失败留下断头线                   |
| 电路贴画布左上角、引脚被面板挡         | 元件从 `(0,0)` 起画，需整体平移 `(+120,+60)`      |
| 打开只有 0.15 倍缩放           | 子电路内部尺寸过大，压到 2000×1600 内               |

完整 20 条见 [`references/pitfalls.md`](references/pitfalls.md)。

## 环境要求

* **Logisim-evolution 5.0.0**（实测版本）。3.9 生成的 `.circ` 可读，但引脚写法不同（`output="true"` vs `type="input"`）。
* **Python 3.8+**，无第三方依赖。
* 命令行验证需要 `java` 在 PATH 中；jpackage 自带的 runtime 里通常没有 `java.exe`，用系统 Java 即可。

> Windows 下 `-w` 模式内部会创建窗口，**不要**加 `-Djava.awt.headless=true`，否则抛 `HeadlessException`。

## 许可

[MIT](LICENSE) © 2026 CosmoXing

电路设计过程中的所有几何常量均来自对 Logisim-evolution 的实测（含读源码交叉验证），已在 `references/` 中标注适用版本。若你使用的是其它版本且行为不同，请以实测为准并欢迎提交 PR。
