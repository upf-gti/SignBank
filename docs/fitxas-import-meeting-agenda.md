# SignBank — Ordre del dia: reunió importació de fitxes

Document per conduir la reunió amb l'equip del diccionari / autors de fitxes LSC.

> **Resultat de la reunió (decisions consolidades):** [`fitxas-import-requirements.md`](fitxas-import-requirements.md)

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
Altres maneres amb les que sha identificat aquesta glossa. La glossa es una paraula catalana per definir un signe. 
Es mes per compararho amb altres corpus. En aquest sistema utilitzem menjar, pero potser en altres corpus podrien ser, alimentacio, apat...
Es important tindreho guardat com a referencia. No caldria potser ara per ara mostrarho en pantalla.
- [ ] Què són `corpus_forms`? Formes attestades en materials (repetició, pronoms, etc.)?
El mateixc pero especific per al corpus LSC.
El guardem tambe pero no caldra mostrarlo.
- [ ] Quan s'omple `relacio_signes_forasters`? Com es relaciona amb SINÒNIM / VARIANT / signes relacionats normals?
De moment res.

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
Sha tret camp semantic. eren duplicats
- [ ] Un signe pot tenir diverses `categories` diferents del `camp_semantic`?
Si
- [ ] L'usuari del diccionari ha de poder filtrar o veure aquests camps?
Aixo es meu

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
Occurrencies -> occ_
En quins diccionaris existeixen aquestes glosses.
No es gaire rellevant. Ignorar
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
Si un signe es relacionable a un objecte fisic, o si la forma en que es signa mostra la accio.
Caminar, es fer moviment de caminar amb els dits. es iconic.
Jo el guardaria, per tindrel mes que res.
La posarem a nivell de signe. 
| `valencia` | Només per verbs? Mostrar sempre? | ☐ Sí ☐ No |
Es transitiu o no. Confiar en algo o algu. Posemlo a nivell de fitxa.
| `signes_claus` | Què són els grups de glosses + comentari? | ☐ Sí ☐ No |
Definicio en llengua de signes. Signes necessaris per definir un signe.
Aixo es podria posar al costat de les definicionas
| `morfologia_simultania` | Cal mostrar-la com la seqüencial? | ☐ Sí ☐ No |
Seria de un compost, en comptes de ser sequencial, els signes es fan alhora
| `morfologia_abreujada` | Cal mostrar-la? | ☐ Sí ☐ No |
No sabem que es, pero imaginem que son tambe de compost. PREGUNTAR LALI?
| `entitat_amb_nom` | Quan s'usa? | ☐ Sí ☐ No |
Guardar.

NOTAS

La definicio vindra en un string sense lexic category, ja que la categoria lexica ve al string, que la categoria lexica pugui ser buida. I estigui amagada.

Pot have configuracio ma dominant i no dominant

Compostos, un compost pot estar format per un video de un signe i un compost, que no te fitxa en si.

Els compostos al parseig, pretenen agafar la fonologia del compost fill. i mostrarla per columnes
I podria ser que hi hagues un compost format per un compost. Diuen que com a maxim hi ha 2 profunditats. 