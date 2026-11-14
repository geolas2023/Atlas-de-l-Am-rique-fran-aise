# Atlas de l'Amérique française

Portail des atlas géohistoriques des francophones d'Amérique du Nord d'Olivier J. Caron (Département de géographie, UQAM), publié à **https://geolas2023.github.io/Atlas-de-l-Am-rique-fran-aise/**.

| Atlas | Type | Adresse |
|---|---|---|
| Les Canadiens français de l'Ouest | thématique (atlas carrefour) | https://geolas2023.github.io/Atlas-Les-Canadiens-Fran-ais-de-l-Ouest/ |
| Atlas Aubry | personnage : François-Xavier Aubry (1824-1854) | https://geolas2023.github.io/Atlas-Aubry/ |
| Atlas Iberville | personnage : Pierre Le Moyne d'Iberville (1661-1706) | https://geolas2023.github.io/Atlas-Iberville/ |
| Atlas Provost | personnage : Étienne Provost (v. 1785-1850), en préparation | dossier provisoire dans l'atlas des Canadiens français |

## Fonctionnement

- `data/atlas.json` est le **registre** du réseau : titre, description, adresse, fichier de données, gabarit de lien vers une fiche (`lien_fiche`), couleur, pages principales.
- `js/portail.js` lit le registre, affiche une carte par atlas et réunit leurs fiches sur une carte (lecture directe des `lieux.geojson` de chaque site). Un clic ouvre la fiche dans son atlas.
- Chaque atlas reste dans son propre dépôt : les adresses déjà partagées ne changent pas.

## Règles du réseau (hub)

1. Chaque fiche vit dans **un seul** atlas ; les autres y renvoient par un lien profond (`#lieu=L78`, `#AH-sf08`…).
2. Champ commun `voir_aussi` dans les données : liste de `{"url": …, "texte": …}`, affichée en boutons dans la fiche.
3. Les identifiants de fiches ne sont jamais réutilisés ; une fiche déplacée garde un renvoi à son ancienne adresse.

## Ajouter un atlas de personnage

1. Créer le dépôt à partir du modèle (l'Atlas Aubry, marqué *Template repository*), activer GitHub Pages.
2. Ajouter son entrée dans `data/atlas.json` (`statut` : `en_preparation` puis `en_ligne`).
3. Poser les renvois `voir_aussi` dans les atlas voisins (pour l'atlas des Canadiens français : `scripts/hub.py`).

## Tester en local

```
python -m http.server 8000
```
