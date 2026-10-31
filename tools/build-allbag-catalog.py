"""Merchant-scoped proposal. Never infer inventory or prices from reference stores."""
import json,re,unicodedata,copy
from pathlib import Path
r=Path(__file__).resolve().parents[1]
audit=json.loads((r/'research/allbag-2026-10-31/observed-variants.json').read_text())
extra=json.loads((r/'research/allbag-2026-10-31/extended-products.json').read_text())
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s.lower().replace('ł','l')).encode('ascii','ignore').decode()).strip('-')
def field(id,label,options):return dict(id=id,label=label,options=[dict(id=a,label=b) for a,b in options])
color_names={'Brązowa (kraft)':'Brązowy kraft','biała':'Biały','Biała':'Biały','biały':'Biały','czarna':'Czarny','Czarna':'Czarny','czarny':'Czarny','ecru':'Naturalny','granatowa':'Granatowy','Granatowa':'Granatowy','czerwona':'Czerwony','Czerwona':'Czerwony','zielona':'Zielony','Ciemnozielona':'Ciemnozielony','Jasnozielona':'Jasnozielony','Żółta':'Żółty'}
models=[('papier-plaski','Papier · uchwyt płaski','kraft','papierowy płaski','kraft-flat'),('papier-skrecany','Papier · uchwyt skręcany','kraft','papierowy skręcany','kraft-brown'),('bawelna','Bawełna · długie uchwyty','cotton','długie (70 cm)','cotton-long-natural'),('bawelna-krotkie','Bawełna · krótkie uchwyty','cotton','krótkie (35 cm)','cotton-short-natural'),('bawelna-dno','Bawełna · poszerzane dno','cotton','długie','cotton-bottom'),('bawelna-boki','Bawełna · dno i boki','cotton','długie','cotton-sides'),('workoplecak','Workoplecak bawełniany','drawstring','sznurki','drawstring-natural')]
confirm=['formats','stock-colors-per-format','paper-or-fabric-weight','printing-technology','print-area','minimum-quantity','pricing','lead-time']
def print_fields(single=False):
 options=[('jednostronny','nadruk na wieczku' if single=='pizza' else 'nadruk jednostronny')]
 if not single:options += [('dwustronny-taki-sam','nadruk dwustronny — taki sam'),('dwustronny-rozne','nadruk dwustronny — różne projekty')]
 return [field('printMode','Nadruk',options+[('bez-nadruku','bez nadruku')])]
products=[]
for source,(id,name,family,handle,photo) in zip(audit['products']+[extra['drawstring']],models):
 sizes={};colors={};weights={};matrix=[]
 for v in source['variants']:
  size='x'.join(f'{float(n)/10:g}' for n in re.findall(r'\d+(?:\.\d+)?',v['size']))
  sizes[size]=size.replace('x',' × ')
  color=color_names.get(v['colour'],v['colour']);cid=slug(color);colors[cid]=color
  row={'size':size,'stockColor':cid}
  if 'mat' in v:
   weight=re.search(r'\d+',v['mat'])[0];weights[weight]=weight+' g/m²';row['weight']=weight
  if row not in matrix:matrix.append(row)
 fields=[field('size','Format (cm)',sizes.items())]
 if weights:fields.append(field('weight','Gramatura',weights.items()))
 fields += [field('stockColor','Kolor gotowej bazy',colors.items())]+print_fields()
 products.append(dict(id=id,family=family,category='paper' if family=='kraft' else 'textile',name=name,size=next(iter(sizes)),specs={'Uchwyt':handle,'Materiał':'Papier nielaminowany' if family=='kraft' else 'Bawełna'},fields=fields,variantMatrix=matrix,source=source['url'],photo=photo,pricing='quote',productionStatus='reference-proposal',confirmationRequired=confirm,printing={'id':'digital' if family=='kraft' else 'dtf','label':'Druk cyfrowy' if family=='kraft' else 'DTF · pełny kolor','status':'proposed' if family=='cotton' else 'merchant-direction'}))
