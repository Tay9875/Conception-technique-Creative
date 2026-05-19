export type ModerationCategory =
  | 'none'
  | 'self_harm_suicide'
  | 'dangerous_medical_advice'
  | 'disguised_promotion'
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
    .replace(/\s+/g, ' ')
    .trim();

const professionalCarePattern =
  /\b(parle[rz]?|demande[rz]?|consulte[rz]?|avis|appelle[rz]?)\b.{0,40}\b(medecin|oncologue|equipe medicale|professionnel de sante|soignant|psy|psychologue|infirmier|urgences|15|112)\b/;

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
    code: 'TOO_MANY_LINKS',
    category: 'spam_or_low_quality',
    message: 'Le contenu contient un nombre anormal de liens.',
    weight: 55,
    priority: 'medium',
    test: (text) => countMatches(text, linkPattern) >= 4
  },
  {
    code: 'SHORT_TEXT_WITH_LINK',
    category: 'spam_or_low_quality',
    message: 'Le contenu est tres court et principalement oriente vers un lien.',
    weight: 45,
    priority: 'medium',
    test: (text) => text.length < 90 && countMatches(text, linkPattern) >= 1
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
    code: 'ABUSIVE_INSULT',
    category: 'harassment_or_abuse',
    message: 'Le contenu contient des insultes ou une agressivite ciblee.',
    weight: 55,
    priority: 'medium',
    patterns: [/\b(imbecile|idiot|debile|abruti|ta gueule|ferme ta gueule|minable|nul)\b/]
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
  }
];

export const hasProfessionalCareContext = (text: string) => professionalCarePattern.test(text);
