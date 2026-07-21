# Board (whiteboard)

FE board editor: Vue Flow canvas over the normalized board-graph API.

Related:

- [Services & BE sync](./service/service.md) — load board + nodes/connections/props; `snap` is presentation-only
- [Board document — FE next steps](./board-document.md) — **publish / versions** (next feature)
- [Pages](./layout/pages.md) — `BoardPage`, `BoardDetailPage`
- [BE board document](../../be/doc/db/board-document.md) — tree materialization, `root`, `LogicExpr`

## Current scope

| Done | Not yet |
| ---- | ------- |
| List / create / open boards | Publish async document |
| Toolbox + place nodes | `root` marker UX polish |
| Connections + socket rules | Document version history UI |
| Props form + snap layout | CE runtime (separate app) |

Implementation checklist for publish lives in [board-document.md](./board-document.md).
