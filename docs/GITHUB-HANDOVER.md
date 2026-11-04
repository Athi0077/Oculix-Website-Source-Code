# Upload and collaboration

1. Extract `Oculix-Frontend-Backend-GitHub.zip`.
2. On GitHub, choose **New repository**, name it `oculix-website`, and select **Private**. Do not add an empty README if uploading through Git below.
3. Open the extracted `Oculix-GitHub` folder in VS Code. Its root must contain `frontend`, `backend`, `package.json` and this README together.
4. Use a GitHub account you control. From this folder, run:

```sh
git init
git add .
git commit -m "Import Oculix frontend and backend source"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/oculix-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` with the owner account. Sign in through GitHub's normal browser/credential manager; never paste a token into source or a remote URL.

For browser upload instead: choose **Add file → Upload files**, then drag the extracted files/folders (not the ZIP). Git/VS Code is recommended because browser upload has size/count limits.

5. Repository **Settings → Collaborators → Add people**: enter Azhaghiri's actual GitHub username and grant write access. His email address is not necessarily his GitHub username.
6. Ask him to clone the repository, run `npm ci`, create a feature branch and open a pull request. Keep `main` protected with review and CI requirements where available for your GitHub plan.

```sh
git clone https://github.com/YOUR-USERNAME/oculix-website.git
cd oculix-website
npm ci
git switch -c azhaghiri/website-review
npm run dev
# After editing and checking:
git add .
git commit -m "Describe the change"
git push -u origin azhaghiri/website-review
```

## Files to edit

Homepage: `frontend/src/pages/page.tsx`.
Header/footer: `frontend/src/components/shared.tsx`.
Main styles: `frontend/src/assets/styles/globals.css`.
Admin dashboard: `frontend/src/components/dashboard.tsx`.
Sign-in UI: `frontend/src/components/signin/sign-in.tsx`.
Payment verification: `backend/src/controllers/live-ai-lab-payment.ts` and `odyssey-payment.ts`.
API map: `backend/src/routes/registry.json`.

Do not upload `.dev.vars`, `.env`, service account JSON, production records, `node_modules`, `.wrangler` or build output. The included `.gitignore` excludes these. GitHub Actions runs source checks and a build; it does not deploy or use payment secrets.
