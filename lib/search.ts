const conceptGroups = [
  ['rag', 'retrieval augmented generation', 'grounding', 'question answering', 'citations'],
  ['semantic retrieval', 'search', 'embeddings', 'embedding', 'similarity', 'ranking', 'reranking'],
  ['scanned', 'scan', 'ocr', 'arabic document', 'pdf'],
  ['cdc', 'change data capture', 'streaming', 'kafka', 'debezium', 'snapshot'],
  ['kubernetes', 'k8s', 'rancher', 'deployment', 'orchestration'],
  ['api', 'backend', 'fastapi', 'microservices', 'services'],
  ['nlp', 'arabic', 'language', 'entity extraction', 'named entity recognition', 'relation extraction'],
];
const stopWords = new Set('a an the to and or is for in what which where when was did does do how about of with his he has have you i use worked build built work experience project projects demonstrate skills show'.split(' '));

function normalize(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function rankDocuments<T>(query: string, entries: readonly T[], content: (item: T) => string) {
  const normalized = normalize(query);
  const tokens = [...new Set(normalized.split(' ').filter(word => word.length > 1 && !stopWords.has(word)))];
  const synonyms = new Set(conceptGroups.filter(group => group.some(term => (' ' + normalized + ' ').includes(' ' + term + ' '))).flat());
  if (!tokens.length) return [];
  return entries.map(item => {
    const text = ' ' + normalize(content(item)) + ' ';
    const direct = tokens.filter(token => text.includes(' ' + token + ' ')).length;
    const related = [...synonyms].filter(term => text.includes(' ' + term + ' ')).length;
    return { item, score: direct * 6 + (direct && tokens.length > 1 && text.includes(' ' + normalized + ' ') ? 8 : 0) + Math.min(related, 4) };
  }).filter(entry => entry.score > 0).sort((left, right) => right.score - left.score);
}
