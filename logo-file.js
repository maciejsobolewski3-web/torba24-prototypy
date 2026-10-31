// Local-only preview: validate and decode before replacing a working logo.
export async function readLogo(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error('Wybierz plik mniejszy niż 5 MB.');
  if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) throw new Error('Wybierz logo w formacie PNG, JPG lub SVG.');
  let source = file;
  if (file.type === 'image/svg+xml') {
    const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml');
    if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('Nie możemy odczytać tego pliku SVG.');
    doc.querySelectorAll('script,foreignObject,iframe,object,embed,style').forEach(node => node.remove());
    doc.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'style' || ((name === 'href' || name === 'xlink:href') && !attr.value.startsWith('#'))) node.removeAttribute(attr.name);
    }));
    source = new Blob([new XMLSerializer().serializeToString(doc)], {type:'image/svg+xml'});
  }
  const url = URL.createObjectURL(source);
  try {
    const image = new Image(); image.src = url; await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Empty image');
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('Nie udało się odczytać obrazu. Wybierz poprawny PNG, JPG lub SVG.');
  }
  return {url, name:file.name};
}
