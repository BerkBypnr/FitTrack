# FitTrack Agent Instructions

FitTrack üzerinde çalışmaya başlamadan önce sırasıyla şunları oku:

1. Kullanıcının güncel görevi.
2. `tokenkuralları.md`.
3. `FITTRACK_CURRENT_STATE.md`.
4. `docs/handoffs/` altındaki en güncel Delta Devir.

GitHub `main` güncel kaynak kodudur. Eski ZIP, roadmap, devir ve test çıktısını yalnız görev gerçekten gerektirirse aç. Bütün projeyi baştan tarama. İlgili dosya belli değilse Graft ile ilişki/caller/dependency bul; kritik değişiklikten önce gerçek kaynak dosyayı aç.

Mümkün olan en küçük doğru değişikliği yap. Görev dışındaki çalışan auth, sync, Supabase, mesajlaşma, program, aktif antrenman ve navigation davranışını yeniden yazma.

Değişiklikten sonra ilgili diff'i, hedefli testi ve gerekiyorsa build/APK/smoke sonucunu gerçek araçlarla doğrula. Çalıştırılmayan kontrolü geçti diye raporlama. Sürüm sonunda kısa değişiklik kaydı ve Delta Devir bırak.

`graft/`, `node_modules/`, build çıktıları, gizli `.env`, API anahtarları, service-role key, SMTP sırrı ve imzalama materyali commitlenmez.

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->
