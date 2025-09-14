# Časté problémy

Přehled nejčastějších problémů a jejich řešení.

## Problémy s importem dat

### Soubor se nepodařilo načíst
**Příznaky**: Chybová hláška při pokusu o import

**Možné příčiny**:
- Nepodporovaný formát souboru
- Poškozený soubor
- Příliš velký soubor
- Nesprávné kódování

**Řešení**:
1. Ověřte podporované formáty (CSV, Excel, JSON, XML)
2. Zkuste soubor otevřít v jiné aplikaci
3. Zkontrolujte velikost souboru (max 100MB)
4. Změňte kódování na UTF-8

### Nesprávně rozpoznané sloupce
**Příznaky**: Data v nesprávných sloupcích nebo typech

**Řešení**:
1. Zkontrolujte oddělovače v CSV
2. Nastavte správné kódování
3. Definujte hlavičky manuálně
4. Použijte náhled před importem

## Výkonnostní problémy

### Aplikace je pomalá
**Příznaky**: Dlouhé čekání na odezvu

**Řešení**:
1. Zavřete nepotřebné aplikace
2. Zkontrolujte dostupnou paměť
3. Omezze velikost zpracovávaných dat
4. Restartujte aplikaci

### Aplikace se zasekává
**Příznaky**: Nereagující rozhraní

**Řešení**:
1. Počkejte na dokončení operace
2. Zkontrolujte Task Manager
3. Restartujte aplikaci
4. Zkontrolujte systémové požadavky

## Problémy s připojením

### Nelze se připojit k databázi
**Příznaky**: Chyba připojení při startu

**Řešení**:
1. Zkontrolujte síťové připojení
2. Ověřte nastavení databáze
3. Zkontrolujte firewall
4. Otestujte připojení manuálně

### Proxy server blokuje připojení
**Příznaky**: Timeout při síťových operacích

**Řešení**:
1. Nastavte proxy v aplikaci
2. Přidejte výjimky do firewallu
3. Kontaktujte IT administrátora
4. Použijte VPN připojení

## Problémy s exportem

### Export se nezdařil
**Příznaky**: Chybová hláška při exportu

**Řešení**:
1. Zkontrolujte dostupné místo na disku
2. Ověřte oprávnění k zápisu
3. Zkuste jiný formát exportu
4. Zmenšete rozsah dat

### Poškozený exportovaný soubor
**Příznaky**: Soubor nelze otevřít

**Řešení**:
1. Zkuste export znovu
2. Změňte výstupní formát
3. Zkontrolujte kódování
4. Použijte jiný prohlížeč

## Problémy s analýzou

### Analýza se nepodařila spustit
**Příznaky**: Chyba při spuštění analýzy

**Řešení**:
1. Zkontrolujte vstupní data
2. Ověřte výběr proměnných
3. Zkontrolujte chybějící hodnoty
4. Zmenšete velikost datasetu

### Neočekávané výsledky
**Příznaky**: Podivné nebo nelogické výsledky

**Řešení**:
1. Zkontrolujte kvalitu dat
2. Ověřte nastavení analýzy
3. Zkontrolujte datové typy
4. Validujte vstupní data

## Problémy s rozhraním

### Rozhraní se nezobrazuje správně
**Příznaky**: Chybějící nebo posunuté prvky

**Řešení**:
1. Obnovte stránku (F5)
2. Vymažte cache prohlížeče
3. Zkuste jiný prohlížeč
4. Zkontrolujte rozlišení obrazovky

### Tlačítka nereagují
**Příznaky**: Klikání nemá efekt

**Řešení**:
1. Počkejte na dokončení načítání
2. Zkontrolujte JavaScript
3. Obnovte stránku
4. Restartujte prohlížeč

## Rychlá diagnostika

### Kontrolní seznam
- [ ] Aktuální verze aplikace
- [ ] Podporovaný prohlížeč
- [ ] Dostupná paměť (min 4GB)
- [ ] Síťové připojení
- [ ] Oprávnění k souborům

### Systémové požadavky
- **OS**: Windows 10+, macOS 10.15+, Linux
- **RAM**: Minimálně 4GB, doporučeno 8GB
- **Disk**: 2GB volného místa
- **Prohlížeč**: Chrome 90+, Firefox 88+, Safari 14+

## Související odkazy

- [Chybové hlášky](./chybove-hlasky.md)
- [Systémové nastavení](../nastaveni/systemove-nastaveni.md)
- [Validace dat](../sprava-dat/validace-dat.md)

[← Zpět do sekce Řešení problémů](./README.md)