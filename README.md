# metherial — Material Lab

Éditeur HTML local de matériaux procéduraux, inspiré des graphes de Substance Designer. Implémentation originale, sans code ni assets Adobe. Aucun paquet npm ni service distant nécessaire.

## Lancement

Ouvrir un terminal dans le dossier du projet, puis :

    npm start

Ouvrir http://127.0.0.1:4173 dans Chrome ou Edge avec WebGPU activé et un GPU compatible. Le port peut être changé dans server.cjs. Le serveur ne se lie qu'à la boucle locale.

## Utilisation

- Choisir un des cinq matériaux : calcaire, acier oxydé, chêne, marbre ou brique.
- Ajouter un node depuis la bibliothèque. Cliquer sur son titre pour sélectionner et modifier ses propriétés.
- Cliquer sur une sortie puis sur une entrée pour connecter. Double-cliquer sur une entrée pour déconnecter. Les cycles sont refusés.
- Glisser les titres pour déplacer les nodes. Glisser le fond pour naviguer, utiliser la molette pour zoomer et Centrer pour cadrer.
- Le premier node PBR Output définit le matériau. Conserver une seule sortie par projet.
- Faire tourner la sphère en glissant sur l'aperçu ou activer Auto. Plan affiche la texture sur un support plat.
- Cliquer une carte pour exporter le PNG : BaseColor, Roughness, Height, Normal (convention Y+), AO. Le métal est un paramètre uniforme de l'aperçu.
- Exporter les maps lance cinq téléchargements ; le navigateur peut demander de les autoriser.
- Sauvegarder/Ouvrir échange des graphes JSON. La session est aussi conservée dans localStorage.

## Architecture et limites actuelles

Le rendu utilise exclusivement WebGPU et un shader WGSL : sphère analytique/plan, BRDF GGX, deux éclairages de studio, normales, rugosité et AO. Pas de repli WebGL. Le graphe est évalué sur CPU (JavaScript Float32Array), puis les textures sont téléversées sur GPU. Ce n'est pas encore un moteur de compute shaders WebGPU.

12 nodes : Fractal Noise, Voronoi, Stains/Grunge, Tile Sampler, Wood Grain, Marble Veins, Blur, Ambient Occlusion, Edge Detector, Blend/Multiply, Levels, PBR Output.

Les générateurs sont périodiques et les filtres bouclent aux bords. L'AO est une estimation locale de la hauteur. Les palettes et cartes de rugosité sont dérivées d'un champ scalaire ; elles ne remplacent pas des textures mesurées. Les cinq exemples sont des points de départ procéduraux, pas une garantie de photoréalisme. L'aperçu n'a pas encore de HDRI, de déplacement géométrique, de path tracing ni d'import de mesh. Les résolutions disponibles sont 256, 512 et 1024 ; le calcul est synchrone et peut ralentir pour un grand graphe.

## Vérification

    npm test

Les tests couvrent les cinq presets, tous les nodes, le déterminisme, les valeurs finies, la périodicité du bruit, le rejet des cycles, la validation d'import et le flou constant. La compilation et le rendu WGSL doivent être vérifiés dans le navigateur ; les erreurs de compilation WebGPU sont affichées dans la barre d'état.

Vérification de cette livraison : syntaxe JavaScript et tests du moteur validés. Vérification visuelle WebGPU non réalisée : accès localhost expiré dans l'environnement d'exécution et protocole file bloqué par l'outil navigateur.

Collection dark fantasy : 31 exemples, dont 10 murs, 8 nouvelles briques et 8 nouveaux bois. Filtres de bibliothèque par famille. Nouveaux nodes Dungeon Masonry, Ancient Timber et Ruined Plaster. Le rendu reste procédural stylisé ; le photoréalisme final dépend de l'éclairage, de l'échelle et de l'intégration dans le jeu.

Refonte des matériaux : 31 graphes de 11 nodes avec Warp, Surface Detail, Flood Fill Random, Dirt/Cavity et Invert (20 types au total). PBR Output possède quatre entrées : Height, Color, Roughness, AO. Les anciens projets à une entrée sont migrés au chargement. Rechargez un exemple pour obtenir le nouveau graphe. Les contrôles FOV (20–90 degrés) et Tiling (0.25–10) ne modifient que l'aperçu.

Motifs : 6 générateurs de masques (Herringbone, Hexagon, Basket Weave, Interlocking Pavers, Square Tiles, Ashlar), joints/chanfreins/variation/seed réglables. Blanc = surface ; noir = joint. 12 exemples supplémentaires dans Motifs, pour un total de 43 matériaux et 26 types de nodes. Périodicité testée sur les six masques.

