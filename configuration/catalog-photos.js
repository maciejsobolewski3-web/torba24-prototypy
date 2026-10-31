// Generated product photography is representative; exact dimensions stay in the
// product data and editor. Keep images separate from the editable 2D artwork.
const colors = [
 ['royal-heather', 'royal-heather'], ['black-heather', 'black-heather'],
 ['jasnoniebies', 'lightblue'], ['ciemnoziel', 'forest'], ['jasnoziel', 'green'],
 ['granat', 'navy'], ['czarn', 'black'], ['bial', 'white'], ['braz', 'brown'],
 ['czerwon', 'red'], ['zol', 'yellow'], ['pomarancz', 'orange'],
 ['niebies', 'blue'], ['zielon', 'green'], ['szar', 'gray'], ['fiolet', 'purple']
];
function color(product) {
 // The SKU name also resolves inconsistent color labels in the source specs.
 return colors.find(([token]) => product.id.includes(token))?.[1] || 'natural';
}
export function catalogPhoto(product) {
 if(product.photo)return `../assets/catalog/${product.photo}.webp`;
 let name;
 switch (product.family) {
  case 'laminated':
   name = product.id.endsWith('-s') ? 'laminated-small' :
    /-(l|xxl)$/.test(product.id) ? 'laminated-wide' : 'laminated-medium';
   break;
  case 'premium-kraft':
   name = product.id.endsWith('-s') ? 'premium-kraft-tall' :
    /-(l|xxl)$/.test(product.id) ? 'premium-kraft-wide' : 'premium-kraft-medium';
   break;
  case 'kraft': name = `kraft-${color(product) === 'natural' ? 'brown' : color(product)}`; break;
  case 'giftbox': name = 'giftbox'; break;
  case 'cotton':
   name = `cotton-${product.id.includes('butelke') ? 'bottle' : product.id.includes('krotkie') ? 'short' : 'long'}-${color(product)}`;
   break;
  case 'drawstring': name = `drawstring-${color(product)}`; break;
  case 'jute':
   name = product.id.endsWith('boutique') ? 'jute-tall' :
    /-(jumbo|classic)$/.test(product.id) ? 'jute-wide' : 'jute-square';
   break;
  default: throw new Error(`Missing catalog photography: ${product.family}`);
 }
 return `../assets/catalog/${name}.webp`;
}
