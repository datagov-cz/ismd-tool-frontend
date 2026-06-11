export type Hint = { title: string; body: string; recommendation?: string };

export const defaultHint: Hint = {
  title: 'Vytváříte nový pojem ve slovníku.',
  body: 'Klikněte do libovolného pole ve formuláři a zde se zobrazí konkrétní nápověda k jeho vyplnění.',
  recommendation:
    'Začněte názvem, definicí a zdroji. Tato pole nejvíce ovlivňují správné zařazení a srozumitelnost pojmu.',
};
export const defaultHintEdit: Hint = {
  title: 'Upravujete pojem ve slovníku.',
  body: 'Klikněte do libovolného pole ve formuláři a zde se zobrazí konkrétní nápověda k jeho vyplnění.',
  recommendation:
    'Začněte názvem, definicí a zdroji. Tato pole nejvíce ovlivňují správné zařazení a srozumitelnost pojmu.',
};

export const conceptFormHints: Record<string, Hint> = {
  'nameModel.name': {
    title: 'Název pojmu',
    body: 'Hlavní název v daném jazyce (CS povinně, SK a EN volitelně). Použijte jednotné číslo a malá písmena, pokud nejde o vlastní jméno. Vyhněte se zkratkám.',
    recommendation: 'Název by měl být co nejkratší a přitom jednoznačný.',
  },
  'altNameModel.altName': {
    title: 'Alternativní název',
    body: 'Synonyma, zkratky nebo jiné názvy, pod kterými je pojem také znám. Můžete přidat varianty ve více jazycích.',
  },

  conceptType: {
    title: 'Typ pojmu',
    body: 'Určuje povahu pojmu: Třída, Vlastnost, Vztah nebo Datový typ. Volba ovlivní, která další pole se ve formuláři zobrazí.',
    recommendation:
      'Třída popisuje skupinu objektů, vlastnost jejich charakteristiku, vztah propojení mezi nimi.',
  },
  type: {
    title: 'Typ třídy',
    body: 'Upřesnění třídy – např. subjekt, objekt nebo vlastnost práva. Zobrazuje se podle zvoleného typu pojmu.',
  },

  'definitionModel.definition': {
    title: 'Definice',
    body: 'Stručné a jednoznačné vymezení významu pojmu, ideálně jednou větou, která pojem odlišuje od ostatních.',
    recommendation: 'Pokud existuje právní předpis, vycházejte z jeho znění.',
  },
  'descriptionModel.description': {
    title: 'Popis',
    body: 'Doplňující výklad nad rámec definice – kontext, příklady použití nebo vysvětlení hraničních případů.',
  },
  broaderConcept: {
    title: 'Nadřazená třída',
    body: 'Obecnější pojem, pod který tento pojem spadá (vztah „je druhem"). Zařazuje pojem do hierarchie.',
  },
  exactMatch: {
    title: 'Ekvivalentní pojem',
    body: 'Pojem se shodným významem v jiném slovníku nebo registru. Slouží k provázání napříč zdroji.',
  },

  definingLegalSource: {
    title: 'Definující ustanovení předpisu',
    body: 'Ustanovení právního předpisu, ze kterého definice pojmu přímo vychází.',
  },
  relatedLegalSource: {
    title: 'Související ustanovení předpisu',
    body: 'Další ustanovení právních předpisů, která s pojmem souvisejí, ale přímo ho nedefinují.',
  },
  definingNonLegalSource: {
    title: 'Definující nelegislativní zdroj',
    body: 'Neprávní zdroj (norma, metodika, publikace), ze kterého definice vychází. Uveďte název a odkaz.',
  },
  relatedNonLegalSource: {
    title: 'Související nelegislativní zdroj',
    body: 'Neprávní zdroje, které s pojmem souvisejí. Uveďte název a odkaz.',
  },

  agendaCode: {
    title: 'Agenda',
    body: 'Agenda z Registru práv a povinností (RPP), v jejímž rámci se údaj zpracovává. Vyhledejte podle názvu nebo kódu.',
  },
  agendaSystemCode: {
    title: 'Agendový informační systém',
    body: 'Informační systém (AIS), který údaj spravuje. Vyhledejte v seznamu AIS.',
  },
  isPublic: {
    title: 'Veřejnost údaje',
    body: 'Zaškrtněte, pokud je údaj veřejně přístupný. Pokud ne, doplňte ustanovení dokládající jeho neveřejnost.',
  },
  privacyProvisions: {
    title: 'Ustanovení o neveřejnosti',
    body: 'Ustanovení právního předpisu, které omezuje zveřejnění údaje. Vyplňte u neveřejných údajů.',
  },
  isInPPDF: {
    title: 'Propojený datový fond',
    body: 'Zaškrtněte, pokud je údaj součástí propojeného datového fondu (PPDF).',
  },

  contentType: {
    title: 'Typ obsahu údajů',
    body: 'Kategorie obsahu podle vyhlášky 360/2023 – například statistické, referenční nebo provozní údaje.',
  },
  acquisitionMethod: {
    title: 'Způsob získání údajů',
    body: 'Jak orgán údaj získává – vlastní činností, z jiných agend či úřadů, nebo od subjektu údajů.',
  },
  sharingMethod: {
    title: 'Způsob sdílení údajů',
    body: 'Jakým způsobem je údaj sdílen s dalšími orgány. Lze zvolit více možností.',
  },

  ontologyGraphName: {
    title: 'Slovník',
    body: 'Identifikátor slovníku, do kterého pojem patří. Obvykle předvyplněno podle vybraného slovníku.',
  },
  namespace: {
    title: 'Adresa lokálního katalogu dat',
    body: 'Základní URI prostoru jmen pojmu. Předvyplňuje se z adresy slovníku, lze upravit.',
  },

  identifier: {
    title: 'Identifikátor',
    body: 'Jednoznačný identifikátor pojmu. Obvykle se generuje automaticky z názvu.',
  },
  dataType: {
    title: 'Datový typ',
    body: 'Datový typ hodnot vlastnosti – například text, číslo nebo datum. Vyplňuje se u vlastností.',
  },
  domain: {
    title: 'Definiční obor',
    body: 'Třída, jíž se vlastnost nebo vztah týká (z čeho vztah vychází).',
  },
  range: {
    title: 'Obor hodnot',
    body: 'Třída nebo datový typ, kterých může hodnota vlastnosti či vztahu nabývat.',
  },
  superProperty: {
    title: 'Nadřazená vlastnost',
    body: 'Obecnější vlastnost, jejímž zpřesněním je tato vlastnost.',
  },
  superRelation: {
    title: 'Nadřazený vztah',
    body: 'Obecnější vztah, jehož zpřesněním je tento vztah.',
  },
  codeListDataset: {
    title: 'Číselník',
    body: 'Datová sada číselníku, ze které pojem pochází.',
  },
  inTezaurus: {
    title: 'Zařazení do tezauru',
    body: 'Označuje, zda je pojem součástí tezauru.',
  },
};

