https://boristane.com/blog/how-i-use-claude-code/

使用 Claude Code 9 个月后总结出的 AI Coding 工作流，核心一句话："思考"与"执行"需要严格分离，在你审查并批准计划之前，绝不让 AI 写代码 ~~ 来自 
@boristane
 的分享
https://boristane.com/blog/how-i-use-claude-code/

工作流四个阶段
Research → Plan → Annotate (循环1-6次) → Implement → Feedback

阶段一：Research（深度阅读）
Boris 在每次有意义的任务开始前，都要求 AI 对相关代码库做彻底的深度阅读，并将发现写入持久化的 research. md 文件——而非仅在对话中口头总结。

他强调 prompt 中的措辞很重要："deeply"、"in great details"、"intricacies" 不是修辞，而是必要的信号。没有这些词，AI 倾向于浅尝辄止——读个函数签名就跳过。

为什么要写成文件？ research. md 是他的审查面。他可以验证 AI 是否真正理解了系统，在规划之前就纠正误解。他指出，AI 辅助编码中最昂贵的失败模式不是语法错误或逻辑 bug，而是：脱离上下文的正确实现——一个忽略了现有缓存层的函数、一个不遵循 ORM 约定的迁移、一个重复已有逻辑的 API 端点。Research 阶段预防的正是这类问题。

阶段二：Plan（结构化规划）
审阅完 research 后，Boris 要求 AI 生成详细的 plan. md 实现计划，包含：方法论说明、实际代码片段、将修改的文件路径、权衡与考量。

他不使用 Claude Code 内置的 Plan Mode，理由直接：内置的 plan mode 不够好。自己维护 .md 文件可以在编辑器中自由编辑、添加注释，且作为真实的项目产物持久存在。

一个实用技巧：对于边界清晰的功能，如果他在开源项目中见过好的实现，会将参考代码一起提供给 AI。"这是他们做可排序 ID 的方式，写个计划说明我们如何采用类似方案。"——有具体参考实现时，AI 的输出质量会显著提升。

阶段三：Annotate（注释循环）——最核心的环节
流程是：AI 写完 plan → Boris 在编辑器中直接在文档内添加行内注释 → 让 AI 根据注释更新文档 → 重复1-6轮。
注释的形态极其多样：
· 两个字："not optional"（纠正一个被标为可选的参数）
· 一整段话解释业务约束
· 粘贴代码片段展示期望的数据结构
· 整段删除："remove this section entirely, we don't need caching here"
· 结构性重定向："visibility 字段应在 list 上，不是 item 上。重构 schema 部分。"

关键防护语：每次都附加 "don't implement yet"。 没有这句话，AI 一旦觉得计划"足够好"就会跳去写代码。

为什么这比在聊天中指导更有效？ Markdown 文件充当了人与 AI 之间的共享可变状态。Boris 可以按自己的节奏思考，精确指向文档中的具体位置写修正，不需要在聊天记录中翻来翻去重建决策。三轮注释循环就能把一个通用实现计划改造成完美适配现有系统的方案。

Boris 的洞察是：AI 擅长理解代码、提出方案、写实现。但它不知道你的产品优先级、用户痛点、以及你愿意接受的工程权衡。注释循环就是注入这些判断力的通道。

在实施前，他还会要求生成一个粒度细致的 todo list 作为进度追踪器。

阶段四：Implement（执行）
当计划就绪，Boris 发出标准化的执行指令（几乎每次复用同一段 prompt）：
> implement it all. when you're done with a task or phase, mark it as completed in the plan document. do not stop until all tasks and phases are completed. do not add unnecessary comments or jsdocs, do not use any or unknown types. continuously run typecheck to make sure you're not introducing new issues.

每一句都有明确意图：
· "implement it all"：执行计划中的所有内容，不要挑挑拣拣
· "mark it as completed"：plan 文档是进度的唯一真相来源
· "do not stop"：不要中途暂停等确认
· "不要 any/unknown"：维持严格类型
· "持续 typecheck"：尽早发现问题

他的设计哲学是：到说 "implement it all" 的时候，所有决策都已做完并验证。实现应该是机械的、无聊的。创造性工作发生在注释循环中。

实施中的反馈
角色从架构师切换为监督者，prompt 变得极短：
· "You didn't implement the deduplicateByTitle function."
· "wider"
· "still cropped"
· "there's a 2px gap"

前端工作最为迭代密集，他会快速发送简短修正，有时附截图。
他频繁引用已有代码作为参照："这个表格应该和 users 表格一模一样——同样的 header、分页、行密度。"指向参照比从头描述设计高效得多。

当方向走偏时，他不修补，而是 revert + 缩小范围： "I reverted everything. Now all I want is to make the list view more minimal — nothing else." 缩小范围后重做，几乎总是比增量修复一个错误方向的结果更好。

贯穿全程的原则：保持驾驶员位置
Boris 强调，即使将执行委托给 AI，他从不给予 AI 对构建内容的完全自主权。绝大部分主动引导发生在 plan. md 中：
· 逐项取舍：AI 识别出多个问题时，他逐条决定——第一个用 Promise.all，第三个提取函数，第四第五个忽略。
· 主动裁剪范围：从计划中移除 nice-to-have，防止范围蔓延。
· 保护现有接口：明确哪些函数签名不可改变，"调用方适配，不是库适配。"
· 覆盖技术选型：当他有 AI 不知道的特定偏好时，直接覆盖。

单一长会话
他在一个连续会话中完成 research → plan → annotate → implement，而不是拆分到多个会话。他没有观察到 50% 上下文窗口后的性能退化——到执行阶段时，AI 已在整个会话中积累了深度理解。当上下文满了，auto-compaction 保留足够上下文继续工作，而 plan 文档作为持久产物以完整保真度存活。