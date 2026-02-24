## Cloudflare Deployment (Concise Index)

Choose runtime:
- `Pages` for frontend/static/SSR delivery
- `Workers` for API/webhook/edge logic
- `Containers` for Python/ML or heavy dependencies

Recommended combinations:
- Frontend only: `Pages`
- Frontend + API: `Pages + Workers`
- Full edge stack: `Pages + Workers + D1/R2`
- AI app: `Workers + AI Gateway + Workers AI + Vectorize`

Deployment triggers: production=`v*` tag on `main`; staging=`develop`; preview=`PR`.

Deep docs:
- `docs/reference-configs/release-deploy.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/ai-workflows.yaml.md`
