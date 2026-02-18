/**
 * Genera apps/docs/llm.md empaquetando README.md + views/*.md para consumo por IA.
 * Se ejecuta automáticamente cuando cambian archivos en views/ o README.md (bunpack.watch.ts).
 */

const DIR = import.meta.dir
const README_PATH = `${DIR}/README.md`
const VIEWS_DIR = `${DIR}/views`
const LLM_PATH = `${DIR}/llm.md`

const INCLUDE_RE = /\[([^\]]+)\]\((views\/([^)]+\.md))\s*":include"\)/g

const AI_HEADER = `<!-- Documentación empaquetada para consumo por IA. Generado desde README.md + views/*.md -->\n\n`

async function buildLlm(): Promise<void> {
  let readme = await Bun.file(README_PATH).text()

  for (const match of readme.matchAll(INCLUDE_RE)) {
    const [, _title, _relPath, filename] = match
    const viewPath = `${VIEWS_DIR}/${filename}`
    try {
      const content = await Bun.file(viewPath).text()
      readme = readme.replace(match[0], content)
    } catch (e) {
      console.error(`build-llm: no se pudo leer ${viewPath}`, e)
    }
  }

  await Bun.write(LLM_PATH, AI_HEADER + readme)
  console.log('llm.md actualizado')
}

buildLlm().catch((e) => {
  console.error('build-llm error:', e)
  process.exit(1)
})
