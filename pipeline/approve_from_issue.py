"""Approve the held updates listed in a data-review issue, after its owner comments "approve".

    ISSUE_BODY=... COMMENT_BODY=... python3 -m pipeline.approve_from_issue

Approves only versions that are both listed in the issue (the hidden `approve:` line written by
notify.py) and still held in data/review/ with the same hash, so a person approves exactly what
they read. The workflow checks that the commenter is the repository owner before calling this.
Exit 0 with a list of approvals; exit 3 if nothing matched.
"""
import glob, json, os, re, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wants_approval(comment):
    return re.fullmatch(r"\s*approved?[.!]?\s*", (comment or "").lower()) is not None


def listed(issue_body):
    m = re.search(r"<!-- approve: ([^>]*) -->", issue_body or "")
    return dict(x.split("=", 1) for x in m.group(1).split(";") if "=" in x) if m else {}


def approve(issue_body, comment, root=R, who="the owner, by issue comment"):
    if not wants_approval(comment): return {}
    want = listed(issue_body); done = {}
    p = os.path.join(root, "pipeline", "config", "approvals.json"); a = json.load(open(p))
    for f in glob.glob(os.path.join(root, "data", "review", "*.json")):
        d = json.load(open(f))
        if want.get(d["indicator"]) == d["hash"]:
            a["approve"][d["indicator"]] = d["hash"]; done[d["indicator"]] = d["hash"]
    if done:
        a["approved_by"] = who
        open(p, "w").write(json.dumps(a, indent=1))
    return done


if __name__ == "__main__":
    got = approve(os.environ.get("ISSUE_BODY", ""), os.environ.get("COMMENT_BODY", ""),
                  who=f"{os.environ.get('COMMENTER', 'owner')} by comment on issue #{os.environ.get('ISSUE_NUMBER', '?')}")
    print("approved:", got or "nothing (the held versions changed since the issue was written, or the comment was not 'approve')")
    sys.exit(0 if got else 3)
