// Private, manually invoked research utility. Never imported by the application.
import fs from 'node:fs/promises';
import OpenAI from '../../artifacts/api-server/node_modules/openai/index.mjs';

const root = new URL('./', import.meta.url);
const archive = JSON.parse(await fs.readFile(new URL('../../artifacts/api-server/public/data/blog-posts-full.json', root), 'utf8'));
const posts = archive.posts.filter(p => [144462733,153060600].includes(Number(p.id)));
if (posts.length !== 2) throw new Error('Expected two complete source posts');
const refs = ['Bava_Batra.164b','Shabbat.156a','Shabbat.156b','Proverbs.10.2','Proverbs.11.4','Leviticus.14.37','Mishnah_Negaim.12.1','Tosefta_Nazir.1.2','Tosefta_Negaim.6.3'];
let packet = posts.map(p => `# ${p.title}\n${p.blogUrl}\n\n${p.contentText}`).join('\n\n');
for (const ref of refs) {
  const source = JSON.parse(await fs.readFile(`/tmp/llmdan-${ref}.json`, 'utf8'));
  packet += `\n\n# ${source.ref}\nhttps://www.sefaria.org/${ref}\n`;
  for (const v of source.versions) {
    packet += `\n## ${v.versionTitle} (${v.language}; license: ${v.license ?? 'not supplied'})\n`;
    packet += Array.isArray(v.text) ? v.text.map((t,i)=>`${i+1}. ${t}`).join('\n') : v.text;
  }
}
const client = new OpenAI({baseURL:process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,apiKey:process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,maxRetries:2,timeout:240000});
const mode = process.argv[2] ?? 'generate';
const model = 'anthropic/claude-opus-5.5';
const prompt = await fs.readFile(new URL(mode === 'generate' ? 'generation-prompt.md' : 'review-prompt.md',root),'utf8');
const draft = mode === 'review' ? (await Promise.all(['bava-batra-164b-draft.md','shabbat-156b-draft.md'].map(name=>fs.readFile(new URL(name,root),'utf8')))).join('\n\n') : '';
const maxTokens = mode === 'review' ? 16384 : 8192;
const response = await client.chat.completions.create({model,max_tokens:maxTokens,messages:[{role:'system',content:prompt},{role:'user',content:packet + '\n\n' + draft}]});
const content = response.choices[0]?.message.content;
if (!content || response.choices[0].finish_reason !== 'stop') throw new Error(`Incomplete ${mode} response: ${response.choices[0]?.finish_reason}`);
await fs.writeFile(new URL(mode === 'generate' ? 'generated-drafts.md' : 'critical-review.md',root),content);
// Store normal output and exposed provenance only, never hidden reasoning.
await fs.writeFile(new URL(`${mode}-provenance.json`,root),JSON.stringify({requestedModel:model,returnedModel:response.model,provider:response.provider,created:response.created,id:response.id,max_tokens:maxTokens,reasoningSetting:'Provider default; no effort override',temperature:'Provider default',finish_reason:response.choices[0].finish_reason,usage:response.usage},null,2));
console.log(`${mode}: complete; model=${response.model}; chars=${content.length}`);
