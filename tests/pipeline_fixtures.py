"""Replay recorded live API responses (tests/fixtures/pipeline, recorded 24 Oct 2026 from GitHub Actions)
so the pipeline can be tested without the network. `make_root` builds a throwaway copy of the
parts of the repo the pipeline reads, so tests never touch the real data/ folder."""
import json, os, shutil, tempfile

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FX = os.path.join(R, "tests", "fixtures", "pipeline")
ROUTES = [  # (url fragment, fixture) - first match wins
    ("datamapper/api/v1/indicators", "imf_dm_indicators"),
    ("datamapper/api/v1/NGDPDPC", "imf_dm_ngdpdpc_all"),
    ("datamapper/api/v1/NGDPD", "imf_dm_ngdpd_all"),
    ("datamapper/api/v1/NGDP_RPCH", "imf_dm_growth_nga"),
    ("datamapper/api/v1/PCPIPCH", "imf_dm_pcpipch_all"),
    ("v2/indicator/NY.GDP.PCAP.CD", "wb_indicator_meta"),
    ("v2/country/all/indicator/NY.GDP.PCAP.CD", "wb_all_gdppc_mrv"),
    ("v2/country?format=json", "wb_countries"),
]


def body(name): return open(os.path.join(FX, name + ".json"), "rb").read()


class Replay:
    """transport(url, timeout) -> (status, headers, body). `edit` maps fixture name -> function(json) -> json,
    `fail` maps url fragment -> list of outcomes to return first ('timeout', 503, 429, ...)."""
    def __init__(self, edit=None, fail=None):
        self.edit, self.fail, self.calls = edit or {}, {k: list(v) for k, v in (fail or {}).items()}, []

    def __call__(self, url, timeout):
        self.calls.append(url)
        for frag, outs in self.fail.items():
            if frag in url and outs:
                o = outs.pop(0)
                if o == "timeout": raise TimeoutError("timed out")
                if isinstance(o, tuple): return o
                return o, {"Retry-After": "7"} if o == 429 else {}, b"error"
        for frag, name in ROUTES:
            if frag in url:
                b = body(name)
                if name in self.edit: b = json.dumps(self.edit[name](json.loads(b))).encode()
                return 200, {"Content-Type": "application/json"}, b
        return 404, {}, b"not recorded"


def make_root():
    t = tempfile.mkdtemp(prefix="atlas-pipeline-test-")
    shutil.copytree(os.path.join(R, "pipeline", "config"), os.path.join(t, "pipeline", "config"))
    os.makedirs(os.path.join(t, "src", "data")); shutil.copy(os.path.join(R, "src", "data", "facts.json"), os.path.join(t, "src", "data"))
    shutil.copytree(os.path.join(R, "data", "extracted"), os.path.join(t, "data", "extracted"))
    return t
