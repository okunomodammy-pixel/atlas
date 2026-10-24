"""Tell the owner when the data needs a person: one GitHub issue, labelled data-review.

    python3 -m pipeline.notify          (in GitHub Actions: needs GITHUB_TOKEN and GITHUB_REPOSITORY)

The issue lists every update held for review (with the reasons and the exact version hash) and every
source that has not been reachable for 3 weeks. It is rewritten on each run, so it always shows the
current state, and closed when nothing needs attention. Commenting `approve` on it publishes exactly
the versions it lists (see approve_from_issue.py and the workflow).
"""
import datetime as dt, glob, json, os, sys, urllib.request

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABEL = "data-review"
TITLE = "Atlas data: updates waiting for your review"
STALE_DAYS = 21


def gh(method, path, body=None, token=None, api="https://api.github.com"):
    req = urllib.request.Request(api + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
                                          "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "atlas-pipeline"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            t = r.read(); return r.status, (json.loads(t) if t else None)
    except urllib.error.HTTPError as e:
        return e.code, None


def state(root=R, now=None):
    """What needs a person: held updates and sources unreachable for a while."""
    now = now or dt.datetime.now(dt.timezone.utc)
    held = []
    for p in sorted(glob.glob(os.path.join(root, "data", "review", "*.json"))):
        d = json.load(open(p))
        held.append({"id": d["indicator"], "hash": d["hash"], "since": d["created"], "reasons": d["issues"]["review"],
                     "edition": d["staged"].get("edition_label"), "name": d["staged"].get("name")})
    man = json.load(open(os.path.join(root, "data", "manifest.json"))) if os.path.exists(os.path.join(root, "data", "manifest.json")) else {}
    stale = []
    for k, s in (man.get("sources") or {}).items():
        last = s.get("last_success")
        if s.get("last_status") == "failed":
            age = (now - dt.datetime.fromisoformat(last.replace("Z", "+00:00"))).days if last else None
            if age is None or age >= STALE_DAYS:
                stale.append({"source": k, "last_success": last, "error": (s.get("last_error") or "")[:300]})
    return held, stale


def body(held, stale, owner, run_url=""):
    L = [f"@{owner} the weekly data check needs you." if owner else "The weekly data check needs a person.", ""]
    if held:
        L += ["### Updates held for review", "",
              "The live atlas keeps showing the last approved figures until you decide.", ""]
        for h in held:
            L.append(f"**{h['name']}** (`{h['id']}`, {h['edition'] or 'edition not stated'}), version `{h['hash']}`, held since {h['since'][:10]}")
            for r in h["reasons"][:4]: L.append(f"- {r[:400]}")
            if len(h["reasons"]) > 4: L.append(f"- ...and {len(h['reasons']) - 4} more (see `data/review/{h['id']}.json`)")
            L.append("")
        L += ["**To publish these exact versions**, reply to this issue with a comment that says `approve`. "
              "The atlas is rebuilt, tested and published a few minutes later. If the source changes again before then, nothing is published and this issue is updated instead.",
              "", "**To leave them**, do nothing. Nothing is published without approval.", ""]
    if stale:
        L += ["### Sources not reachable", ""]
        for s in stale: L.append(f"- **{s['source']}**: last successful fetch {(s['last_success'] or 'never')[:10]}. Last error: {s['error']}")
        L += ["", "The atlas keeps the last good figures and says when they were last confirmed.", ""]
    if run_url: L.append(f"Run: {run_url}")
    approve = ";".join(f"{h['id']}={h['hash']}" for h in held)
    L.append(f"<!-- approve: {approve} -->")
    return "\n".join(L)


def main(token=None, repo=None, owner=None, root=R, api="https://api.github.com"):
    token = token or os.environ.get("GITHUB_TOKEN"); repo = repo or os.environ.get("GITHUB_REPOSITORY")
    owner = owner if owner is not None else os.environ.get("GITHUB_REPOSITORY_OWNER", "")
    run_url = f"{os.environ.get('GITHUB_SERVER_URL', '')}/{repo}/actions/runs/{os.environ['GITHUB_RUN_ID']}" if os.environ.get("GITHUB_RUN_ID") else ""
    held, stale = state(root)
    st, issues = gh("GET", f"/repos/{repo}/issues?labels={LABEL}&state=open&per_page=10", token=token, api=api)
    if st != 200: print(f"::warning::could not list issues (HTTP {st})"); return "error"
    open_issue = (issues or [None])[0]
    if not held and not stale:
        if open_issue:
            gh("POST", f"/repos/{repo}/issues/{open_issue['number']}/comments", {"body": "Nothing is waiting any more. Closing."}, token, api)
            gh("PATCH", f"/repos/{repo}/issues/{open_issue['number']}", {"state": "closed"}, token, api)
            return "closed"
        return "nothing"
    b = body(held, stale, owner, run_url)
    if open_issue:
        if (open_issue.get("body") or "").split("Run: ")[0] == b.split("Run: ")[0]: return "unchanged"
        gh("PATCH", f"/repos/{repo}/issues/{open_issue['number']}", {"body": b}, token, api)
        gh("POST", f"/repos/{repo}/issues/{open_issue['number']}/comments", {"body": "Updated: the list above now shows the latest state."}, token, api)
        return "updated"
    gh("POST", f"/repos/{repo}/labels", {"name": LABEL, "color": "d4a72c", "description": "Atlas data waiting for a person"}, token, api)
    st, _ = gh("POST", f"/repos/{repo}/issues", {"title": TITLE, "body": b, "labels": [LABEL]}, token, api)
    return "opened" if st == 201 else f"error {st}"


if __name__ == "__main__":
    print("notify:", main())
