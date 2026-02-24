## Cloudflare Deployment Notes

Use Cloudflare-native patterns when the selected plan supports edge deployment:
- Workers/Pages first
- Keep runtime constraints explicit (edge vs node)
- Prefer platform primitives over custom infra

If the plan is non-Cloudflare-native, this section is omitted.

---
