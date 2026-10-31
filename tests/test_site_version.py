"""A worker-only fix or icon change must get a new offline version."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build.site_version import make_worker

root=Path(__file__).resolve().parents[1]
source=(root/'sw.js').read_text()
assets={n:(root/n).read_bytes() for n in ['manifest.webmanifest','icon-192.png','icon-512.png','og.png']}
page=b'<!doctype html><title>version check</title>'
a=make_worker(page,source,assets)
b=make_worker(page,source+'\n// logic fix\n',assets)
changed={**assets,'icon-192.png':assets['icon-192.png']+b'changed'}
c=make_worker(page,source,changed)
assert a['cache']!=b['cache'] and a['page_sha']==b['page_sha'],'worker-only fix reused its active cache'
assert a['cache']!=c['cache'],'changed install assets reused the old cache'
assert make_worker(page,a['worker'],assets)==a,'version generation is not reproducible'
print('PASS worker-only changes, asset changes and reproducible bundle versions')
