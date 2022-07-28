import * as path from 'path';
const isGitHubPages = true;
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const base = mode === 'production' &&  isGitHubPages ? '/' + path.basename(process.cwd()) + '/' : './';

export default {
  root: './src',
  base,
  mode,
  publicDir: '../public',
  build: {
    outDir: '../dist',
    assetsDir: "./"
  },
  server: {
    port: 3030,
  }
}