export const dictionaryDefaultHint: Hint = {
  title: 'Vytváříte nový slovník.',
  body: 'Klikněte do libovolného pole ve formuláři a zde se zobrazí konkrétní nápověda k jeho vyplnění.',
  recommendation:
    'Začněte názvem a popisem. Tato pole určují, jak bude slovník identifikován a srozumitelný.',
};

export const dictionaryDefaultHintEdit: Hint = {
  title: 'Upravujete slovník.',
  body: 'Klikněte do libovolného pole ve formuláři a zde se zobrazí konkrétní nápověda k jeho vyplnění.',
  recommendation: 'Upravte název nebo popis slovníku podle potřeby.',
};

export const dictionaryFormHints: Record<string, Hint> = {
  namespace: {
    title: 'Jmenný prostor',
    body: 'Základní URI (jmenný prostor) slovníku. Tvoří kořen identifikátorů všech pojmů, které do slovníku patří.',
  },
  nameModel: {
    title: 'Název slovníku',
    body: 'Hlavní název slovníku v daném jazyce (CS povinně, SK a EN volitelně).',
    recommendation: 'Volte výstižný a jednoznačný název.',
  },
  descriptionModel: {
    title: 'Popis slovníku',
    body: 'Stručný popis obsahu a účelu slovníku – čeho se pojmy ve slovníku týkají.',
  },
};

export function resolveHintKey(
  name: string,
  hints: Record<string, Hint>,
): string | null {
  const parts = name.split('.').filter((p) => !/^\d+$/.test(p));
  for (let i = parts.length; i > 0; i--) {
    const key = parts.slice(0, i).join('.');
    if (key in hints) return key;
  }
  return null;
}

export const resolveHintKeyConcept = (name: string): string | null =>
  resolveHintKey(name, conceptFormHints);

export const resolveHintKeyOntology = (name: string): string | null =>
  resolveHintKey(name, dictionaryFormHints);
