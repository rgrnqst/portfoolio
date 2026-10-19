#!/usr/bin/env python3
"""Ehitab lehe kausta _site.

Kopeerib lehe failid ja töötleb fotod kaustadest img/ehitused/<ehitus>/, img/profiil/ ja img/kaas/:
pöörab õiget pidi, vähendab suuruse, teeb eelvaated ja eemaldab metaandmed (sh asukoha).
Piltide nimekiri kirjutatakse faili _site/img/pildid.json, mille järgi leht galeriid näitab.
"""
import json
import re
import shutil
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

try:  # iPhone'i HEIC-pildid
    from pillow_heif import register_heif_opener
    register_heif_opener()
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif", ".gif", ".bmp", ".tif", ".tiff"}
FULL = 1800   # suurenduse pikem külg (px)
THUMB = 900   # eelvaate pikem külg (px)


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def slug(stem):
    s = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "pilt"


def caption(stem):
    """Failinimest pildiallkiri: 03-emaplaat_ja_cpu.jpg > "Emaplaat ja cpu". Kaamera nimed jäävad allkirjata."""
    s = re.sub(r"^[\d\s._-]+", "", stem)
    s = re.sub(r"[_-]+", " ", s).strip()
    if not s:
        return ""
    if re.match(r"(?i)^(img|dsc|dscn|dcim|pxl|photo|image|pilt|screenshot|whatsapp|signal|mvimg|snapchat|pic)\b", s):
        return ""
    if sum(c.isdigit() for c in s) > len(s) / 3:
        return ""
    return s[:1].upper() + s[1:]


def has_alpha(im):
    return im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)


def normalize(im):
    """Läbipaistvusega pilt (nt eemaldatud taustaga) jääb RGBA-ks, muu teisendatakse RGB-ks."""
    if has_alpha(im):
        im = im.convert("RGBA")
        if im.getextrema()[3][0] < 255:
            return im, True
    return im.convert("RGB"), False


def read_captions(src_dir):
    """Valikuline fail allkirjad.txt: igal real "failinimi = pildiallkiri"."""
    caps = {}
    f = src_dir / "allkirjad.txt"
    if f.is_file():
        for line in f.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                k = k.strip()
                caps[k] = v.strip()
                caps[Path(k).stem] = v.strip()
    return caps


def process_dir(src_dir, out_dir):
    items, used = [], set()
    caps = read_captions(src_dir)
    (out_dir / "allkirjad.txt").unlink(missing_ok=True)
    files = sorted(
        (p for p in src_dir.iterdir() if p.is_file() and p.suffix.lower() in EXT),
        key=lambda p: natural_key(p.name),
    )
    for f in files:
        (out_dir / f.name).unlink(missing_ok=True)  # originaali (koos metaandmetega) lehele ei pane
        rel = f.relative_to(ROOT)
        try:
            with Image.open(f) as im0:
                icc = im0.info.get("icc_profile")
                im, alpha = normalize(ImageOps.exif_transpose(im0))
        except Exception as e:
            print(f"::warning file={rel}::Pilti ei saanud avada: {e}")
            continue
        base = name = slug(f.stem)
        n = 2
        while name in used:
            name = f"{base}-{n}"
            n += 1
        used.add(name)

        full = im.copy()
        full.thumbnail((FULL, FULL), Image.LANCZOS)
        th = im.copy()
        th.thumbnail((THUMB, THUMB), Image.LANCZOS)
        if alpha:  # läbipaistev taust säilib WebP-na
            ext = "webp"
            full.save(out_dir / f"{name}.webp", "WEBP", quality=86, method=6, icc_profile=icc)
            th.save(out_dir / f"{name}.t.webp", "WEBP", quality=80, method=6, icc_profile=icc)
        else:
            ext = "jpg"
            full.save(out_dir / f"{name}.jpg", "JPEG", quality=82, optimize=True, progressive=True, icc_profile=icc)
            th.save(out_dir / f"{name}.t.jpg", "JPEG", quality=76, optimize=True, progressive=True, icc_profile=icc)

        web = out_dir.relative_to(OUT).as_posix()
        items.append({
            "src": f"{web}/{name}.{ext}",
            "thumb": f"{web}/{name}.t.{ext}",
            "w": full.width,
            "h": full.height,
            "alpha": alpha,
            "cap": caps.get(f.name) or caps.get(f.stem) or caption(f.stem),
        })
        print(f"{rel}: {im.width}x{im.height} > {full.width}x{full.height}{' (läbipaistev)' if alpha else ''}")
    return items


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT, OUT, ignore=shutil.ignore_patterns(".git", ".github", "_site"))

    groups = []
    builds = ROOT / "img" / "ehitused"
    if builds.is_dir():
        for d in sorted((p for p in builds.iterdir() if p.is_dir()), key=lambda p: natural_key(p.name)):
            groups.append((f"ehitused/{d.name}", d))
    for single in ("profiil", "kaas"):  # profiilifoto ja kaanepilt
        d = ROOT / "img" / single
        if d.is_dir():
            groups.append((single, d))

    manifest = {}
    for key, src_dir in groups:
        manifest[key] = process_dir(src_dir, OUT / src_dir.relative_to(ROOT))

    (OUT / "img").mkdir(exist_ok=True)
    (OUT / "img" / "pildid.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Galeriid:", {k: len(v) for k, v in manifest.items()} or "pilte pole")


if __name__ == "__main__":
    main()
