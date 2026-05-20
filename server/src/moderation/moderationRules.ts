export type ModerationCategory =
  | 'none'
  | 'self_harm_suicide'
  | 'drug_or_substance'
  | 'dangerous_medical_advice'
  | 'disguised_promotion'
  | 'sexual_content'
  | 'personal_sensitive_data'
  | 'spam_or_low_quality'
  | 'harassment_or_abuse';

export type ModerationReason = {
  code: string;
  category: ModerationCategory;
  message: string;
  weight: number;
};

export type RuleMatch = ModerationReason & {
  directShadowBan?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
};

type Rule = {
  code: string;
  category: ModerationCategory;
  message: string;
  weight: number;
  patterns?: RegExp[];
  test?: (text: string, original: string) => boolean;
  directShadowBan?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
};

const linkPattern = /https?:\/\/|www\.|(?:^|\s)[a-z0-9-]+\.(?:com|fr|net|org|io|co)(?:\/|\s|$)/gi;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phonePattern = /(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}\b/;
const addressPattern =
  /\b\d{1,4}\s+(?:rue|avenue|av\.?|boulevard|bd|impasse|chemin|allee|place)\s+[a-z0-9' -]{3,}\b/i;

const countMatches = (value: string, pattern: RegExp) => {
  const matches = value.match(pattern);
  return matches ? matches.length : 0;
};

const hasRepeatedSequence = (text: string) => {
  const words = text.split(/\s+/).filter((word) => word.length > 2);
  if (words.length < 8) return false;
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  return [...counts.values()].some((count) => count >= 5);
};

const uppercaseRatio = (original: string) => {
  const letters = original.replace(/[^\p{L}]/gu, '');
  if (letters.length < 20) return 0;
  const upper = [...letters].filter((letter) => letter !== letter.toLocaleLowerCase('fr-FR') && letter === letter.toLocaleUpperCase('fr-FR')).join('');
  return upper.length / letters.length;
};

const emojiCount = (original: string) => countMatches(original, /\p{Extended_Pictographic}/gu);

export const normalizeModerationText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[!?;:()[\]{}"“”«»]+/g, ' ')
    .replace(/([.,]){2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const professionalCarePattern =
  /\b(parle[rz]?|demande[rz]?|consulte[rz]?|avis|appelle[rz]?|prescrit|prescrite|ordonnance|traitement)\b.{0,50}\b(medecin|oncologue|equipe medicale|professionnel de sante|soignant|psy|psychologue|infirmier|urgences|15|112|pharmacien)\b|\b(medecin|oncologue|equipe medicale|professionnel de sante|soignant|psy|psychologue|infirmier|pharmacien)\b.{0,50}\b(prescrit|prescrite|ordonnance|traitement|dose)\b/;

const medicalSubstanceContextPattern =
  /\b(morphine|tramadol|oxycodone|opioide|cannabis therapeutique|cbd|cortisone|benzodiazepine|anxiolytique|antidouleur|anti douleur)\b.{0,60}\b(prescrit|prescrite|ordonnance|medecin|oncologue|douleur|traitement|effets secondaires|soins palliatifs|dose prescrite)\b|\b(prescrit|prescrite|ordonnance|medecin|oncologue|douleur|traitement|effets secondaires|soins palliatifs|dose prescrite)\b.{0,60}\b(morphine|tramadol|oxycodone|opioide|cannabis therapeutique|cbd|cortisone|benzodiazepine|anxiolytique|antidouleur|anti douleur)\b/;

export const hasMedicalSubstanceContext = (text: string) => medicalSubstanceContextPattern.test(text);

export const moderationRules: Rule[] = [
  {
    code: 'SELF_HARM_METHOD_OR_ENCOURAGEMENT',
    category: 'self_harm_suicide',
    message: 'Le contenu semble demander, detailler ou encourager une methode de mise en danger.',
    weight: 100,
    directShadowBan: true,
    priority: 'urgent',
    patterns: [
      /\b(comment|methode|plan|dose|quantite|facile|rapide)\b.{0,35}\b(se suicider|suicide|mourir|mettre fin a mes jours|mettre fin a ses jours)\b/,
      /\b(encourage|vas y|fais le|passe a l'acte)\b.{0,35}\b(suicide|mourir|te tuer|se tuer)\b/,
      /\b(se pendre|pendre|overdose|surdose|arme|poison)\b.{0,30}\b(pour mourir|pour se tuer|pour me tuer|suicide)\b/
    ]
  },
  {
    code: 'SELF_HARM_IMMEDIATE_RISK',
    category: 'self_harm_suicide',
    message: 'Le contenu exprime une mise en danger personnelle immediate.',
    weight: 75,
    priority: 'urgent',
    patterns: [
      /\b(ce soir|maintenant|aujourd'hui|tout de suite|dans quelques heures)\b.{0,40}\b(me suicider|me tuer|mourir|mettre fin a mes jours)\b/,
      /\b(j'ai un plan|j'ai prepare|je vais passer a l'acte)\b/
    ]
  },
  {
    code: 'SELF_HARM_DISTRESS',
    category: 'self_harm_suicide',
    message: 'Le contenu exprime une detresse personnelle importante liee au suicide ou a l automutilation.',
    weight: 45,
    priority: 'high',
    patterns: [
      /\b(je veux mourir|envie de mourir|plus envie de vivre|me suicider|me tuer|mettre fin a mes jours|automutilation|me faire du mal)\b/
    ]
  },
  {
    code: 'STOP_MEDICAL_TREATMENT',
    category: 'dangerous_medical_advice',
    message: 'Le contenu recommande d arreter ou d eviter un traitement medical.',
    weight: 90,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(arrete|stoppe|evite|refuse|laisse tomber|abandonne)\b.{0,35}\b(chimio|chimiotherapie|radiotherapie|immunotherapie|traitement|medicament|oncologue|medecin)\b/,
      /\b(pas besoin|inutile)\b.{0,30}\b(medecin|oncologue|traitement|chimio|chimiotherapie|radiotherapie)\b/
    ]
  },
  {
    code: 'SUBSTITUTE_TREATMENT',
    category: 'dangerous_medical_advice',
    message: 'Le contenu presente une alternative comme substitut a un traitement medical.',
    weight: 85,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(remplace|remplacer|a la place de|plutot que)\b.{0,45}\b(chimio|chimiotherapie|radiotherapie|traitement|medicament)\b/,
      /\b(chimio|chimiotherapie|radiotherapie|traitement)\b.{0,45}\b(remplace|remplacer|a la place)\b/
    ]
  },
  {
    code: 'MIRACLE_CURE_CLAIM',
    category: 'dangerous_medical_advice',
    message: 'Le contenu promet une guerison ou un resultat medical garanti.',
    weight: 70,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(guerit|soigne|elimine|vainc)\b.{0,25}\b(cancer|tumeur|metastase)\b/,
      /\b(cure miracle|remede miracle|100 ?% garanti|garanti a 100|guerison garantie|produit miracle)\b/
    ]
  },
  {
    code: 'UNVERIFIED_MEDICAL_CERTAINTY',
    category: 'dangerous_medical_advice',
    message: 'Le contenu formule une affirmation medicale non verifiee avec un niveau de certitude eleve.',
    weight: 35,
    priority: 'medium',
    patterns: [
      /\b(detox|jeune|regime alcalin|bicarbonate|huile essentielle|complement naturel|plante)\b.{0,35}\b(guerit|soigne|elimine|anti cancer|anticancer)\b/
    ]
  },
  {
    code: 'DANGEROUS_SUBSTANCE_SALE',
    category: 'drug_or_substance',
    message: 'Le contenu semble promouvoir ou vendre une substance dangereuse ou non encadree.',
    weight: 90,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(vends?|vente|acheter|commande|livraison|stock|prix)\b.{0,40}\b(cocaine|heroine|mdma|ecstasy|ketamine|lsd|crack|meth|amphetamine|weed|cannabis recreatif|drogue)\b/,
      /\b(cocaine|heroine|mdma|ecstasy|ketamine|lsd|crack|meth|amphetamine|weed|cannabis recreatif|drogue)\b.{0,40}\b(vends?|vente|acheter|commande|livraison|stock|prix)\b/
    ]
  },
  {
    code: 'DANGEROUS_SUBSTANCE_DOSING',
    category: 'drug_or_substance',
    message: 'Le contenu donne des conseils dangereux de dosage, melange ou contournement medical.',
    weight: 80,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(double|triple|augmente|melange|combine|prends plus|dose forte)\b.{0,45}\b(morphine|tramadol|oxycodone|opioide|benzodiazepine|alcool|somnifere|anxiolytique)\b/,
      /\b(morphine|tramadol|oxycodone|opioide|benzodiazepine|somnifere|anxiolytique)\b.{0,45}\b(avec alcool|sans ordonnance|pour planer|dose forte|effet recreatif)\b/
    ]
  },
  {
    code: 'RECREATIONAL_DRUG_ENCOURAGEMENT',
    category: 'drug_or_substance',
    message: 'Le contenu encourage une consommation recreative de substances.',
    weight: 45,
    priority: 'medium',
    patterns: [
      /\b(pour planer|defonce|se defoncer|trip|shoot|sniffer)\b/,
      /\b(cannabis|weed|mdma|ecstasy|ketamine|lsd|cocaine)\b.{0,40}\b(ca aide|essaie|prends en|meilleur que les medocs)\b/
    ]
  },
  {
    code: 'PROMOTIONAL_CONTACT_CHANNEL',
    category: 'disguised_promotion',
    message: 'Le contenu pousse vers un contact prive ou un canal commercial externe.',
    weight: 45,
    priority: 'medium',
    patterns: [
      /\b(contacte[sz]?[- ]?moi|ecris[- ]?moi|dm|mp|message prive)\b.{0,35}\b(whatsapp|telegram|signal|numero|formation|coaching|produit)\b/,
      /\b(whatsapp|telegram)\b.{0,40}\b(commande|acheter|prix|promo|produit|stock)\b/
    ]
  },
  {
    code: 'AFFILIATE_OR_PROMO_CODE',
    category: 'disguised_promotion',
    message: 'Le contenu contient des signaux de code promo, affiliation ou vente.',
    weight: 45,
    priority: 'medium',
    patterns: [
      /\b(code promo|promo code|affiliation|lien affilie|partenaire|sponsorise|reduction|-\d{2}%|coach sante|formation sante)\b/
    ]
  },
  {
    code: 'MIRACLE_PRODUCT_SALES',
    category: 'disguised_promotion',
    message: 'Le contenu associe une promesse de produit a une intention commerciale.',
    weight: 70,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(produit|complement|formation|coaching|pack|programme)\b.{0,40}\b(guerit|cure miracle|100 ?% garanti|anti cancer|anticancer)\b/
    ]
  },
  {
    code: 'AGGRESSIVE_HEALTH_MARKETING',
    category: 'disguised_promotion',
    message: 'Le contenu associe marketing agressif et promesse pseudo-sante.',
    weight: 60,
    priority: 'high',
    patterns: [
      /\b(offre limitee|places limitees|commande maintenant|resultats garantis|temoignage exclusif)\b.{0,60}\b(cancer|chimio|tumeur|complement|detox|programme)\b/,
      /\b(complement|gelule|huile|programme|coaching)\b.{0,60}\b(promo|reduction|code|pack|acheter|commande)\b/
    ]
  },
  {
    code: 'TOO_MANY_LINKS',
    category: 'spam_or_low_quality',
    message: 'Le contenu contient un nombre anormal de liens.',
    weight: 55,
    priority: 'medium',
    test: (_text, original) => countMatches(original, linkPattern) >= 4
  },
  {
    code: 'SHORT_TEXT_WITH_LINK',
    category: 'spam_or_low_quality',
    message: 'Le contenu est tres court et principalement oriente vers un lien.',
    weight: 45,
    priority: 'medium',
    test: (text, original) => text.length < 90 && countMatches(original, linkPattern) >= 1
  },
  {
    code: 'REPEATED_TEXT',
    category: 'spam_or_low_quality',
    message: 'Le contenu contient une repetition excessive.',
    weight: 35,
    priority: 'medium',
    test: (text) => hasRepeatedSequence(text)
  },
  {
    code: 'EXCESSIVE_CAPS',
    category: 'spam_or_low_quality',
    message: 'Le contenu utilise des majuscules de maniere excessive.',
    weight: 25,
    priority: 'low',
    test: (_text, original) => uppercaseRatio(original) > 0.72
  },
  {
    code: 'EXCESSIVE_EMOJIS',
    category: 'spam_or_low_quality',
    message: 'Le contenu contient une quantite excessive d emojis.',
    weight: 25,
    priority: 'low',
    test: (_text, original) => emojiCount(original) >= 12
  },
  {
    code: 'GENERIC_OFF_TOPIC_SPAM',
    category: 'spam_or_low_quality',
    message: 'Le contenu ressemble a un message generique ou hors sujet.',
    weight: 30,
    priority: 'low',
    patterns: [/\b(clique ici|gagne de l'argent|revenu passif|crypto|casino|pret rapide|followers)\b/]
  },
  {
    code: 'PERSONAL_EMAIL_OR_PHONE',
    category: 'personal_sensitive_data',
    message: 'Le contenu semble publier une adresse email ou un numero de telephone.',
    weight: 45,
    priority: 'medium',
    test: (_text, original) => emailPattern.test(original) || phonePattern.test(original)
  },
  {
    code: 'PERSONAL_ADDRESS',
    category: 'personal_sensitive_data',
    message: 'Le contenu semble publier une adresse personnelle.',
    weight: 45,
    priority: 'medium',
    patterns: [addressPattern]
  },
  {
    code: 'PRIVATE_MEDICAL_IDENTIFIER',
    category: 'personal_sensitive_data',
    message: 'Le contenu invite a partager des informations medicales tres identifiantes.',
    weight: 45,
    priority: 'medium',
    patterns: [
      /\b(envoie|partage|donne|publie)\b.{0,45}\b(numero de securite sociale|carte vitale|compte rendu complet|dossier medical|adresse|telephone|mail|email)\b/
    ]
  },
  {
    code: 'ABUSIVE_INSULT',
    category: 'harassment_or_abuse',
    message: 'Le contenu contient des insultes ou une agressivite ciblee.',
    weight: 55,
    priority: 'medium',
    patterns: [/\b(imbecile|idiot|debile|abruti|ta gueule|ferme ta gueule|minable|nul)\b/]
  },
  {
    code: 'HATE_OR_DISCRIMINATION',
    category: 'harassment_or_abuse',
    message: 'Le contenu contient une attaque discriminatoire ou haineuse.',
    weight: 75,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(haine|degage|on devrait exclure|interdire)\b.{0,45}\b(juifs|musulmans|arabes|noirs|handicapes|homosexuels|trans|etrangers)\b/,
      /\b(sale|espece de)\b.{0,20}\b(juif|musulman|arabe|noir|handicape|homo|trans|etranger)\b/
    ]
  },
  {
    code: 'THREAT_OR_VIOLENCE',
    category: 'harassment_or_abuse',
    message: 'Le contenu contient une menace ou un appel a la violence.',
    weight: 85,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(je vais|on va|tu vas)\b.{0,30}\b(te frapper|te tuer|te casser|te detruire)\b/,
      /\b(faut|il faut|on devrait)\b.{0,30}\b(frapp(er|e)|tuer|eliminer|tabasser)\b/
    ]
  },
  {
    code: 'PATIENT_BLAME_OR_HUMILIATION',
    category: 'harassment_or_abuse',
    message: 'Le contenu culpabilise ou humilie une personne malade ou proche aidante.',
    weight: 65,
    priority: 'high',
    patterns: [
      /\b(c'est ta faute|tu l'as cherche|tu merites|bien fait pour toi|arrete de te plaindre|faible|lache)\b/,
      /\b(les patients comme toi|les malades comme toi)\b.{0,40}\b(meritent|sont|devraient)\b/
    ]
  },
  {
    code: 'SEXUAL_HARASSMENT',
    category: 'sexual_content',
    message: 'Le contenu contient des propos sexuels deplaces ou du harcelement sexuel.',
    weight: 80,
    directShadowBan: true,
    priority: 'high',
    patterns: [
      /\b(envoie|montre|je veux voir)\b.{0,35}\b(nu|nue|nudes|seins|parties intimes|photos sexy)\b/,
      /\b(tu es bonne|t'es bonne|sexy|excitant[e]?)\b.{0,35}\b(patient|patiente|malade|ici|mp|dm)\b/
    ]
  },
  {
    code: 'EXPLICIT_SEXUAL_CONTENT',
    category: 'sexual_content',
    message: 'Le contenu contient des propos sexuels explicites hors contexte de sante.',
    weight: 60,
    priority: 'medium',
    patterns: [
      /\b(porno|pornographie|plan cul|sexe explicite|masturbation)\b.{0,45}\b(contacte|mp|dm|photo|video|rencontre)\b/
    ]
  }
];

export const hasProfessionalCareContext = (text: string) => professionalCarePattern.test(text);
