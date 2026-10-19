# Roger-Romeo Arm e-portfoolio

Staatiline leht (HTML + CSS), avaldatakse GitHub Pagesis Actioni kaudu (`.github/workflows/leht.yml`).

## Fotod

- Profiilifoto: kaust `img/profiil/` (failinimi ei loe, kasutatakse esimest)
- Arvutiehitused: `img/ehitused/pohiarvuti/` ja `img/ehitused/mitx/`, piltide arv pole piiratud
- Järjekord on failinimede järgi (01, 02, ...). Nimi nagu `03-kaablihaldus.jpg` annab pildiallkirja "Kaablihaldus".
- Sobivad jpg, png, webp ja iPhone'i heic.

Iga muudatuse järel vähendab Action fotod, eemaldab neist metaandmed (sh asukoha) ja avaldab lehe. Võtab umbes 1-2 minutit, olekut näeb Actions vahelehelt.

Uue arvutiehituse lisamiseks kopeeri `index.html` failis üks `<article class="build">` plokk ja muuda `data-folder` uue kausta nimeks.

## Muud failid

- `index.html` sisu, `style.css` kujundus, `main.js` menüü ja galerii
- `img/work/` ekraanipildid laboritest
- `.github/pildid.py` fotode töötlus
