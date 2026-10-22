#!/usr/bin/env python3
"""Sync a StreamNotes Chinese article to Cnblogs via MetaWeblog.

Usage:
  python3 scripts/cnblogs-sync.py [--slug <slug>]

Credentials: /home/box/agent-data/secrets/cnblogs.env
  CNBLOGS_USERNAME, CNBLOGS_BLOG_ID, CNBLOGS_BLOG_URL, CNBLOGS_METAWEBLOG_TOKEN
RPC: https://rpc.cnblogs.com/metaweblog/<username>
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import xmlrpc.client
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    import yaml
except ImportError:
    print("ERROR missing python3-yaml (PyYAML)", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = ROOT / "src" / "content" / "articles"
SYNCED_PATH = Path(__file__).resolve().parent / "cnblogs-synced.json"
SECRETS_PATH = Path("/home/box/agent-data/secrets/cnblogs.env")
SITE_BASE = "https://streamnotes.terryso.dev"
SHANGHAI = ZoneInfo("Asia/Shanghai")
VENDOR_RE = re.compile(r"(POLYV|保利威)", re.IGNORECASE)


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


def load_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        die(f"ERROR secrets file missing: {path}")
    mode = path.stat().st_mode & 0o777
    if mode & 0o077:
        die(f"ERROR secrets file must be chmod 600 (got {oct(mode)})")
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    required = [
        "CNBLOGS_USERNAME",
        "CNBLOGS_BLOG_ID",
        "CNBLOGS_METAWEBLOG_TOKEN",
    ]
    missing = [k for k in required if not env.get(k)]
    if missing:
        die(f"ERROR missing secrets: {', '.join(missing)}")
    return env


def parse_article(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        die(f"ERROR no frontmatter: {path.name}")
    parts = text.split("---", 2)
    if len(parts) < 3:
        die(f"ERROR malformed frontmatter: {path.name}")
    fm = yaml.safe_load(parts[1]) or {}
    body = parts[2].lstrip("\n")
    return fm, body


def list_candidate_articles() -> list[tuple[str, Path, dict]]:
    out: list[tuple[str, Path, dict]] = []
    for path in sorted(ARTICLES_DIR.glob("*.md")):
        slug = path.stem
        try:
            fm, _ = parse_article(path)
        except SystemExit:
            raise
        except Exception as e:
            die(f"ERROR parse {path.name}: {e}")
        if fm.get("draft") is True:
            continue
        out.append((slug, path, fm))
    return out


def pick_newest(candidates: list[tuple[str, Path, dict]]) -> tuple[str, Path, dict]:
    def sort_key(item: tuple[str, Path, dict]):
        fm = item[2]
        pd = fm.get("pubDate")
        if isinstance(pd, datetime):
            return pd
        if hasattr(pd, "year"):  # date
            return datetime(pd.year, pd.month, pd.day)
        if isinstance(pd, str):
            try:
                return datetime.fromisoformat(pd.replace("Z", "+00:00"))
            except ValueError:
                return datetime.min
        return datetime.min

    if not candidates:
        die("ERROR no publishable articles found")
    return max(candidates, key=sort_key)


def load_synced() -> dict:
    if not SYNCED_PATH.exists():
        data = {"posts": []}
        SYNCED_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        return data
    try:
        data = json.loads(SYNCED_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        die(f"ERROR invalid cnblogs-synced.json: {e}")
    if not isinstance(data, dict) or not isinstance(data.get("posts"), list):
        die("ERROR cnblogs-synced.json must be {\"posts\":[]}")
    return data


def already_synced(data: dict, slug: str) -> dict | None:
    for entry in data["posts"]:
        if isinstance(entry, dict) and entry.get("slug") == slug:
            return entry
    return None


def build_body(fm: dict, body: str, slug: str) -> str:
    title = str(fm.get("title") or "").strip()
    parts: list[str] = []

    tldr = fm.get("tldr") or []
    if tldr:
        parts.append("**TL;DR**\n")
        for item in tldr:
            parts.append(f"- {item}")
        parts.append("")

    parts.append(body.rstrip())
    parts.append("")

    faq = fm.get("faq") or []
    if faq:
        parts.append("## FAQ\n")
        for item in faq:
            q = (item.get("q") or "").strip()
            a = (item.get("a") or "").strip()
            if not q:
                continue
            parts.append(f"**Q: {q}**\n")
            parts.append(f"{a}\n")

    sources = fm.get("sources") or []
    if sources:
        parts.append("## 参考资料\n")
        for src in sources:
            st = (src.get("title") or "").strip()
            su = (src.get("url") or "").strip()
            if st and su:
                parts.append(f"- [{st}]({su})")
            elif su:
                parts.append(f"- {su}")
        parts.append("")

    parts.append(
        f"原文发布于流媒笔记：[{title}]({SITE_BASE}/articles/{slug}/)"
    )
    text = "\n".join(parts).rstrip() + "\n"

    if VENDOR_RE.search(text):
        die("ERROR body still mentions POLYV/保利威; refuse to publish")
    return text


def new_post(env: dict, title: str, description: str) -> str:
    username = env["CNBLOGS_USERNAME"]
    blog_id = str(env["CNBLOGS_BLOG_ID"])
    token = env["CNBLOGS_METAWEBLOG_TOKEN"]
    rpc_url = f"https://rpc.cnblogs.com/metaweblog/{username}"
    proxy = xmlrpc.client.ServerProxy(rpc_url, allow_none=True)
    struct = {
        "title": title,
        "description": description,
        "categories": ["[Markdown]"],
    }
    try:
        postid = proxy.metaWeblog.newPost(blog_id, username, token, struct, True)
    except xmlrpc.client.Fault as e:
        die(f"ERROR metaWeblog.newPost fault: {e.faultCode} {e.faultString}")
    except Exception as e:
        # Never include env/token in error text
        die(f"ERROR metaWeblog.newPost failed: {type(e).__name__}: {e}")
    return str(postid)


def append_synced(data: dict, entry: dict) -> None:
    data["posts"].append(entry)
    SYNCED_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync StreamNotes article to Cnblogs")
    parser.add_argument("--slug", help="Article slug; default = newest by pubDate")
    args = parser.parse_args()

    env = load_env(SECRETS_PATH)
    synced = load_synced()
    candidates = list_candidate_articles()

    if args.slug:
        slug = args.slug.strip()
        match = next((c for c in candidates if c[0] == slug), None)
        if not match:
            # Distinguish draft/missing
            path = ARTICLES_DIR / f"{slug}.md"
            if not path.is_file():
                die(f"ERROR article not found: {slug}")
            fm, _ = parse_article(path)
            if fm.get("draft") is True:
                die(f"ERROR article is draft: {slug}")
            die(f"ERROR article not publishable: {slug}")
        slug, path, fm = match
    else:
        slug, path, fm = pick_newest(candidates)

    if fm.get("promo") is True:
        die("SKIP promo")

    existing = already_synced(synced, slug)
    if existing:
        die("SKIP already")

    title = str(fm.get("title") or "").strip()
    if not title:
        die(f"ERROR missing title for {slug}")

    _, md_body = parse_article(path)
    description = build_body(fm, md_body, slug)
    postid = new_post(env, title, description)
    url = f"https://www.cnblogs.com/{env['CNBLOGS_USERNAME']}/p/{postid}"
    now = datetime.now(SHANGHAI).isoformat(timespec="seconds")
    append_synced(
        synced,
        {
            "slug": slug,
            "postid": postid,
            "title": title,
            "url": url,
            "syncedAt": now,
        },
    )
    print(f"OK slug={slug} postid={postid} url={url}")


if __name__ == "__main__":
    main()
