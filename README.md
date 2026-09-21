# Signal

Signal is a dating app MVP built around a simple idea: help people make better connections while also learning how they communicate.

## Current MVP

- Onboarding and profile creation
- Interests and MBTI/personality type
- Swipe-style discovery
- Matches and seeded conversations
- Per-conversation coaching consent toggle
- Match-specific conversation coaching
- Suggested replies
- Basic behavioral insights
- Cross-conversation topic intelligence concept
- LocalStorage demo persistence
- Hatchable API endpoints for health and a rule-based coaching MVP

## Project structure

```text
signal/
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── api/
│   ├── health.js
│   └── coach.js
├── hatchable.toml
├── README.md
└── .gitignore
```

## GitHub

After extracting the ZIP:

```bash
cd signal
git init
git add .
git commit -m "Initial Signal MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Local frontend preview

The frontend is static and can be served with:

```bash
python3 -m http.server 3000 --directory public
```

Then open `http://localhost:3000`.

The current demo primarily uses client-side seeded data and LocalStorage. The `/api` endpoints are included for the Hatchable deployment and are not yet a production backend.

## Important

This is the current MVP source, not a production-ready dating platform. It does not yet include real authentication, a persistent database, real user matching, production messaging, moderation/safety systems, or a production LLM coaching pipeline.
