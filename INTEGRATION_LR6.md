# Як вставити ЛР6 у репозиторій

1. Скопіюй у корінь репо:
   - `Dockerfile`
   - `docker-compose.yml`
   - `deploy/nginx/default.conf`
   - `Architectural_Design_Document_ADD.md`
   - `Architecture_Presentation.md` → експортуй у `Architecture_Presentation.pdf`
   - `docs/diagrams/deployment.puml`, `deployment.mmd`
   - `docs/adrs/ADR-0642-deployment-topology.md`
   - `docs/lr6/`

2. Без Docker (зараз):
   ```bash
   npx ts-node src/WebAPI/server.ts
   ```
   Збережи вивід → `docs/lr6/e2e_demo.log`

3. З Docker Desktop (коли встановиш):
   ```bash
   docker compose up --build
   docker compose ps
   ```
   Скрін `ps` + лог.

4. Рендер діаграми:
   - PlantUML online / VS Code PlantUML → `docs/diagrams/deployment.png`
   - або Mermaid live editor з `deployment.mmd`

5. Git:
   ```bash
   git add .
   git commit -m "feat(lr6): deployment diagram, ADD arc42, ADR-0642"
   git tag lr6
   git push origin main --tags
   ```

## Скріни (обов’язково / бажано)

| Скрін | Файл |
|-------|------|
| Вивід демо (publish + consumers) | docs/lr6/e2e_demo.log + png |
| Діаграма розгортання PNG | docs/diagrams/deployment.png |
| docker compose ps (якщо є Docker) | docs/lr6/compose-ps.png |
| GitHub Tags → lr6 | скрін для захисту |
| ADD у репо (перші рядки) | опційно |
