# Systémové nastavení

Návod pro konfiguraci systémových parametrů ISMD nástroje.

⚠️ **Upozornění**: Tato nastavení vyžadují administrátorská oprávnění.

## Přístup k systémovému nastavení

1. Přihlaste se jako administrátor
2. Otevřete "Správa systému"
3. Vyberte "Systémové nastavení"

## Databázové připojení

### Konfigurace databáze

- **Typ databáze** - PostgreSQL, MySQL, SQLite
- **Server** - IP adresa nebo název serveru
- **Port** - číslo portu (výchozí: 5432 pro PostgreSQL)
- **Databáze** - název databáze
- **Uživatel** - přihlašovací jméno
- **Heslo** - přístupové heslo

### Test připojení

1. Vyplňte údaje o databázi
2. Klikněte na "Test připojení"
3. Ověřte úspěšné připojení

## Síťové nastavení

### Proxy server

- **Použít proxy** - ano/ne
- **Adresa proxy** - IP nebo doménové jméno
- **Port** - číslo portu
- **Autentizace** - uživatelské jméno a heslo

### Firewall

- **Povolené porty** - seznam portů
- **IP whitelist** - povolené IP adresy
- **SSL certifikáty** - správa certifikátů

## Bezpečnostní nastavení

### Autentizace

- **Typ autentizace** - lokální, LDAP, SSO
- **Doba platnosti session** - v minutách
- **Minimální síla hesla** - požadavky na heslo
- **Dvoufaktorová autentizace** - zapnuto/vypnuto

### Auditování

- **Logování akcí** - úroveň detailu
- **Uchovávání logů** - doba v dnech
- **Exportní omezení** - limity pro export dat

## Výkonnostní nastavení

### Paměť a CPU

- **Maximální paměť** - limit v GB
- **Počet vláken** - pro paralelní zpracování
- **Cache velikost** - velikost cache v MB
- **Timeout operací** - v sekundách

### Databázové optimalizace

- **Connection pool** - počet připojení
- **Query timeout** - timeout dotazů
- **Indexování** - automatické vytváření indexů

## Zálohování systému

### Automatické zálohy

- **Frekvence** - denně, týdně, měsíčně
- **Čas spuštění** - hodina spuštění
- **Umístění** - cesta k záložním souborům
- **Retence** - počet uchovávaných záloh

### Manuální záloha

1. Klikněte na "Vytvořit zálohu"
2. Vyberte komponenty k zálohování
3. Zadejte název zálohy
4. Spusťte proces zálohování

## Monitoring systému

### Systémové metriky

- **CPU využití** - aktuální a historické
- **Paměť** - využití RAM
- **Disk** - volné místo
- **Síť** - propustnost

### Alerty

- **Prahové hodnoty** - limity pro upozornění
- **Notifikace** - e-mail, SMS
- **Eskalace** - postupné zvyšování priority

## Údržba systému

### Pravidelná údržba

- **Čištění logů** - automatické mazání starých logů
- **Optimalizace databáze** - přeindexování
- **Aktualizace** - kontrola nových verzí
- **Defragmentace** - optimalizace úložiště

### Diagnostika

- **Systémové testy** - kontrola funkčnosti
- **Výkonnostní testy** - měření rychlosti
- **Integritní testy** - kontrola dat
