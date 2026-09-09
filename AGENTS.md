# Repository Instructions

## Continuous GitHub Deployment & Sync
- **Auto-Push Policy**: Whenever changes are made by the user or agent to the codebase, always check `git status`, stage modified/new files (respecting `.gitignore`), create a clean and descriptive commit, and push directly to `origin main` on GitHub.
- **Commit Conventions**: Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`).
- **Verification Before Push**: Ensure `npm run build` passes in `frontend/` and backend syntax checks succeed before pushing to prevent broken builds in CI/CD and Vercel.
