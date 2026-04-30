import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * GitHub Pages project sites live at https://<user>.github.io/<repo>/ — assets must use that prefix.
 * User/org sites use a repo named <user>.github.io and are served from / (base '/').
 *
 * Local build for a project page: `VITE_BASE_PATH=/your-repo-name/ npm run build`
 * In GitHub Actions, `GITHUB_REPOSITORY` is set automatically.
 */
function productionBase(): string {
    if (process.env.VITE_BASE_PATH) {
        const b = process.env.VITE_BASE_PATH.trim()
        return b.endsWith('/') ? b : `${b}/`
    }
    const full = process.env.GITHUB_REPOSITORY
    if (!full) return '/'
    const repo = full.split('/')[1]
    if (!repo) return '/'
    if (repo.endsWith('.github.io')) return '/'
    return `/${repo}/`
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react(), tailwindcss()],
    base: command === 'serve' ? '/' : productionBase(),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
}))
