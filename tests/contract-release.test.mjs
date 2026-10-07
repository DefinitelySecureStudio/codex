import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildContractRelease, resolveExternalOutput } from '../scripts/build-contract-release.mjs';
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
  await assert.rejects(buildContractRelease(new URL('../', import.meta.url).pathname), /new|outside/);
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

test('Comic Manifest has a separate deterministic one-contract catalog', async t => {
  const root = await mkdtemp(join(tmpdir(), 'comic-manifest-release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const first = join(root, 'first'), second = join(root, 'second');
  const [manifest] = await buildContractRelease(first, 'comic-manifest-v1');
  await buildContractRelease(second, 'comic-manifest-v1');

  assert.equal(manifest.contract, 'comic-manifest');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.tag, 'contract/comic-manifest/v1.0.0');
  assert.equal(manifest.schema_id, 'urn:definitely-secure:contract:comic-manifest:1.0.0:comic-manifest');
  assert.equal(manifest.constitution_commit, 'a9cc8a503aa30e17820edc62ac95f7cbe10e0564');
  assert.equal(manifest.assets.length, 2);
  assert.deepEqual(manifest.assets.map(asset => asset.filename), [
    'comic-manifest-v1.0.0.schema.json', 'comic-manifest-v1.0.0.bundle.json'
  ]);
  assert.equal((await readdir(first)).length, 3);
  for (const file of await readdir(first)) assert.deepEqual(await readFile(join(first, file)), await readFile(join(second, file)));

  const schema = JSON.parse(await readFile(join(first, 'comic-manifest-v1.0.0.schema.json')));
  assert.equal(schema.$id, manifest.schema_id);
  for (const asset of manifest.assets) {
    const bytes = await readFile(join(first, asset.filename));
    assert.equal(bytes.length, asset.byte_size);
    assert.equal(hash(bytes), asset.sha256);
    assert.equal(asset.artifact_uri, `https://github.com/DefinitelySecureStudio/codex/releases/download/${encodeURIComponent(manifest.tag)}/${asset.filename}`);
  }
  const bundle = JSON.parse(await readFile(join(first, 'comic-manifest-v1.0.0.bundle.json')));
  assert.equal(bundle.contract, 'comic-manifest');
  assert.equal(bundle.version, '1.0.0');
  assert.ok(bundle.files.some(file => file.path === 'LICENSE'));
  assert.ok(bundle.files.some(file => file.path === 'NOTICE'));
  assert.ok(bundle.files.some(file => file.path === 'releases/comic-manifest-v1.json'));
  assert.ok(bundle.files.some(file => file.path === 'releases/comic-manifest-v1.md'));
  assert.ok(!manifest.tag.includes('prompt-definition'));
  assert.ok(!manifest.tag.includes('context-builder'));
});

test('release builder accepts an explicit source commit only for an exact matching tree', async t => {
  const root = await mkdtemp(join(tmpdir(), 'codex-release-source-identity-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: new URL('../', import.meta.url) }).toString().trim();
  const verifiedCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: new URL('../', import.meta.url) }).toString().trim();
  const wrongCommit = execFileSync('git', ['rev-parse', 'HEAD^'], { cwd: new URL('../', import.meta.url) }).toString().trim();
  const [manifest] = await buildContractRelease(join(root, 'matching'), 'comic-manifest-v1', { commit: verifiedCommit, tree });
  assert.equal(manifest.commit, verifiedCommit);
  await assert.rejects(buildContractRelease(join(root, 'wrong-tree'), 'comic-manifest-v1', { commit: verifiedCommit, tree: 'b'.repeat(40) }), /exact matching local Git tree/);
  await assert.rejects(buildContractRelease(join(root, 'missing-commit'), 'comic-manifest-v1', { commit: 'a'.repeat(40), tree }), /not present as a verified local Git commit object/);
  await assert.rejects(buildContractRelease(join(root, 'wrong-commit'), 'comic-manifest-v1', { commit: wrongCommit, tree }), /exact matching local Git tree/);
});

test('release output resolution rejects symlinked parents into the checkout', async t => {
  const temp = await mkdtemp(join(tmpdir(), 'codex-release-output-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const checkout = new URL('../', import.meta.url).pathname;
  const alias = join(temp, 'checkout-alias');
  await symlink(checkout, alias, 'dir');
  await assert.rejects(resolveExternalOutput(join(alias, 'artifacts')), /outside the checkout/);
});
