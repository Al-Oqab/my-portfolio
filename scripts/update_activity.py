#!/usr/bin/env python3
"""Write data/github-activity.json (profile, contribution calendar, recent commits).

Runs in GitHub Actions with GITHUB_TOKEN; uses only the standard library.
"""
import datetime as dt
import json
import os
import sys
import urllib.request

USER = os.environ.get("GH_USER", "Al-Oqab")
TOKEN = os.environ["GITHUB_TOKEN"]
WEEKS = 26
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "github-activity.json")

QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    followers { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}
"""
LEVELS = {"NONE": 0, "FIRST_QUARTILE": 1, "SECOND_QUARTILE": 2, "THIRD_QUARTILE": 3, "FOURTH_QUARTILE": 4}


def request(url, body=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Accept": "application/vnd.github+json", "User-Agent": "portfolio-activity"},
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def build(graphql, events, today):
    user = graphql["data"]["user"]
    cal = user["contributionsCollection"]["contributionCalendar"]
    days = [
        {"date": d["date"], "count": d["contributionCount"], "level": LEVELS.get(d["contributionLevel"], 0)}
        for w in cal["weeks"] for d in w["contributionDays"]
    ][-WEEKS * 7:]
    commits = [
        {"date": e["created_at"], "message": c["message"].splitlines()[0]}
        for e in events if e.get("type") == "PushEvent"
        for c in reversed(e["payload"].get("commits", []))
    ][:6]
    return {
        "generated": today.isoformat(),
        "user": USER,
        "repos": user["repositories"]["totalCount"],
        "followers": user["followers"]["totalCount"],
        "total": sum(d["count"] for d in days),
        "contributions": days,
        "commits": commits,
    }


def main():
    today = dt.datetime.now(dt.timezone.utc)
    start = today - dt.timedelta(days=WEEKS * 7 + 7)
    graphql = request("https://api.github.com/graphql", {
        "query": QUERY,
        "variables": {"login": USER, "from": start.isoformat(), "to": today.isoformat()},
    })
    if "errors" in graphql:
        sys.exit(f"GraphQL error: {graphql['errors']}")
    events = request(f"https://api.github.com/users/{USER}/events/public?per_page=30")
    data = build(graphql, events, today.date())
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"wrote {len(data['contributions'])} days, {len(data['commits'])} commits")


if __name__ == "__main__":
    main()
