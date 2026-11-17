# Flexarion — site du studio

Site vitrine du studio fictif **Flexarion**, studio indépendant de jeux vidéo de science-fiction basé à Aix-en-Provence.
Projet du concours SEO — BUT Informatique 2e année, IUT d'Aix-Marseille.

En ligne : https://hanabadjoudjb21217885.github.io/flexarion/

## Concept

- **Jeu phare :** *Les Archives de Vela*. Le joueur incarne ORA, un drone de maintenance qui reconstitue la mémoire d'un vaisseau-archive abandonné autour du pulsar de Vela, en écoutant les sons enregistrés dans ses coques.
- **Slogan du studio :** « Nous écoutons ce que l'univers a oublié. »
- **Direction artistique :** « archive scientifique ». Pages couleur papier quadrillé, sections couleur encre de nuit, un seul accent orange « signal ».

| Rôle | Couleur |
|---|---|
| Encre (fond sombre) | `#0f1115` |
| Papier (fond clair) | `#f5f1e8` |
| Os (texte sur fond sombre) | `#ece6da` |
| Signal (accent) | `#ff6a3d` |
| Signal sur papier (texte) | `#b13d17` |
| Sarcelle (secondaire) | `#3f8f88` |

Typographies (Google Fonts) : **Fraunces** (titres), **IBM Plex Sans** (texte), **IBM Plex Mono** (étiquettes).

## Arborescence

```text
docs/                       ← dossier publié par GitHub Pages
├── index.html              Accueil
├── studio.html             Le studio
├── les-archives-de-vela.html  Le jeu phare
├── devlog/
│   ├── index.html          Liste des devlogs
│   ├── 01-ecouter-un-pulsar.html
│   └── 02-dessiner-le-vide.html
├── contact.html            Contact & presse
├── 404.html                Page introuvable (servie automatiquement par GitHub Pages)
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/style.css
    ├── js/main.js
    └── img/                Illustrations SVG originales + image de partage (PNG)
JOURNAL_IA.md               Journal d'usage de l'IA (livrable du concours)
```

Les adresses des pages n'ont pas été renommées depuis la première mise en ligne, pour ne pas perdre l'indexation Google déjà demandée.

## Lancer le site en local

Le site est 100 % statique : aucune installation n'est nécessaire.

- **Le plus simple :** ouvrir `docs/index.html` dans un navigateur. Seule la page 404 utilise des chemins absolus (`/flexarion/...`) et ne s'affiche correctement qu'en ligne.
- **Avec un petit serveur** (si Python est installé) :

```bash
cd docs
python -m http.server 8000
```

puis ouvrir http://localhost:8000/

## Mise en ligne (GitHub Pages)

1. Envoyer les modifications sur la branche `main` (`git add`, `git commit`, `git push`).
2. Dans *Settings → Pages* : **Deploy from a branch**, branche `main`, dossier `/docs`.
3. Attendre 1 à 2 minutes. Le déploiement est visible dans l'onglet *Actions*.

### Changer l'adresse du site

Les URL absolues (`canonical`, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`) utilisent toutes `https://hanabadjoudjb21217885.github.io/flexarion/`. Pour changer de domaine, remplacer cette chaîne partout :

```bash
grep -rl "hanabadjoudjb21217885.github.io/flexarion" docs | xargs sed -i "s#hanabadjoudjb21217885.github.io/flexarion#NOUVEAU-DOMAINE#g"
```

Si le site n'est plus servi depuis `/flexarion/`, adapter aussi les chemins de `docs/404.html`.

## Formulaire de contact

Aucun service d'envoi n'est relié : le formulaire vérifie les champs puis affiche clairement qu'il s'agit d'une démonstration.
Pour le rendre fonctionnel sans serveur, renseigner une vraie adresse dans l'attribut `data-recipient` du formulaire (`contact.html`) : à l'envoi, le logiciel de messagerie du visiteur s'ouvre avec le message prérempli. Une alternative est un service de formulaire comme Formspree (création de compte nécessaire).

## SEO — ce qui est en place

- Un `<title>` et une meta description uniques par page, avec « Flexarion » placé naturellement.
- Un seul `<h1>` par page et une hiérarchie `h2`/`h3` cohérente.
- `canonical`, Open Graph et Twitter Cards, avec une image de partage en PNG 1200×630.
- Données structurées JSON-LD : `Organization`, `WebSite`, `VideoGame`, `Blog`, `BlogPosting`, `ContactPage`, `BreadcrumbList`. Pas de faux avis ni de fausse note.
- `robots.txt`, `sitemap.xml`, et une page 404 en `noindex`.
- Attributs `alt` descriptifs, `width`/`height` explicites sur toutes les images (limite les décalages de mise en page) et `loading="lazy"` hors du premier écran.
- Liens internes en silo : chaque devlog renvoie vers le jeu et le studio, et le jeu renvoie vers le devlog.

### Recommandations

1. Dans Google Search Console : envoyer `sitemap.xml`, puis demander l'indexation de l'accueil et de chaque nouvel article.
2. Publier un nouveau devlog régulièrement, et l'ajouter au `sitemap.xml` en mettant à jour `<lastmod>`.
3. Obtenir des liens externes légitimes vers le site : réseaux sociaux du studio, page itch.io, profil GitHub, forums de développeurs indépendants. Jamais depuis les sites des autres groupes, c'est interdit par le règlement.
4. Mesurer les performances réelles (LCP, INP, CLS) avec PageSpeed Insights une fois en ligne. Aucun score n'est annoncé ici sans mesure.
5. RGPD : les polices sont chargées depuis Google Fonts. Pour ne transmettre aucune donnée à Google, il faut héberger les fichiers de police dans `assets/fonts/`.

## Accessibilité

- Lien d'évitement « Aller au contenu », focus visible, navigation entièrement au clavier.
- Menu mobile avec `aria-expanded` et fermeture avec Échap. Sans JavaScript, le menu reste affiché en liste.
- Galerie dans un `<dialog>` natif (gestion du focus et de la touche Échap).
- Formulaire : labels, messages d'erreur reliés aux champs (`aria-describedby`, `aria-invalid`), zone d'état annoncée aux lecteurs d'écran.
- `prefers-reduced-motion` : toutes les animations sont coupées et le graphique du pulsar devient une image fixe.
- Chaque écho sonore du jeu a un équivalent visuel (argument de game design repris sur le site).

## Crédits

Illustrations SVG générées par script pour ce projet (aucune image externe). Polices sous licence SIL Open Font License.
