# SignBank — Ordre del dia: reunió importació de fitxes

Document per conduir la reunió amb l'equip del diccionari / autors de fitxes LSC.

**Data reunió:** _______________  
**Assistents:** _______________  
**Fitxers de mostra:** [`Examples/`](../Examples/) (`MENJAR`, `CERVESA`, `BESSONS-1d`)  
**Pla general:** [`fitxas-import-plan.md`](fitxas-import-plan.md)  
**Referència ENUMs:** [`fitxas-import-enums-reference.md`](fitxas-import-enums-reference.md)

---

## Resum (1 min)

Importem les fitxes Word (JSON) a SignBank. Part del contingut ja encaixa; altres camps cal aclarir-los. La fonologia i les categories tancades requereixen acord sobre **mapatge** o **canvi de vocabulari**.

---

## 1. Decisions ja preses per SignBank (v1)

Confirmar amb l'equip que té sentit:

| Camp JSON | Què farem | Exemple |
|-----------|-----------|---------|
| `morfologia_sequencial` | Mostrar morfemes ordenats del signe compost | `BESSONS-1d` → GERMÀ + SEGON |
| `is_compound` | Indicador visual: signe simple vs compost | `true` / `false` |
| `compound_signs` | Llista de parts del compost | `["GERMÀ", "SEGON"]` |

**Pregunta de validació:** Enllaçar cada morfema amb la seva fitxa al diccionari quan existeixi — us encaixa?

**Notes reunió:**

- [ ] D'acord amb morfologia seqüencial + indicador compost
- [ ] Enllaços entre morfemes i fitxes: sí / no / més endavant

---

## 2. Camps pendents de clarificació

### 2.1 `alt_glosses` vs `corpus_forms` vs `relacio_signes_forasters`

**Context de mostra (`MENJAR`):**

| Camp | Valors d'exemple |
|------|------------------|
| `alt_glosses` | ALIMENTACIÓ, ÀPAT, CONSUM, VIANDA… |
| `corpus_forms` | MENJAR-rep, MENJAR-S'HO, MENJAR-lfp |
| `relacio_signes_forasters` | `prestec`, `llengua_relacionada`, `glossa_llengua_relacionada` (sovint buit) |

**Preguntes:**

- [ ] Què són exactament `alt_glosses`? Variants de la mateixa entrada, sinònims, o entrades que haurien de ser fitxes separades?
- [ ] Què són `corpus_forms`? Formes attestades en materials (repetició, pronoms, etc.)?
- [ ] En què es diferencien `alt_glosses` i `corpus_forms` en la pràctica editorial?
- [ ] Quan s'omple `relacio_signes_forasters`? Com es relaciona amb SINÒNIM / VARIANT / signes relacionats normals?

**Decisió reunió:** Importar a SignBank? ☐ Sí ☐ No ☐ Més endavant

**Notes:**

---

### 2.2 `camp_semantic` vs `categories`

**Context de mostra:**

| Fitxa | `camp_semantic` | `categories` |
|-------|-----------------|--------------|
| MENJAR | Acte físic | `["Acte físic"]` |
| CERVESA | Aliment | `["Aliment"]` |

**Preguntes:**

- [ ] Són el mateix concepte duplicat o tenen funcions diferents (camp principal vs etiquetes múltiples)?
- [ ] Un signe pot tenir diverses `categories` diferents del `camp_semantic`?
- [ ] L'usuari del diccionari ha de poder filtrar o veure aquests camps?

**Decisió reunió:** ☐ Importar ☐ No importar ☐ Només un dels dos (quín? _______)

**Notes:**

---

### 2.3 `occ_general`, `occ_learning`, `occ_specific`

**Context de mostra:**

| Camp | Exemples |
|------|----------|
| `occ_general` | DILSCAT, MIRA QUÈ DIC, VOCABULARI BÀSIC, MARTÍN & ALVARADO |
| `occ_learning` | A1, A2, APRENEM 1, APRENEM 2 |
| `occ_specific` | ALIMENTS, MEDICINES, ÀREES MEDI SOCIAL |

**Preguntes:**

- [ ] Indiquen en quins materials o contextos apareix el signe?
- [ ] Cal mostrar-ho al diccionari públic o és metadada interna de gestió del corpus?
- [ ] Hi ha una llista tancada de valors possibles o poden aparèixer nous lliurement?
- [ ] Quina diferència funcional hi ha entre general / learning / specific?

**Decisió reunió:** ☐ Mostrar a usuaris ☐ Només admin ☐ No importar

**Notes:**

---

### 2.4 Altres camps (baixa prioritat per ara)

Confirmar si cal incloure'ls o podem ajornar-los:

