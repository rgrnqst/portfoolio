# Roger-Romeo Arm e-portfoolio

Staatiline leht (HTML + CSS), avaldatakse GitHub Pagesis Actioni kaudu (`.github/workflows/leht.yml`).

## Fotod

- Kaanepilt: kaust `img/kaas/` (kasutatakse esimest pilti)
- Profiilifoto: kaust `img/profiil/` (ilmub jaotisesse Minust)
- Arvutiehitused: `img/ehitused/pohiarvuti/`, `img/ehitused/mitx/` ja `img/ehitused/galerii/`, piltide arv pole piiratud
- Järjekord on failinimede järgi (01, 02, ...).
- Pildiallkirjad: fail `allkirjad.txt` samas kaustas, igal real `failinimi = allkiri`. Ilma selleta tehakse allkiri failinimest (`03-kaablihaldus.jpg` annab "Kaablihaldus").
- Sobivad jpg, png, webp ja iPhone'i heic. Läbipaistva taustaga png/webp saab lehel tumeda "stuudio" tausta.

Iga muudatuse järel vähendab Action fotod, eemaldab neist metaandmed (sh asukoha) ja avaldab lehe. Võtab umbes 1-2 minutit, olekut näeb Actions vahelehelt.

Uue arvutiehituse lisamiseks kopeeri `index.html` failis üks `<article class="build">` plokk ja muuda `data-folder` uue kausta nimeks.

## Muud failid

- `index.html` sisu, `style.css` kujundus, `main.js` menüü ja galerii
- `img/work/` ekraanipildid laboritest
- `.github/pildid.py` fotode töötlus
