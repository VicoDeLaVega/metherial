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

## Salle de donjon (scène de démonstration)

Le bouton « Salle de donjon » ouvre une scène WebGPU avec murs, piliers, dalles, caisse en bois, grille métallique et deux sources lumineuses animées. Le matériau actif du graphe est appliqué aux murs ; les autres surfaces utilisent des shaders de démonstration indépendants. Réglages directs d'humidité du sol et de puissance/animation des torches. La caméra conserve les contrôles d'orbite, zoom et déplacement. Le mode GPU est activé à l'entrée de la salle.

La scène utilise du ray marching SDF et des ombres calculées dans le shader, sans ray tracing matériel. Il s'agit d'un aperçu de matériaux en contexte, pas encore d'un éditeur de niveau, d'un système de placement d'objets ou d'un export de scène. Les sols et les accessoires ne sont pas encore assignables à des graphes distincts.

La salle dispose désormais d'un mélange brique/enduit fissuré, de traces d'humidité et de mousse au bas des murs, de suie au-dessus des torches et de poussière près des bords du sol. Les dalles ont des hauteurs/inclinaisons individuelles et des arêtes adoucies ; gravats et planche tombée sont des volumes SDF. Les piliers ont des biseaux, les torches des supports et une flamme animée. Éclairage principal à gauche, remplissage plus faible à droite et occlusion de proximité. Ces ajouts restent des approximations procédurales de démonstration, sans rebonds de lumière ni réflexions de scène complètes.

Qualité de la salle : 960 px, 1440 px (par défaut) ou résolution native, indépendamment de la résolution des cartes de matériau et des exports. L'humidité modifie la couleur et la rugosité des zones mouillées ; la pause des torches fige leur animation.

L'arrière de la salle comporte une véritable ouverture voûtée découpée dans le mur, un encadrement de pierre et un couloir de quatre mètres derrière la grille. Un éclairage froid distingue ce passage des torches chaudes. La caisse possède des renforts diagonaux et des rivets en volume ; son grain a été atténué et les zones rouillées du métal modifient aussi rugosité et métallicité. Ces changements sont intégrés à la scène de démonstration, sans modifier le graphe ni les réglages de base du matériau sélectionné.

Mousse de sol : colonies de bruits continus masquées par les joints des dalles, avec variation de couleur, rugosité et normale. Le slider « Mousse dans les joints » règle leur quantité sans recalcul du graphe. Décor mural : frises en pierre avec moulures, motifs de bronze patiné et plaques losangées en relief. Cavités : soustractions CSG dans les murs, aux contours partiellement ébréchés, avec intérieur assombri et mat ; elles restent peu profondes et ne traversent pas toute l'épaisseur du mur. Ces éléments appartiennent à la scène de démonstration.

Les quatre colonnes utilisent chacune une seed stable et un matériau dédié : dimensions, inclinaison légère, décalage/rotation des blocs, joints et éclats varient par colonne et par assise. Les bases et chapiteaux ont aussi des tailles et dommages distincts. Taches, coulures, dépôts minéraux et micro-relief sont propres à chaque colonne ; humidité et mousse se concentrent près du sol et suivent les réglages de la salle. Les surfaces de plafond et de couloir conservent leur matériau séparé.

## Comparaison avec les cartes Poly Haven

« Comparer à Poly Haven » ouvre deux sphères rendues avec le même moteur WebGPU, le même éclairage et une caméra synchronisée. À gauche : le matériau courant (y compris le mode GPU simplifié). À droite : les cartes PBR originales de la référence choisie, téléchargées à la demande via l'API publique. Ce n'est pas une capture du viewer de Poly Haven. Les cartes conservent leurs couleurs, normales et rugosités propres ; la rugosité globale du matériau procédural n'est pas imposée à la référence.