| Camp | Pregunta ràpida | Decisió |
|------|-----------------|---------|
| `iconicity` | És útil per a l'usuari final? | ☐ Sí ☐ No |
| `valencia` | Només per verbs? Mostrar sempre? | ☐ Sí ☐ No |
| `signes_claus` | Què són els grups de glosses + comentari? | ☐ Sí ☐ No |
| `morfologia_simultania` | Cal mostrar-la com la seqüencial? | ☐ Sí ☐ No |
| `morfologia_abreujada` | Cal mostrar-la? | ☐ Sí ☐ No |
| `entitat_amb_nom` | Quan s'usa? | ☐ Sí ☐ No |

**Notes:**

---

## 3. Parsing i vocabulari tancat (ENUMs)

### 3.1 El problema

SignBank no guarda text lliure per a la fonologia: cada camp de `phonology` del JSON s'ha de convertir en un **valor d'una llista tancada** (ENUM) a la base de dades. Si el text de la fitxa no coincideix amb els nostres valors, cal:

1. **Taula de mapatge** (fitxa → SignBank), mantenint els ENUMs actuals, o  
2. **Ampliar / canviar** els ENUMs de SignBank per reflectir el vocabulari de les fitxes, o  
3. **Canviar l'export** del scraper perquè surti directament amb els IDs de SignBank.

### 3.2 Correspondència camps JSON → SignBank

| Camp JSON (`phonology`) | Camp SignBank (`VideoData`) | ENUM |
|-------------------------|----------------------------|------|
| `nombre_mans` | `hands` | `Hand` |
| `configuracio` | `configuration` | `HandConfiguration` |
| `configuracio_ma_dominant` | *(no hi ha camp separat avui)* | — |
| `configuracio_ma_no_dominant` | *(no hi ha camp separat avui)* | — |
| `canvi_configuracio` | `configurationChanges` | `ConfigurationChange` |
| `relacio_articuladors` | `relationBetweenArticulators` | `RelationBetweenArticulators` |
| `relacio_articuladors_ma_dominant` | *(no separat)* | — |
| `relacio_articuladors_ma_no_dominant` | *(no separat)* | — |
| `localitzacio` | `location` | `Location` |
| `orientacio_moviment` | `movementRelatedOrientation` | `MovementRelatedOrientation` |
| `orientacio_localitzacio` | `orientationRelatedToLocation` | `OrientationRelatedToLocation` |
| `canvi_orientacio` | `orientationChange` | `OrientationChange` |
| `tipus_contacte` | `contactType` | `ContactType` |
| `forma_moviment` | `movementType` | `MovementType` |
| `direccio_moviment` | `movementDirection` | `MovementDirection` |
| `moviment_repetit` | `repeatedMovement` | booleà (`Sí` / `No`) |
| `vocalitzacio` | `vocalization` | text lliure |
| `component_no_manual` | `nonManualComponent` | text lliure |

**Pregunta crítica:** Per a signes amb dues mans, les fitxes tenen valors separats per mà dominant i no dominant. SignBank avui només té **un** valor per configuració i relació entre articuladors. Cal:

