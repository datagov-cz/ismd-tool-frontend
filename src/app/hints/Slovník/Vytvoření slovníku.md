# Vytvoření nového slovníku

Na této stránce můžete vytvořit nový slovník (sémantickou ontologii) dvěma způsoby.

## Způsob 1 – Ruční zadání

Vyplňte formulář s těmito povinnými poli:

| Pole             | Popis                                          |
| ---------------- | ---------------------------------------------- |
| **Název (cs)**   | Český název slovníku                           |
| **Název (en)**   | Anglický název slovníku                        |
| **Popis**        | Stručný popis účelu ontologie                  |
| **Prefix**       | Krátká zkratka pro IRI (např. `fin`, `zdravi`) |
| **Základní IRI** | Kořenová adresa pro všechna IRI v ontologii    |

Po vyplnění klikněte na **Vytvořit slovník**. Slovník se uloží jako rozpracovaný (nepublikovaný).

## Způsob 2 – Import souboru

Nahrajte existující soubor ontologie:

### Podporované formáty

- **JSON-LD** (`.jsonld`) – doporučený formát pro import
- **Turtle** (`.ttl`) – RDF serializace v kompaktním formátu

### Postup importu

1. Klikněte na tlačítko **Nahrát soubor**
2. Vyberte soubor z počítače
3. Systém soubor zpracuje a zobrazí náhled nalezených pojmů
4. Potvrďte import tlačítkem **Importovat**

> **Tip:** Před importem se ujistěte, že soubor používá konzistentní IRI prefixy. Duplicitní IRI budou při importu přeskočeny.
