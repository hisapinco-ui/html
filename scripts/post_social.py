#!/usr/bin/env python3
"""Publish one approved image or video to an Instagram account and a Facebook Page.

All input comes from environment variables, so the GitHub workflow never builds
shell commands out of free text such as the caption. Tokens are only ever sent to
Meta and are never printed.

Environment:
  MEDIA_URL         public link to the file (must be reachable without a login)
  MEDIA_PATH        path of the file in the repo, used to tell image from video
  CAPTION           text for the post
  TARGETS           both | instagram | facebook
  DRY_RUN           "true" checks tokens and the media link but posts nothing
  IG_TOKEN          Instagram access token (repository secret)
  IG_ACCOUNT_ID     Instagram account ID
  FB_TOKEN          system user token for the Page (repository secret)
  FB_PAGE_ID        Facebook Page ID
Optional: META_API_VERSION, META_IG_HOST, META_FB_HOST, POLL_SECONDS, POLL_TRIES
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

VERSION = os.environ.get("META_API_VERSION", "v25.0")
IG_HOST = os.environ.get("META_IG_HOST", "https://graph.instagram.com").rstrip("/")
FB_HOST = os.environ.get("META_FB_HOST", "https://graph.facebook.com").rstrip("/")
POLL_SECONDS = float(os.environ.get("POLL_SECONDS", "5"))
POLL_TRIES = int(os.environ.get("POLL_TRIES", "60"))

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
VIDEO_EXTENSIONS = {".mp4", ".mov"}


class PostError(Exception):
    """A problem we can explain to the user in one sentence."""


def log(message):
    print(message, flush=True)


def call(method, host, path, params):
    """Call the Graph API. Error text never includes the request URL or any token."""
    url = f"{host}/{VERSION}/{path}"
    data = None
    if method == "POST":
        data = urllib.parse.urlencode(params).encode()
    else:
        url += "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, data=data, method=method)
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.loads(response.read().decode() or "{}")
    except urllib.error.HTTPError as err:
        try:
            detail = json.loads(err.read().decode()).get("error", {})
            message = detail.get("message", "no message")
            code = detail.get("code", "?")
        except Exception:
            message, code = "unreadable error body", "?"
        raise PostError(
            f"{method} {path} failed (HTTP {err.code}, Meta code {code}): {message}"
        ) from None
    except urllib.error.URLError as err:
        raise PostError(f"{method} {path} could not connect: {err.reason}") from None


def check_media_url(url):
    """Meta fetches the file itself, so it has to be reachable from the internet."""
    request = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.headers.get("Content-Type", "")
    except Exception as err:
        raise PostError(
            f"The media link cannot be opened ({err}). The repo must be public and the file pushed: {url}"
        ) from None


def wait_until_ready(container_id, token):
    """Videos take a while to process. Images are usually ready at once."""
    for _ in range(POLL_TRIES):
        status = call("GET", IG_HOST, container_id, {"fields": "status_code", "access_token": token})
        code = status.get("status_code", "")
        if code == "FINISHED":
            return
        if code in ("ERROR", "EXPIRED"):
            raise PostError(f"Instagram could not process the media (status {code}).")
        time.sleep(POLL_SECONDS)
    raise PostError("Instagram was still processing the media after waiting. Try again in a few minutes.")


def post_instagram(token, account_id, media_url, kind, caption, dry_run):
    who = call("GET", IG_HOST, account_id, {"fields": "username", "access_token": token})
    log(f"Instagram: token works for @{who.get('username', '?')}")
    if dry_run:
        return {"status": "checked"}

    params = {"caption": caption, "access_token": token}
    if kind == "image":
        params["image_url"] = media_url
    else:
        params["media_type"] = "REELS"
        params["video_url"] = media_url
    container_id = call("POST", IG_HOST, f"{account_id}/media", params)["id"]
    wait_until_ready(container_id, token)
    published = call(
        "POST", IG_HOST, f"{account_id}/media_publish",
        {"creation_id": container_id, "access_token": token},
    )
    media_id = published["id"]
    details = call("GET", IG_HOST, media_id, {"fields": "permalink", "access_token": token})
    return {"status": "posted", "id": media_id, "url": details.get("permalink", "")}


def post_facebook(token, page_id, media_url, kind, caption, dry_run):
    page = call("GET", FB_HOST, page_id, {"fields": "name,access_token", "access_token": token})
    page_token = page.get("access_token")
    if not page_token:
        raise PostError(
            "Facebook did not give a Page token. Check that the system user has full control of the Page."
        )
    log(f"Facebook: Page access works for '{page.get('name', '?')}'")
    if dry_run:
        return {"status": "checked"}

    if kind == "image":
        result = call(
            "POST", FB_HOST, f"{page_id}/photos",
            {"url": media_url, "caption": caption, "published": "true", "access_token": page_token},
        )
        post_id = result.get("post_id") or result.get("id")
        link = f"https://www.facebook.com/{post_id}"
    else:
        result = call(
            "POST", FB_HOST, f"{page_id}/videos",
            {"file_url": media_url, "description": caption, "access_token": page_token},
        )
        post_id = result["id"]
        link = f"https://www.facebook.com/{page_id}/videos/{post_id}"
    return {"status": "posted", "id": post_id, "url": link}


def require(name):
    value = os.environ.get(name, "").strip()
    if not value:
        raise PostError(f"Missing setting: {name}")
    return value


def write_summary(results, dry_run):
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not path:
        return
    heading = "Dry run (nothing was posted)" if dry_run else "Post results"
    lines = [f"### {heading}", "", "| Target | Result | Link or detail |", "| --- | --- | --- |"]
    for target, outcome in results.items():
        lines.append(f"| {target} | {outcome['status']} | {outcome.get('url') or outcome.get('error', '')} |")
    with open(path, "a", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def main():
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"
    targets = os.environ.get("TARGETS", "both").strip().lower()
    if targets not in ("both", "instagram", "facebook"):
        raise PostError("TARGETS must be both, instagram or facebook.")

    media_url = require("MEDIA_URL")
    extension = os.path.splitext(require("MEDIA_PATH"))[1].lower()
    caption = os.environ.get("CAPTION", "")
    if extension in IMAGE_EXTENSIONS:
        kind = "image"
    elif extension in VIDEO_EXTENSIONS:
        kind = "video"
    else:
        raise PostError(f"Unsupported file type '{extension}'. Use .jpg, .jpeg, .png, .mp4 or .mov.")

    do_instagram = targets in ("both", "instagram")
    do_facebook = targets in ("both", "facebook")
    if do_instagram and extension == ".png":
        raise PostError("Instagram only accepts JPEG photos. Convert the PNG to .jpg, or post to Facebook only.")

    log(f"Mode: {'dry run, nothing will be posted' if dry_run else 'LIVE'} | file type: {kind} | targets: {targets}")
    content_type = check_media_url(media_url)
    log(f"Media link opens ({content_type or 'unknown type'})")

    results = {}
    if do_instagram:
        try:
            results["Instagram"] = post_instagram(
                require("IG_TOKEN"), require("IG_ACCOUNT_ID"), media_url, kind, caption, dry_run
            )
        except PostError as err:
            results["Instagram"] = {"status": "failed", "error": str(err)}
    if do_facebook:
        try:
            results["Facebook"] = post_facebook(
                require("FB_TOKEN"), require("FB_PAGE_ID"), media_url, kind, caption, dry_run
            )
        except PostError as err:
            results["Facebook"] = {"status": "failed", "error": str(err)}

    for target, outcome in results.items():
        detail = outcome.get("url") or outcome.get("error") or ""
        log(f"{target}: {outcome['status']} {detail}".rstrip())
    log("RESULT " + json.dumps(results))
    write_summary(results, dry_run)
    return 1 if any(o["status"] == "failed" for o in results.values()) else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except PostError as err:
        log(f"Stopped: {err}")
        sys.exit(1)
