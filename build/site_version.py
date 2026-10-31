"""Version the whole offline bundle, including worker logic and install assets."""
import hashlib
import json
import re

PRECACHE = ("manifest.webmanifest", "icon-192.png", "icon-512.png")


def make_worker(page, source, assets):
    template = re.sub(r'const C = "[^"]*";', 'const C = "__CACHE__";', source, count=1)
    template = re.sub(r'const PAGE = "[^"]*";', 'const PAGE = "__PAGE__";', template, count=1)
    template = re.sub(r'const DIGESTS = .*?;', 'const DIGESTS = {};', template, count=1)
    for marker in ('const C = "__CACHE__";', 'const PAGE = "__PAGE__";', 'const DIGESTS = {};'):
        if marker not in template:
            raise ValueError("Missing offline worker version marker: " + marker)
    digest = hashlib.sha256(page + template.encode())
    for name in sorted(assets):
        digest.update(name.encode() + b"\0" + assets[name])
    cache = "mma-" + digest.hexdigest()[:10]
    page_hash = hashlib.sha256(page).hexdigest()
    digests = {name: hashlib.sha256(assets[name]).hexdigest() for name in PRECACHE}
    worker = template.replace('const C = "__CACHE__";', f'const C = "{cache}";')
    worker = worker.replace('const PAGE = "__PAGE__";', f'const PAGE = "{page_hash}";')
    worker = worker.replace('const DIGESTS = {};', "const DIGESTS = " + json.dumps(digests, separators=(",", ":")) + ";")
    return {"cache": cache, "page_sha": page_hash[:10], "worker": worker}
