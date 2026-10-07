#!/usr/bin/env python3
"""Validate pack integrity or a localised document set using only Python's stdlib."""
import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


def validate(root, localised=False):
    errors = []
    documents = sorted(root.rglob("*.md"))
    if not documents:
        return [f"{root}: no Markdown documents found"]
    links = 0
    skills = ("agentic-delivery", "static-web-delivery", "service-backed-delivery")
    core_templates = root / "agentic-delivery" / "templates"
    for path in documents:
        text = path.read_text(encoding="utf-8-sig")
        relative = path.relative_to(root)
        if localised and ("<!-- FILL" in text or "<!-- FILL" in unquote(text)):
            errors.append(f"{relative}: unresolved FILL marker")
        fence = None
        for number, line in enumerate(text.splitlines(), 1):
            match = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
            if match:
                marker, rest = match.groups()
                if fence is None:
                    fence = marker
                elif marker[0] == fence[0] and len(marker) >= len(fence) and not rest.strip():
                    fence = None
                continue
            if fence is not None:
                continue
            for target in re.findall(r"\]\(([^\n]*?)\)", line):
                if "<!-- FILL" in target:
                    continue
                target = target.strip().split(' "', 1)[0].strip("<>")
                parsed = urlsplit(target)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                links += 1
                destination = (path.parent / unquote(parsed.path)).resolve()
                if not destination.is_relative_to(root.resolve()):
                    errors.append(f"{relative}:{number}: link escapes document set: {target}")
                elif not destination.exists():
                    profile = relative.parts[0]
                    template_parts = relative.parts[1:]
                    overlays = []
                    if (not localised and profile in skills[1:]
                            and template_parts and template_parts[0] == "templates"
                            and destination.is_relative_to(root / profile / "templates")):
                        overlays = [core_templates / destination.relative_to(root / profile / "templates")]
                    if (not localised and relative.parts[:2] == ("agentic-delivery", "templates")
                            and destination.is_relative_to(core_templates)):
                        overlays = [root / name / "templates" / destination.relative_to(core_templates)
                                    for name in skills[1:]]
                    if not overlays or not all(overlay.exists() for overlay in overlays):
                        errors.append(f"{relative}:{number}: missing link target: {target}")
        if fence is not None:
            errors.append(f"{relative}: unclosed code fence")
    if not localised:
        required = ["agentic-delivery/README.md", "agentic-delivery/SKILL.md",
                    "agentic-delivery/templates/architecture/features/build-plan.md",
                    "agentic-delivery/method/04-session-protocol.md",
                    "agentic-delivery/method/05-evidence-and-status.md",
                    "agentic-delivery/method/06-safety-rails.md",
                    "static-web-delivery/SKILL.md",
                    "static-web-delivery/templates/architecture/solution-pattern.md",
                    "service-backed-delivery/SKILL.md",
                    "service-backed-delivery/templates/architecture/solution-pattern.md",
                    "service-backed-delivery/method/08-alm-pattern.md",
                    "service-backed-delivery/templates/architecture/alm.md"]
        required += [f"agentic-delivery/prompts/{name}.prompt.md"
                     for name in ("bootstrap", "implement", "handoff", "audit")]
        for name in required:
            if not (root / name).is_file():
                errors.append(f"missing required file: {name}")
        for name in skills:
            skill = root / name / "SKILL.md"
            if skill.exists():
                text = skill.read_text(encoding="utf-8-sig")
                frontmatter = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", text, re.S)
                if (not frontmatter or not re.search(rf"(?m)^name: {name}$", frontmatter[1])
                        or not re.search(r"(?m)^description: (?:\S|[>|]-?)", frontmatter[1])
                        or not re.search(r"(?m)^ {2,}\S", frontmatter[1])):
                    errors.append(f"{name}/SKILL.md: expected matching name and nonempty description frontmatter")
    print(f"Checked {len(documents)} Markdown documents and {links} local links.")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--localised", action="store_true", help="reject unfilled target templates")
    args = parser.parse_args()
    errors = validate(args.root.resolve(), args.localised)
    for error in errors:
        print(error, file=sys.stderr)
    print("Validation failed." if errors else "Validation passed.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
