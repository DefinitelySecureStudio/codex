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
  await assert.rejects(buildContractRelease('/tmp/unused', '../untrusted'), /Unknown release catalog/);
});

test('Builder catalog publishes only the additive family with unchanged schema bytes', async t => {
  const root = await mkdtemp(join(tmpdir(), 'builder-release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const first = join(root, 'first'), second = join(root, 'second');
  const [manifest] = await buildContractRelease(first, 'context-builder-v1');
  await buildContractRelease(second, 'context-builder-v1');
  assert.equal(manifest.tag, 'contract/context-builder/v1.0.0');
  assert.equal(manifest.assets[0].sha256, 'sha256:4adebedcef5a26e009e1d53ec9c480d372a31b73211fec1c53d6509ebc7929a3');
  assert.equal((await readdir(first)).length, 3);
  for (const file of await readdir(first)) assert.deepEqual(await readFile(join(first, file)), await readFile(join(second, file)));
  for (const asset of manifest.assets) {
    const bytes = await readFile(join(first, asset.filename));
    assert.equal(bytes.length, asset.byte_size); assert.equal(hash(bytes), asset.sha256);
  }
  const bundle = JSON.parse(await readFile(join(first, manifest.assets[1].filename)));
  assert.equal(bundle.commit, manifest.commit);
  for (const path of ['LICENSE', 'NOTICE', 'specs/context-builder/context-builder-v1.md', 'releases/context-builder-v1.md']) {
    assert.ok(bundle.files.some(file => file.path === path));
  }
});
