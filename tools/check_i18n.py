import re, pathlib, json, sys

root = pathlib.Path(".")
htmls = {p: p.read_text(encoding="utf-8") for p in root.glob("*.html")}
i18n = (root/"assets/js/i18n.js").read_text(encoding="utf-8")

# keys defined in the dictionary:  "some.key": { en: ...
defined = set(re.findall(r'^\s*"([a-zA-Z0-9_.]+)"\s*:\s*\{\s*en:', i18n, re.M))

# keys referenced from HTML
used = {}
for p, txt in htmls.items():
    for attr in ("data-i18n", "data-i18n-placeholder", "data-i18n-aria", "data-i18n-title"):
        for k in re.findall(attr + r'="([^"]+)"', txt):
            used.setdefault(k, set()).add(p.name)

# keys referenced from JS (t("..."))
for jf in (root/"assets/js").glob("*.js"):
    txt = jf.read_text(encoding="utf-8")
    for k in re.findall(r'\bt\(\s*"([a-zA-Z0-9_.]+)"', txt):
        used.setdefault(k, set()).add(jf.name)
    for k in re.findall(r'data-i18n="([a-zA-Z0-9_.]+)"', txt):
        used.setdefault(k, set()).add(jf.name)

missing = {k: v for k, v in used.items() if k not in defined}
unused  = sorted(defined - set(used))

print("defined keys :", len(defined))
print("referenced   :", len(used))
print()
if missing:
    print("!! MISSING (referenced but not defined):")
    for k, v in sorted(missing.items()):
        print("   ", k, "  <-", ", ".join(sorted(v)))
else:
    print("OK  no missing keys")

if unused:
    print()
    print("unused keys (harmless, but you may want them):")
    for k in unused:
        print("   ", k)