# Same physical catering base shares stock with the matching flat-handle SKU.
catering=copy.deepcopy(products[0]);catering.update(id='papier-catering',name='Torba cateringowa',category='gastro',inventoryProductId='papier-plaski',cardNote='Szerokie dno · papierowy uchwyt płaski',size='32x22x24.5')
catering['fields'][0]['options']=[dict(id='32x22x24.5',label='32 × 22 × 24.5')]
catering['variantMatrix']=[v for v in catering['variantMatrix'] if v['size']=='32x22x24.5']
products.append(catering)
# Unconfirmed physical dimensions remain explicit; model-only proportions never become a production size.
for id,name,family,photo,colors,preview,note in [
 ('juta','Torba jutowa','jute','jute-square',[('naturalny','Naturalny')],{'width':30,'height':30,'depth':15},'Wymiary i pole nadruku dobierzemy przy wycenie.'),
 ('serwetki','Serwetki z logo','napkin','napkins-white',[('bialy','Biały')],{'width':16.5,'height':16.5,'depth':.1},'Format, składanie i liczbę warstw ustalimy przy wycenie.')]:
 products.append(dict(id=id,name=name,family=family,category='textile' if family=='jute' else 'gastro',size='Do ustalenia',specs={'Materiał':'Juta' if family=='jute' else 'Papier','Uchwyt':'bawełniany' if family=='jute' else 'brak'},fields=[field('size','Format',[('do-ustalenia','Do ustalenia przy wycenie')]),field('stockColor','Kolor bazy',colors)]+print_fields(family=='napkin'),variantMatrix=[{'size':'do-ustalenia','stockColor':colors[0][0]}],photo=photo,pricing='quote',productionStatus='reference-proposal',confirmationRequired=confirm,previewDimensions=preview,dimensionNote=note,acceptsFormatRequest=True,singleSurface=family=='napkin',printing={'id':'to-confirm' if family=='jute' else 'digital','label':'Nadruk dobierany do materiału' if family=='jute' else 'Druk cyfrowy','status':'to-confirm'}))
for nominal,color,photo in [('45','bialy','pizza-white'),('32','szary-kraft','pizza-kraft')]:
 products.append(dict(id='pizza-'+nominal,name='Pudełko do pizzy '+nominal,family='pizza',category='gastro',size=nominal+' cm',specs={'Materiał':'Tektura','Kolor':'Biały' if color=='bialy' else 'Szary kraft'},fields=[field('size','Rozmiar nominalny',[(nominal,nominal+' cm')]),field('stockColor','Kolor pudełka',[(color,'Biały' if color=='bialy' else 'Szary kraft')])]+print_fields('pizza'),variantMatrix=[{'size':nominal,'stockColor':color}],photo=photo,pricing='quote',productionStatus='reference-proposal',confirmationRequired=['height','print-area','material','pricing','lead-time'],previewDimensions={'width':int(nominal),'height':int(nominal),'depth':4},dimensionNote='Projektujesz zewnętrzne wieczko. Wysokość pudełka i pole nadruku potwierdzimy przy wycenie.',singleSurface=True,printing={'id':'digital','label':'Druk cyfrowy na wieczku','status':'merchant-direction'}))
# Keep the merchant's main range at the start, then textiles, then catering/pizza/napkins.
order=['papier-plaski','papier-skrecany','bawelna','bawelna-krotkie','bawelna-dno','bawelna-boki','juta','workoplecak','papier-catering','pizza-45','pizza-32','serwetki']
products.sort(key=lambda p:order.index(p['id']))
for p in products:
 p['inventoryDimensions']=['size']+(['weight'] if any(f['id']=='weight' for f in p['fields']) else [])+['stockColor']
 p['availability']={'status':'unknown','backorderPolicy':'confirm-with-merchant'}
out=dict(schemaVersion=3,auditedAt='2026-10-31-merchant-33',scopeSource='Merchant messages through 18:10: paper core, textile/DTF and catering extension; Allbag reference variants.',categories=[dict(id='paper',name='Torby papierowe'),dict(id='textile',name='Torby materiałowe'),dict(id='gastro',name='Gastronomia')],families=[dict(id='kraft',name='Torby papierowe'),dict(id='cotton',name='Torby bawełniane'),dict(id='jute',name='Torby jutowe'),dict(id='drawstring',name='Workoplecaki'),dict(id='pizza',name='Pudełka do pizzy'),dict(id='napkin',name='Serwetki')],products=products)
(r/'configuration/catalog-data.js').write_text('// Generated by tools/build-allbag-catalog.py. Reference proposal: merchant must confirm production capabilities.\nexport default '+json.dumps(out,ensure_ascii=False,indent=2)+';\n')
print(len(products),'product bases')
