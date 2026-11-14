// Portail « Atlas de l'Amérique française » : lit le registre data/atlas.json, présente chaque atlas
// et réunit leurs fiches sur une carte. Un clic sur un point ouvre la fiche dans son atlas (lien profond).
// Pour ajouter un atlas : une entrée dans data/atlas.json (url, donnees, lien_fiche, couleur…). Rien d'autre à changer.
const EN = document.documentElement.lang === 'en';
const T = (o) => (o && typeof o === 'object') ? (EN ? (o.en || o.fr) : o.fr) : (o || '');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s) => document.querySelector(s);

async function charger() {
  const reg = await fetch('data/atlas.json').then(r => r.json());
  const atlas = reg.atlas;
  // données de chaque atlas en ligne (GitHub Pages autorise la lecture d'un site à l'autre)
  await Promise.all(atlas.map(async a => {
    a.points = [];
    if (!a.donnees || a.statut !== 'en_ligne') return;
    try {
      const d = await fetch(a.url + a.donnees).then(r => r.json());
      a.points = d.features.filter(f => f.geometry && f.geometry.type === 'Point'
        && !(a.exclure_corpus || []).includes(f.properties.corpus));
    } catch (e) { console.warn('Données indisponibles pour', a.id, e); }
  }));
  rendreCartes(atlas);
  rendreCarte(atlas);
}

function lienAtlas(a) { return EN && a.url_en ? a.url_en : a.url; }

function rendreCartes(atlas) {
  const groupes = [['thematique', T({ fr: 'Atlas thématiques', en: 'Thematic atlases' })], ['personnage', T({ fr: 'Atlas de personnages', en: 'Character atlases' })]];
  $('#liste').innerHTML = groupes.map(([type, titre]) => {
    const as = atlas.filter(a => a.type === type);
    if (!as.length) return '';
    return `<h2>${titre}</h2>` + as.map(a => {
      const prep = a.statut !== 'en_ligne';
      const pages = (a.pages || []).map(p => `<a href="${esc(new URL(EN && p.href_en ? p.href_en : p.href, a.url))}">${esc(T(p))}</a>`).join('');
      const n = a.points.length ? `${a.points.length.toLocaleString(EN ? 'en' : 'fr')} ${T({ fr: 'fiches sur la carte', en: 'entries on the map' })} · ` : '';
      return `<article class="carte-atlas${prep ? ' prep' : ''}" style="--c:${esc(a.couleur)}">
        <h3><a href="${esc(lienAtlas(a))}">${esc(T(a.titre))}</a>${prep ? `<span class="badge prep">${T({ fr: 'en préparation', en: 'in preparation' })}</span>` : ''}</h3>
        <p class="sous">${esc(T(a.sous_titre))}</p>
        <p>${esc(T(a.description))}</p>
        <p class="meta">${n}${esc(a.periode || '')}</p>
        ${pages ? `<p class="pages">${pages}</p>` : ''}
        <a class="ouvrir" href="${esc(lienAtlas(a))}">${prep ? T({ fr: 'Voir le dossier →', en: 'See the file →' }) : T({ fr: "Ouvrir l'atlas →", en: 'Open the atlas →' })}</a>
      </article>`;
    }).join('');
  }).join('');
  $('#legende').innerHTML = atlas.filter(a => a.points.length).map(a =>
    `<label><input type="checkbox" checked data-a="${esc(a.id)}"> <i style="background:${esc(a.couleur)}"></i>${esc(T(a.titre))} (${a.points.length})</label>`).join('');
}

function rendreCarte(atlas) {
  const carte = new maplibregl.Map({ container: 'carte', style: 'https://tiles.openfreemap.org/styles/positron', center: [-96, 40], zoom: 3.2, attributionControl: { compact: true } });
  carte.addControl(new maplibregl.NavigationControl(), 'top-right');
  carte.on('load', () => {
    atlas.filter(a => a.points.length).forEach(a => {
      const feats = a.points.map(f => ({ type: 'Feature', geometry: f.geometry, properties: {
        id: f.properties.id, nom: f.properties.nom, date: f.properties.date_edtf || '', corpus: f.properties.corpus || '', atlas: a.id } }));
      carte.addSource(a.id, { type: 'geojson', data: { type: 'FeatureCollection', features: feats } });
      carte.addLayer({ id: a.id, type: 'circle', source: a.id, paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, a.type === 'personnage' ? 4.5 : 3, 8, 7],
        'circle-color': a.couleur, 'circle-opacity': .75, 'circle-stroke-color': '#fffdf8', 'circle-stroke-width': 1 } });
      carte.on('mouseenter', a.id, () => carte.getCanvas().style.cursor = 'pointer');
      carte.on('mouseleave', a.id, () => carte.getCanvas().style.cursor = '');
      carte.on('click', a.id, (e) => {
        const p = e.features[0].properties;
        const url = a.url + a.lien_fiche.replace('{id}', encodeURIComponent(p.id));
        new maplibregl.Popup({ offset: 8 }).setLngLat(e.lngLat).setHTML(
          `<b>${esc(p.nom)}</b><br>${esc(p.date)}<br><span class="src">${esc(T(a.titre))}${p.corpus && p.corpus !== 'undefined' ? ' · ' + esc(p.corpus) : ''}</span><br>
           <a href="${esc(url)}">${T({ fr: 'Ouvrir la fiche dans son atlas →', en: 'Open the entry in its atlas →' })}</a>`).addTo(carte);
      });
    });
    document.querySelectorAll('#legende input').forEach(cb => cb.onchange = () =>
      carte.setLayoutProperty(cb.dataset.a, 'visibility', cb.checked ? 'visible' : 'none'));
  });
}

charger();
