import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 });
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
export async function buildContractRelease(destination) {
  if (!destination) throw new Error('Provide a new output directory outside the checkout.');
  const output = resolve(destination), rel = relative(root, output);
  if (!rel || (!rel.startsWith('..' + '/') && !isAbsolute(rel))) throw new Error('Output must be outside the checkout.');
  if (git('status', '--porcelain').length) throw new Error('Commit or remove working-tree changes before building.');
  const commit = git('rev-parse', 'HEAD').toString().trim();
  const catalog = JSON.parse(git('show', commit + ':releases/prompt-sdk-v1.json'));
  const files = git('ls-tree', '-r', '--name-only', '-z', commit).toString().split('\0').filter(Boolean).sort();
  const entries = files.map(path => {
    const bytes = git('show', commit + ':' + path);
    return { path, byte_size: bytes.length, sha256: sha(bytes), content_base64: bytes.toString('base64') };
  });
  // Includes all reviewed tracked sources so relative documentation links,
  // cross-contract schemas, fixtures, licenses and notices travel together.
  await mkdir(output); // Exclusive: never overwrite a prior build.
  const releases = [];
  for (const contract of catalog.contracts) {
    const tag = 'contract/' + contract.name + '/v' + catalog.version;
    const prefix = contract.name + '-v' + catalog.version;
    const schema = git('show', commit + ':' + contract.schema);
    const schemaId = JSON.parse(schema).$id;
    if (!schemaId.startsWith('urn:definitely-secure:contract:' + contract.name + ':' + catalog.version + ':')) throw new Error('Schema identifier does not match catalog.');
    const bundle = Buffer.from(JSON.stringify({ format: 'studio-contract-source-bundle-v1', repository: catalog.repository, contract: contract.name, version: catalog.version, commit, files: entries }, null, 2) + '\n');
    const assets = [];
    for (const [filename, bytes, media_type] of [[prefix + '.schema.json', schema, 'application/schema+json'], [prefix + '.bundle.json', bundle, 'application/json']]) {
      await writeFile(resolve(output, filename), bytes, { flag: 'wx' });
      assets.push({ filename, artifact_uri: 'https://github.com/' + catalog.repository + '/releases/download/' + encodeURIComponent(tag) + '/' + filename, media_type, byte_size: bytes.length, sha256: sha(bytes) });
    }
    const manifest = { repository: catalog.repository, contract: contract.name, version: catalog.version, tag, commit, constitution_commit: catalog.constitution_commit, schema_id: schemaId, assets };
    await writeFile(resolve(output, prefix + '.manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    releases.push(manifest);
  }
  return releases;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await buildContractRelease(process.argv[2]), null, 2));
}