Références : 6 recettes ajustées depuis les images de briques fournies. L'onglet Références applique aussi ses réglages d'aperçu. Premier exemple vérifié visuellement dans Chrome/WebGPU ; approximation procédurale, pas reproduction exacte d'un matériau scanné.

Nouveau mur ancien cuisson contrastée : node Kiln / Mortar Weathering, zones de cuisson noires par brique, abrasion claire et débordements de mortier. Vérifié visuellement dans Chrome/WebGPU à 512.

## Version web

Application statique compatible GitHub Pages : index.html, style.css, app.js et engine.js. WebGPU exige un navigateur et un GPU compatibles ; HTTPS est fourni par GitHub Pages. Les graphes sont conservés dans le navigateur, sans envoi vers un serveur.


Pipeline de relief : HeightMacro (hauteur lissée) pour le ray marching et NormalMicro (résidu haute fréquence atténué) pour les détails. Lorsque le déplacement est nul, l'aperçu utilise la Normal complète. Les sept cartes sont exportables. Mortier et dépôts ont une rugosité distincte des faces. Éclairage toujours analytique de studio, pas encore de HDRI importée.

Éclairage HDRI : Studio Small 09 (Sergej Majboroda / Poly Haven, CC0). Source : https://polyhaven.com/a/studio_small_09 . Radiance linéaire rgba16float, neuf niveaux GGX préfiltrés et irradiance diffuse. Contrôles rotation/intensité/fond ; studio analytique et point light indépendants. Les données sont embarquées dans app.js pour fonctionner sans redémarrer les anciennes versions du serveur local. La réponse spéculaire utilise une approximation de Fresnel intégrée, sans LUT BRDF dédiée. Voir assets/LICENSE.txt.

Résolution par défaut : 2048 × 2048 pour les sept cartes et leurs exports PNG. Calcul du graphe dans un Web Worker annulable ; les vignettes de bibliothèque restent réduites. Vérification navigateur : sept canvases de 2048 × 2048, génération du marbre en environ 17 s sur la machine de test.

## Catalogue procédural inspiré de Poly Haven

155 recettes éditables supplémentaires couvrent l'inventaire brick-block relevé le 31 octobre 2026 : https://polyhaven.com/textures/brick-block. Ce sont des approximations paramétrées à partir des descriptions du catalogue, pas des reproductions exactes ni des scans. Aucune carte de matériau externe n'est importée. Chaque recette conserve sa source et son auteur dans assets/procedural-polyhaven-catalog.json.

Filtre Poly Haven, recherche par nom et filtre par famille dans la bibliothèque. Les vignettes sont calculées à la demande dans un worker ; le matériau actif conserve le calcul et l'export en 2048. Les nouveaux nodes Irregular Stonework et Decorative Blockwork complètent les masques existants. Kiln / Mortar Weathering expose mousse, peinture écaillée, couleur de peinture et bandes.

Sur la sphère, le tiling horizontal est arrondi à un nombre entier de répétitions pour éviter la couture d'un tour incomplet. Le tiling vertical et celui des autres formes restent continus. Le grain minéral et les taches de cuisson utilisent des bruits interpolés, sans cellules de couleur constantes.

## Aperçu progressif

L'option Aperçu progressif affiche successivement 256, 512, 1024 puis 2048, en s'arrêtant à la résolution sélectionnée. Désactivez-la pour calculer directement la résolution cible. Le choix est mémorisé localement. La barre reçoit l'avancement réel des nodes et des lignes de cartes PBR ; sa pondération représente le travail effectué, pas une estimation du temps restant. Une modification annule immédiatement le travail précédent. Les exports sont disponibles lorsque la résolution finale est prête.

## Aperçu temps réel WebGPU (optionnel)

Activez « Temps réel GPU · aperçu simplifié ». Un compute shader WGSL génère les textures directement sur le GPU, en 256, 512 ou 1024. Les paramètres numériques et les couleurs passent par un buffer uniforme ; le shader compilé est réutilisé pendant les réglages. L'orbite, le HDRI et les lumières restent actifs.

Ce mode est une approximation interactive du graphe, sans ray tracing matériel. Les motifs, Flood Fill, AO, blur, usure et certains paramètres structurels diffèrent du calcul complet ; il ne remplace pas la cuisson finale. Les vignettes des nodes ne sont pas recalculées en mode GPU. « Cuire pour exporter » désactive ce mode et calcule le graphe complet à la résolution sélectionnée ; exportez ensuite les cartes PNG. Un échec de compilation revient au calcul complet et affiche sa cause.

Validation : node tests-realtime.cjs vérifie la génération des 205 recettes, les uniforms et la stabilité du shader lors d'un réglage de rugosité. La compilation et les interactions GPU sont vérifiées dans Chrome sur des matériaux représentatifs.
