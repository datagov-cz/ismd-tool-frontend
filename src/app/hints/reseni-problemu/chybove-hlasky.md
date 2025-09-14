# Chybové hlášky

Přehled běžných chybových hlášek a jejich řešení.

## Chyby při importu dat

### "Nepodporovaný formát souboru"
**Význam**: Soubor není v podporovaném formátu

**Řešení**:
- Použijte CSV, Excel (.xlsx, .xls), JSON nebo XML
- Zkontrolujte příponu souboru
- Převeďte soubor do podporovaného formátu

### "Soubor je příliš velký"
**Význam**: Soubor překračuje maximální povolenou velikost

**Řešení**:
- Rozdělte soubor na menší části
- Maximální velikost je 100MB
- Použijte komprimovaný formát

### "Chyba kódování znaků"
**Význam**: Problém s kódováním textu v souboru

**Řešení**:
- Uložte soubor v kódování UTF-8
- Zkontrolujte speciální znaky
- Použijte správný oddělovač

## Chyby databáze

### "Připojení k databázi selhalo"
**Význam**: Nelze se připojit k databázovému serveru

**Řešení**:
- Zkontrolujte síťové připojení
- Ověřte přihlašovací údaje
- Zkontrolujte nastavení firewallu
- Kontaktujte administrátora

### "Timeout databázového dotazu"
**Význam**: Dotaz trval příliš dlouho

**Řešení**:
- Zmenšete rozsah dat
- Optimalizujte dotaz
- Zkontrolujte výkon serveru
- Zvyšte timeout limit

### "Nedostatečná oprávnění"
**Význam**: Uživatel nemá potřebná práva

**Řešení**:
- Kontaktujte administrátora
- Ověřte uživatelská oprávnění
- Zkontrolujte přístupová práva k tabulkám

## Chyby analýzy

### "Nedostatek dat pro analýzu"
**Význam**: Příliš málo záznamů pro statistickou analýzu

**Řešení**:
- Přidejte více dat
- Minimálně 30 záznamů pro základní statistiky
- Zkontrolujte filtry dat

### "Chybějící hodnoty v klíčových sloupcích"
**Význam**: Prázdné buňky v důležitých datech

**Řešení**:
- Doplňte chybějící hodnoty
- Vyloučte neúplné záznamy
- Použijte interpolaci nebo průměr

### "Nekompatibilní datové typy"
**Význam**: Smíšené typy dat ve sloupci

**Řešení**:
- Sjednoťte formát dat
- Převeďte na správný typ
- Vyčistěte data před analýzou

## Systémové chyby

### "Nedostatek paměti"
**Význam**: Aplikace nemá dostatek RAM

**Řešení**:
- Zavřete jiné aplikace
- Restartujte počítač
- Zpracovávejte menší části dat
- Přidejte více RAM

### "Disk je plný"
**Význam**: Nedostatek místa na disku

**Řešení**:
- Uvolněte místo na disku
- Smažte dočasné soubory
- Přesuňte data na jiný disk
- Vyčistěte cache

### "Aplikace neodpovídá"
**Význam**: Program se zasekl

**Řešení**:
- Počkejte na dokončení operace
- Restartujte aplikaci
- Zkontrolujte Task Manager
- Restartujte počítač

## Síťové chyby

### "Spojení bylo přerušeno"
**Význam**: Ztráta síťového připojení

**Řešení**:
- Zkontrolujte internetové připojení
- Restartujte router
- Zkuste připojení znovu
- Kontaktujte poskytovatele internetu

### "Proxy server nedostupný"
**Význam**: Problém s proxy serverem

**Řešení**:
- Zkontrolujte nastavení proxy
- Ověřte přihlašovací údaje
- Zkuste přímé připojení
- Kontaktujte IT podporu

### "SSL certifikát neplatný"
**Význam**: Problém s bezpečnostním certifikátem

**Řešení**:
- Aktualizujte certifikáty
- Zkontrolujte datum a čas
- Kontaktujte administrátora
- Použijte jiné připojení

## Chyby exportu

### "Nelze vytvořit soubor"
**Význam**: Problém při vytváření výstupního souboru

**Řešení**:
- Zkontrolujte oprávnění k zápisu
- Vyberte jiné umístění
- Zavřete soubor pokud je otevřený
- Uvolněte místo na disku

### "Export byl přerušen"
**Význam**: Proces exportu se nepodařilo dokončit

**Řešení**:
- Zkuste export znovu
- Zmenšete rozsah dat
- Zkontrolujte síťové připojení
- Použijte jiný formát

## Chyby autentizace

### "Neplatné přihlašovací údaje"
**Význam**: Špatné uživatelské jméno nebo heslo

**Řešení**:
- Zkontrolujte překlepy
- Ověřte Caps Lock
- Resetujte heslo
- Kontaktujte administrátora

### "Session vypršela"
**Význam**: Přihlášení již není platné

**Řešení**:
- Přihlaste se znovu
- Zkontrolujte nastavení session
- Obnovte stránku
- Vymažte cookies

## Jak nahlásit chybu

### Informace k zahrnutí
1. **Přesný text chyby** - zkopírujte celou hlášku
2. **Kroky k reprodukci** - jak chybu vyvolat
3. **Systémové informace** - OS, prohlížeč, verze
4. **Screenshots** - snímky obrazovky
5. **Logy** - relevantní záznamy

### Kontakt na podporu
- **E-mail**: podpora@ismd-tool.cz
- **Telefon**: +420 123 456 789
- **Formulář**: [Nahlásit problém](../nastaveni/README.md)

## Související odkazy

- [Časté problémy](./caste-problemy.md)
- [Systémové nastavení](../nastaveni/systemove-nastaveni.md)

[← Zpět do sekce Řešení problémů](./README.md)