Choix 1K/2K et vues BaseColor, Roughness, Height, Normal (OpenGL), AO. Le déplacement des sphères est désactivé pour cette première comparaison, qui utilise uniquement la normale complète. La comparaison des cartes ne change pas leur tiling. En mode CPU la vue Height utilise la carte complète ; en mode GPU elle lit la hauteur d'aperçu. La caméra des deux sphères est indépendante de la scène principale. Glisser pour orbiter, molette pour zoomer, double clic pour recentrer.

Les originaux de comparaison sont des JPG (ou PNG si JPG absent), pas des EXR haute précision. Ils sont mis en cache dans le navigateur. « Cartes Poly Haven » télécharge un ZIP unique contenant les cinq fichiers et un manifeste SOURCE-LICENSE.json. L'asset et la résolution sont indiqués dans le nom du ZIP. Les cartes proviennent de https://api.polyhaven.com et https://dl.polyhaven.org ; licence des assets : https://polyhaven.com/license (CC0). Aucun rendu d'exemple du site n'est copié. Les fichiers de référence ne remplacent pas les recettes procédurales et ne sont pas inclus dans les projets JSON.

## Première calibration sur cartes originales

Les recettes Painted Brick et Worn Brick Floor sont maintenant réglées à partir de leurs cartes CC0 2048 : dimensions des éléments, nombre de rangées, palette, couverture de peinture, couleur des joints/dépôts, rugosité et intensité des normales. Le sol utilise des briques courtes et des éléments divisés ; le mur peint possède 22 rangées et une peinture presque continue, érodée dans les joints. Les recettes restent sans image externe.

Mesures de contrôle sur une génération CPU 256 : Painted Brick RGB moyen 119,9/161,2/174,1 (référence 119,7/158,8/170,4), rugosité 0,935 (référence 0,933). Worn Brick Floor RGB 86,7/62,5/46,4 (référence 93,5/65,1/48,5), rugosité 0,953 (référence 0,950). Ces statistiques contrôlent couleur et matité, pas la fidélité des formes ni une correspondance pixel par pixel. Les 153 autres recettes ont ensuite reçu la calibration statistique décrite ci-dessous.

Le générateur GPU de maçonnerie reprend désormais les limites irrégulières des briques, les divisions, le biseau, les inclinaisons et les fissures du générateur CPU. Flood Fill et d'autres effets restent des approximations GPU. Les nouveaux contrôles sont migrés dans les anciens projets. Exécuter node tests-calibration.cjs pour vérifier les statistiques, raccords et migrations.

Dans le comparateur, « Rugosité du preset » utilise la valeur prévue par la recette sans modifier le slider global du graphe. Décochez pour comparer votre réglage personnel. Cela évite de comparer une recette censée être mate avec le slider principal resté à une valeur brillante. Recharger un preset du catalogue est nécessaire pour récupérer sa nouvelle recette ; les projets sauvegardés conservent leurs paramètres.

## Calibration du catalogue complet (155 recettes)

Les cartes BaseColor, Roughness et Height originales 1K ont été mesurées pour les 155 références : palette, moyenne RGB, rugosité moyenne, dispersion et périodicité des rangées. Les recettes restent intégralement procédurales ; aucune image originale n’est embarquée dans leurs graphes. La balance RGB par canal est éditable dans PBR Output. Les deux recettes réglées manuellement ci-dessus sont conservées.

La vérification CPU à 256 est consignée dans assets/catalog-calibration-report.json. Une moyenne de couleur proche ne démontre pas la fidélité du motif, des taches ou du relief. Les rangées déduites du spectre restent des estimations. Blue Floor Tiles 01 et Random Bricks Thick utilisent désormais une maçonnerie rectangulaire ; Concrete Block Wall est classé Béton ; le masque hexagonal possède un nombre de rangées indépendant et un calcul GPU corrigé. Les motifs décoratifs complexes restent des approximations. Six références ont été examinées par échantillonnage visuel ; les 155 n’ont pas fait l’objet d’une validation visuelle individuelle.