- [ ] Modelar mà dominant / no dominant per separat (canvi d'esquema)
- [ ] Només guardar el valor combinat (`"B (B) /O_SSI (O)"`)
- [ ] Altres: _______________

### 3.3 Valors de mostra al JSON vs SignBank

Valors reals de les 3 fitxes de mostra — discutir mapatge fila a fila:

| Fitxa | Camp JSON | Valor a la fitxa | Mapa a SignBank? |
|-------|-----------|------------------|------------------|
| MENJAR | `nombre_mans` | `1` | → `Hand` ? |
| MENJAR | `configuracio` | `Q (Beak)` | → `CONF_33` (Q) ? |
| MENJAR | `localitzacio` | `Boca` | → `MOUTH` ? |
| MENJAR | `canvi_orientacio` | `Extensió > Flexió` | → `EXTENSION_TO_FLEXION` ? |
| MENJAR | `orientacio_moviment` | `Punta dels dits (finger tips)` | ⚠ `vocab_warnings` — no clar |
| CERVESA | `nombre_mans` | `2a` | → `BOTH` ? |
| CERVESA | `configuracio` | `B (B) /O_SSI (O)` | ⚠ combinat + per mà |
| CERVESA | `relacio_articuladors` | `Damunt / Sota` | → `ABOVE_BELOW` ? |
| CERVESA | `localitzacio` | `Mà no-dominant` | → `WEAK_HAND` ? |
| CERVESA | `orientacio_localitzacio` | `AO: palm-down` | → `AO_PALM_DOWN` ? |
| CERVESA | `direccio_moviment` | `Cap a la localització` | → `TOWARDS_LOCATION` ? |
| BESSONS | `nombre_mans` | `2n COMP: 1` | ⚠ compost — com es modela? |
| BESSONS | `localitzacio` | `2n COMP: Espai neutre` | → `NEUTRAL_SPACE` al morfema 2? |
| BESSONS | `phonology_parts` | per morfema `2` | ⚠ v2 — cal per part? |

**Notes reunió (mapatge fonologia):**

---

### 3.4 Altres ENUMs (no fonologia)

| Àmbit | Camp JSON | ENUM SignBank | Pregunta |
|-------|-----------|---------------|----------|
| Traduccions | `tr_ca`, `tr_es`, `tr_en` | `Language` | OK — 4 idiomes fixos |
| Categoria | `lexical_category` | `LexicalCategory` | El text `"Nom o verb"` coincideix amb `NOUN_OR_VERB`? Llista completa a la referència |
| Relacions | `related_signs.*` | `RelationType` | `VEURE TAMBÉ` → `ASSOCIATED_CONCEPT`? Keys en català al JSON |
| Definicions | prefix `Verb-`, `Nom-`, `Adj-` | `LexicalCategory` | Mateix vocabulari que `lexical_category`? |

**Relacions JSON → SignBank:**

| Clau JSON | ENUM SignBank |
|-----------|---------------|
| `SINÒNIM` | `SYNONYM` |
| `ANTÒNIM` | `ANTONYM` |
| `HOMÒNIM` | `HOMONYM` |
| `VARIANT` | `VARIANT` |
| `HIPERÒNIM` | `HYPERNYM` |
| `HIPÒNIM` | `HYPONYM` |
| `VEURE TAMBÉ` | `ASSOCIATED_CONCEPT` |

- [ ] Aquestes claus són estables a totes les fitxes?
- [ ] Falta algun tipus de relació que useu i SignBank no té?

---

## 4. Llista completa d'ENUMs de SignBank

**Obrir durant la reunió:** [`fitxas-import-enums-reference.md`](fitxas-import-enums-reference.md)

Conté **tots** els valors permesos avui a SignBank, amb etiqueta en català de la UI:

| ENUM | Nº valors | Relacionat amb JSON |
|------|-----------|---------------------|
| `Language` | 4 | `tr_*` |
| `LexicalCategory` | 27 | `lexical_category`, prefix de definicions |
| `RelationType` | 8 | `related_signs` |
| `Hand` | 3 | `nombre_mans` |
| `HandConfiguration` | 52 | `configuracio`, `configuracio_ma_*` |
| `ConfigurationChange` | 20 | `canvi_configuracio` |
| `RelationBetweenArticulators` | 12 | `relacio_articuladors`, `relacio_articuladors_ma_*` |
| `Location` | 144 | `localitzacio` |
| `MovementRelatedOrientation` | 49 | `orientacio_moviment` |
| `OrientationRelatedToLocation` | 28 | `orientacio_localitzacio` |
| `OrientationChange` | 17 | `canvi_orientacio` |
| `ContactType` | 14 | `tipus_contacte` |
| `MovementType` | 9 | `forma_moviment` |
| `MovementDirection` | 64 | `direccio_moviment` |

**Pregunta general per a cada ENUM:**

> Els valors de les vostres fitxes són els mateixos que les etiquetes de la columna «Etiqueta UI (ca)», o cal una taula de correspondència? Si en falten, els afegim a SignBank o simplifiqueu l'export?

**Acció acordada:**

- [ ] Mantenim ENUMs SignBank + taula de mapatge (qui la fa? _______)
- [ ] Modifiquem l'export JSON per usar IDs SignBank directament
- [ ] Ampliem ENUMs SignBank (quins? _______)

---

## 5. Altres temes operatius

| Tema | Pregunta | Decisió |
|------|----------|---------|
| Vídeos | `video_url` és Google Drive — tindreu fitxers `.mp4` locals per importar? | |
| Publicació | Import directe al diccionari públic o revisió prèvia per entrada? | |
| ID fitxa | Guardar `id` (p. ex. `0764_01_cervesa`) per traçabilitat? | ☐ Sí ☐ No |
| Qualitat | Què fem amb `vocab_warnings` i valors dubtosos (`????` als parells mínims)? | |

**Notes:**

---

## 6. Accions després de la reunió

| Acció | Responsable | Data |
|-------|-------------|------|
| Actualitzar `fitxas-import-plan.md` amb decisions | | |
| Taula de mapatge fonologia (si s'acorda) | | |
| Llista de camps a importar v1 | | |
| Esquema DB (compostos + `externalId`) | | |

---

## Annex — camps JSON no importats a v1 (referència ràpida)

| Camp | Estat |
|------|-------|
| `morfologia_sequencial`, `is_compound`, `compound_signs` | **v1 confirmat** |
| `definition` (text fusionat) | No cal — redundant |
| `vocab_warnings` | Només log d'importació |
| `phonology_parts` | v2 (fonologia per morfema) |
| Resta de secció 2 | Pendent decisió reunió |
