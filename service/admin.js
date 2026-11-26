const get = id => document.getElementById(id);
const collection = get('collection');
const editor = get('editor');
const status = get('status');
const output = get('output');
let revision;
let loadedName;

async function request(path, payload) {
  const response = await fetch(path, payload ? { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : undefined);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
const run = work => async () => {
  try { await work(); } catch (error) { status.textContent = error.message; }
};
const load = run(async () => {
  const name = collection.value;
  status.textContent = 'Loading…';
  const item = await request('/documents/' + name);
  if (collection.value !== name) return;
  editor.value = JSON.stringify(item.value, null, 2);
  revision = item.revision;
  loadedName = name;
  status.textContent = 'Draft loaded.';
});
collection.addEventListener('change', load);
get('save').addEventListener('click', run(async () => {
  if (loadedName !== collection.value) throw new Error('Wait for the draft to load.');
  const saved = await request('/documents/' + loadedName, { value: JSON.parse(editor.value), revision });
  revision = saved.revision;
  status.textContent = 'Draft saved.';
}));
get('release').addEventListener('click', run(async () => {
  if (loadedName !== collection.value) throw new Error('Wait for the draft to load.');
  await request('/documents/' + loadedName + '/release', { revision });
  status.textContent = 'Release prepared from the saved draft.';
}));
get('download').addEventListener('click', run(async () => {
  const name = collection.value;
  const { value } = await request('/documents/' + name + '/release');
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Released collection downloaded.';
}));
for (const type of ['inbox', 'measurements']) {
  get(type).addEventListener('click', run(async () => {
    const records = await request('/' + type);
    output.textContent = records.length ? JSON.stringify(records, null, 2) : 'No entries.';
  }));
}
await run(async () => {
  const rows = await request('/documents');
  for (const row of rows) {
    const option = document.createElement('option');
    option.value = row.name;
    option.textContent = row.name;
    collection.append(option);
  }
  await load();
})();
