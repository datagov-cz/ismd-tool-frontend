# Vytvoření nového pojmu

Na této stránce vytvoříte nový pojem (koncept) v rámci vybraného slovníku.

## Povinná pole

- **Název (cs)** – český název pojmu, unikátní v rámci slovníku
- **Název (en)** – anglický ekvivalent
- **Typ pojmu** – třída, vlastnost nebo hodnota číselníku

## Nepovinná pole

- **Definice** – formální popis pojmu, ideálně převzatý ze zdroje
- **Zdroj definice** – URL nebo citace zdroje (zákon, norma, standard)
- **Příklad použití** – konkrétní ilustrace v kontextu domény
- **Komentář** – interní poznámka pro editory

## Hierarchie

Po vytvoření základního pojmu přiřaďte:

1. **Nadřazený pojem** – vyberte ze seznamu existujících pojmů ve slovníku
2. **Ekvivalentní pojmy** – pokud pojem odpovídá konceptu v jiné ontologii

## IRI pojmu

IRI se generuje automaticky ze základního IRI slovníku a názvu pojmu:

```
{základní-IRI}/pojem/{název-bez-diakritiky}
```

Před uložením si IRI zkontrolujte – po publikaci jej nelze změnit.

> **Tip:** Definice by měla být psána v třetí osobě jednotného čísla: „Fyzická osoba je..." nikoli „Tento pojem označuje..."
