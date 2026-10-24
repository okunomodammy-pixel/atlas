"""Fetching with retries. Every request goes through `fetch_json`, so error handling lives in one place.

Retries on timeouts, connection errors, HTTP 429 and 5xx, with back-off; honours Retry-After
(capped). Never retries 4xx other than 429. Raises FetchError with a plain-language reason when
the source cannot be reached, so the caller can keep the last good data.

Tests pass their own `transport` (a function url -> (status, headers, body_bytes)) and a no-op `sleep`.
"""
import json, time, urllib.request, urllib.error, socket


class FetchError(Exception):
    pass


def real_transport(url, timeout, user_agent):
    req = urllib.request.Request(url, headers={"User-Agent": user_agent, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {}), e.read() if hasattr(e, "read") else b""


def fetch_text(url, cfg, transport=None, sleep=time.sleep):
    """Same retries and errors as fetch_json, for web pages (NBS publishes its headline figures on its homepage)."""
    return fetch_json(url, cfg, transport, sleep, parse=lambda b: b.decode("utf-8", "replace"))


def fetch_json(url, cfg, transport=None, sleep=time.sleep, log=None, parse=json.loads):
    """Return (parsed_json, raw_bytes, info). info records attempts for the update log."""
    transport = transport or (lambda u, t: real_transport(u, t, cfg["user_agent"]))
    timeouts, backoff = cfg["timeout"], cfg["backoff"]
    attempts = []
    for i in range(len(timeouts)):
        t0 = time.time()
        try:
            status, headers, body = transport(url, timeouts[i])
        except (socket.timeout, TimeoutError) as e:
            attempts.append(f"timeout after {timeouts[i]}s")
            status, headers, body = None, {}, b""
        except (urllib.error.URLError, ConnectionError, OSError) as e:
            attempts.append(f"connection error: {getattr(e, 'reason', e)}")
            status, headers, body = None, {}, b""
        else:
            attempts.append(f"HTTP {status} in {time.time() - t0:.1f}s")
        if status == 200:
            try:
                return parse(body), body, {"url": url, "attempts": attempts}
            except ValueError:
                raise FetchError(f"{url}: response is not JSON ({len(body)} bytes)")
        if status is not None and 400 <= status < 500 and status != 429:
            raise FetchError(f"{url}: HTTP {status}, not retried")
        if i + 1 < len(timeouts):
            wait = backoff[min(i, len(backoff) - 1)]
            ra = {k.lower(): v for k, v in headers.items()}.get("retry-after")
            if ra and str(ra).isdigit(): wait = min(int(ra), cfg["max_retry_after"])
            sleep(wait)
    raise FetchError(f"{url}: gave up after {len(attempts)} attempts ({'; '.join(attempts)})")
