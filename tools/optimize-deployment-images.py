"""Convert deployed exercise illustrations from oversized PNG to compact WebP."""

from __future__ import annotations

import hashlib
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRS = (ROOT / "images", ROOT / "assets" / "exercises")
TEXT_SUFFIXES = {".js", ".cjs", ".mjs", ".html", ".json", ".md", ".txt", ".py"}
MAX_SIDE = 1200
QUALITY = 88


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z"], cwd=ROOT, check=True, capture_output=True
    )
    return [ROOT / name.decode("utf-8") for name in result.stdout.split(b"\0") if name]


def resized(image: Image.Image) -> Image.Image:
    copy = image.convert("RGB")
    if max(copy.size) > MAX_SIDE:
        copy.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    return copy


def refresh_catalog_hashes() -> int:
    """Keep catalog fingerprints aligned with the deployed WebP bytes."""
    catalog = ROOT / "clinical-catalog.js"
    before = catalog.read_text(encoding="utf-8")

    def replace(match: re.Match[str]) -> str:
        relative = match.group("image")
        image = ROOT / relative
        if not image.exists():
            raise FileNotFoundError(relative)
        digest = hashlib.sha256(image.read_bytes()).hexdigest()
        return match.group("prefix") + digest + match.group("suffix")

    pattern = re.compile(
        r'(?P<prefix>"image":\s*"(?P<image>images/[^"\\]+\.webp)"[\s\S]*?'
        r'"sha256":\s*")[0-9a-f]{64}(?P<suffix>")'
    )
    after, count = pattern.subn(replace, before)
    catalog.write_text(after, encoding="utf-8", newline="")
    return count


def main() -> None:
    sources = sorted(path for folder in IMAGE_DIRS for path in folder.glob("*.png"))
    if not sources:
        refreshed = refresh_catalog_hashes()
        print(f"optimized=0 catalog_hashes={refreshed}")
        return

    original_bytes = sum(path.stat().st_size for path in sources)
    outputs: list[tuple[Path, Path]] = []
    worst_mae = 0.0

    for source in sources:
        target = source.with_suffix(".webp")
        with Image.open(source) as opened:
            reference = resized(opened)
        reference.save(target, "WEBP", quality=QUALITY, method=6, exact=True)
        with Image.open(target) as check:
            decoded = check.convert("RGB")
            if decoded.size != reference.size:
                raise RuntimeError(f"Unexpected dimensions: {target}")
            stat = ImageStat.Stat(ImageChops.difference(reference, decoded))
            worst_mae = max(worst_mae, sum(stat.mean) / len(stat.mean))
        outputs.append((source, target))

    # Update only Git-tracked text. Untracked working files remain untouched.
    names = {source.name: target.name for source, target in outputs}
    relative = {
        source.relative_to(ROOT).as_posix(): target.relative_to(ROOT).as_posix()
        for source, target in outputs
    }
    changed_text = 0
    for path in tracked_files():
        if path.suffix.lower() not in TEXT_SUFFIXES or not path.exists():
            continue
        try:
            before = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        after = before
        for old, new in relative.items():
            after = after.replace(old, new).replace("./" + old, "./" + new)
        for old, new in names.items():
            after = after.replace(old, new)
        if after != before:
            path.write_text(after, encoding="utf-8", newline="")
            changed_text += 1

    for source, _ in outputs:
        source.unlink()

    refreshed = refresh_catalog_hashes()
    optimized_bytes = sum(target.stat().st_size for _, target in outputs)
    print(
        f"optimized={len(outputs)} text_files={changed_text} "
        f"before_mb={original_bytes / 1048576:.2f} "
        f"after_mb={optimized_bytes / 1048576:.2f} "
        f"reduction={(1 - optimized_bytes / original_bytes) * 100:.1f}% "
        f"worst_mean_abs_error={worst_mae:.2f} catalog_hashes={refreshed}"
    )


if __name__ == "__main__":
    main()
