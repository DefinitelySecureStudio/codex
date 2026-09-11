import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildContractRelease } from '../scripts/build-contract-release.mjs';
const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
test('contract release bundles are reproducible and every file identity verifies', async t => {
  const root = await mkdtemp(join(tmpdir(), 'codex-release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const first = join(root, 'first'), second = join(root, 'second');
  const manifests = await buildContractRelease(first);
  await buildContractRelease(second);
  assert.equal(manifests.length, 5);
  assert.equal(new Set(manifests.map(m => m.tag)).size, 5);
  for (const file of await readdir(first)) assert.deepEqual(await readFile(join(first, file)), await readFile(join(second, file)));
  for (const manifest of manifests) {
    assert.match(manifest.commit, /^[a-f0-9]{40}$/);
    for (const asset of manifest.assets) {
      const bytes = await readFile(join(first, asset.filename));
      assert.equal(bytes.length, asset.byte_size);
      assert.equal(hash(bytes), asset.sha256);
      if (!asset.filename.endsWith('.bundle.json')) continue;
      const bundle = JSON.parse(bytes);
      assert.equal(bundle.commit, manifest.commit);
      assert.ok(bundle.files.some(file => file.path === 'LICENSE'));
      assert.ok(bundle.files.some(file => file.path === 'NOTICE'));
      assert.equal(new Set(bundle.files.map(f => f.path)).size, bundle.files.length);
      for (const file of bundle.files) {
        assert.ok(!file.path.startsWith('/') && !file.path.split('/').includes('..'));
        const content = Buffer.from(file.content_base64, 'base64');
        assert.equal(content.length, file.byte_size);
        assert.equal(hash(content), file.sha256);
      }
    }
  }
  await assert.rejects(buildContractRelease(first), /EEXIST/);
});
test('release builder requires an explicit external destination', async () => {
  await assert.rejects(buildContractRelease(), /Provide a new output/);
  await assert.rejects(buildContractRelease(new URL('../', import.meta.url).pathname), /outside/);
});
