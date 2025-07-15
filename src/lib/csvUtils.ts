// CSV processing and text similarity utilities

export interface CSVRow {
  [key: string]: string;
  _fileName?: string; // Track which file this row came from
}

export interface SearchResult {
  row: CSVRow;
  score: number;
  highlightedTitle?: string;
  highlightedDescription?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  missingColumns?: string[];
}

export interface SearchOptions {
  columnWeights?: Record<string, number>;
  searchColumns?: string[];
  fuzzySearch?: boolean;
}

// Text preprocessing utility
// Detect Korean characters (Hangul syllables)
const hasKorean = (str: string): boolean => /[\uac00-\ud7af]/.test(str);

const generateNGrams = (str: string, n: number): string[] => {
  const tokens: string[] = [];
  if (str.length < n) return tokens;
  for (let i = 0; i <= str.length - n; i++) {
    tokens.push(str.slice(i, i + n));
  }
  return tokens;
};

// --- Synonym dictionary for expansion ---
const SYNONYMS: Record<string, string[]> = {
  bug: ['issue', 'error', 'problem', 'defect'],
  issue: ['bug', 'error', 'problem', 'defect'],
  error: ['bug', 'issue', 'problem', 'defect'],
  feature: ['enhancement', 'improvement'],
  open: ['active', 'in progress'],
  closed: ['resolved', 'done', 'complete'],
  // Add more as needed
};

function expandSynonyms(term: string): string[] {
  const lower = term.toLowerCase();
  return [lower, ...(SYNONYMS[lower] || [])];
}

// --- Language detection stub (expand for real use) ---
function detectLanguage(text: string): string {
  // Simple stub: detect Korean, else 'en'
  return /[\uac00-\ud7af]/.test(text) ? 'ko' : 'en';
}

// --- Advanced query parsing (field, boolean) ---
function parseAdvancedQuery(query: string) {
  // Example: status:open AND priority:A
  // Returns: { terms: [{field, value}], operators: ['AND', ...] }
  const tokens = query.split(/\s+(AND|OR|NOT)\s+/i);
  const terms: { field?: string; value: string }[] = [];
  const operators: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      const match = tokens[i].match(/(\w+):(.*)/);
      if (match) {
        terms.push({ field: match[1].toLowerCase(), value: match[2].trim() });
      } else {
        terms.push({ value: tokens[i].trim() });
      }
    } else {
      operators.push(tokens[i].toUpperCase());
    }
  }
  return { terms, operators };
}

// --- Preprocessing with synonym and prefix expansion ---
export const preprocessText = (text: string, expand = true): string[] => {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .trim();
  let tokens: string[] = [];
  if (hasKorean(cleaned)) {
    const compact = cleaned.replace(/\s+/g, '');
    tokens = [
      ...generateNGrams(compact, 2),
      ...generateNGrams(compact, 3),
    ];
  } else {
    tokens = cleaned.split(/\s+/).filter(word => word.length > 2);
  }
  if (expand) {
    // Synonym and prefix expansion
    let expanded: string[] = [];
    tokens.forEach(token => {
      expanded = expanded.concat(expandSynonyms(token));
      // Add prefix (first 3+ chars) for partial match
      if (token.length > 3) expanded.push(token.slice(0, 3));
    });
    return Array.from(new Set(expanded));
  }
  return tokens;
};

// TF-IDF based similarity calculation
export const calculateTFIDF = (documents: string[]): Map<string, Map<string, number>> => {
  const termFreq = new Map<string, Map<string, number>>();
  const docFreq = new Map<string, number>();
  const totalDocs = documents.length;

  // Calculate term frequency for each document
  documents.forEach((doc, docIndex) => {
    const terms = preprocessText(doc);
    const termCount = new Map<string, number>();
    
    terms.forEach(term => {
      termCount.set(term, (termCount.get(term) || 0) + 1);
    });

    // Normalize by document length
    const docLength = terms.length;
    const normalizedTerms = new Map<string, number>();
    termCount.forEach((count, term) => {
      normalizedTerms.set(term, count / docLength);
    });

    termFreq.set(docIndex.toString(), normalizedTerms);

    // Count document frequency
    new Set(terms).forEach(term => {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    });
  });

  // Calculate TF-IDF
  const tfidf = new Map<string, Map<string, number>>();
  termFreq.forEach((termMap, docIndex) => {
    const tfidfMap = new Map<string, number>();
    termMap.forEach((tf, term) => {
      const df = docFreq.get(term) || 1;
      const idf = Math.log(totalDocs / df);
      tfidfMap.set(term, tf * idf);
    });
    tfidf.set(docIndex, tfidfMap);
  });

  return tfidf;
};

// Cosine similarity calculation
export const cosineSimilarity = (
  vectorA: Map<string, number>,
  vectorB: Map<string, number>
): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allTerms = new Set([...vectorA.keys(), ...vectorB.keys()]);

  allTerms.forEach(term => {
    const a = vectorA.get(term) || 0;
    const b = vectorB.get(term) || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// --- Semantic search stub (for future embedding integration) ---
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // Placeholder: integrate with OpenAI, Cohere, or local model
  // Return dummy vectors for now
  return texts.map(() => Array(384).fill(0));
}

function cosineSimArr(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Enhanced searchCSV ---
export const searchCSV = (
  csvData: CSVRow[],
  query: string,
  maxResults: number = 20,
  options: SearchOptions = {}
): SearchResult[] => {
  if (!csvData.length || !query.trim()) return [];
  const { columnWeights = {}, searchColumns = [], fuzzySearch = false, useEmbeddings = false, language = undefined } = options as any;

  // --- Language filtering (optional) ---
  let filteredData = csvData;
  if (language) {
    filteredData = csvData.filter(row => {
      const text = row.title || row.Title || row.description || row.Description || '';
      return detectLanguage(text) === language;
    });
  }

  // --- Advanced query parsing ---
  const { terms, operators } = parseAdvancedQuery(query);

  // --- Document construction with field boosting ---
  const documents = filteredData.map(row => {
    let content = '';
    if (searchColumns.length > 0) {
      searchColumns.forEach(col => {
        const value = row[col] || '';
        const weight = columnWeights[col] || 1;
        content += Array(Math.ceil(weight)).fill(value).join(' ') + ' ';
      });
    } else {
      // Default: title and description
      const title = row.title || row.Title || '';
      const description = row.description || row.Description || '';
      const titleWeight = columnWeights.title || columnWeights.Title || 2;
      const descWeight = columnWeights.description || columnWeights.Description || 1;
      content = Array(Math.ceil(titleWeight)).fill(title).join(' ') + ' ' +
                Array(Math.ceil(descWeight)).fill(description).join(' ');
    }
    return content.trim();
  });

  // --- Semantic search (stub, fallback to TF-IDF) ---
  // if (useEmbeddings) {
  //   // Example: get embeddings for all docs and query, then use cosineSimArr
  //   // Not implemented: requires async/await and external API
  // }

  // --- TF-IDF + Cosine Similarity ---
  documents.push(query);
  const tfidfVectors = calculateTFIDF(documents);
  const queryVector = tfidfVectors.get((documents.length - 1).toString());
  if (!queryVector) return [];

  // --- Boolean/field query logic ---
  const results: SearchResult[] = [];
  for (let i = 0; i < filteredData.length; i++) {
    const docVector = tfidfVectors.get(i.toString());
    if (!docVector) continue;
    let similarity = cosineSimilarity(queryVector, docVector);
    // Fuzzy search bonus
    if (fuzzySearch) {
      const fuzzyBonus = calculateFuzzyMatch(documents[i], query);
      similarity = Math.max(similarity, fuzzyBonus * 0.3);
    }
    // Boolean/field query filtering
    let matches = true;
    let lastOp = 'AND';
    for (let t = 0; t < terms.length; t++) {
      const { field, value } = terms[t];
      let fieldMatch = false;
      if (field) {
        const rowVal = (filteredData[i][field] || '').toLowerCase();
        fieldMatch = rowVal.includes(value.toLowerCase());
      } else {
        // General term: check in title/desc
        const text = (filteredData[i].title || filteredData[i].Title || '') + ' ' + (filteredData[i].description || filteredData[i].Description || '');
        fieldMatch = text.toLowerCase().includes(value.toLowerCase());
      }
      if (t === 0) {
        matches = fieldMatch;
      } else {
        if (operators[t - 1] === 'AND') matches = matches && fieldMatch;
        if (operators[t - 1] === 'OR') matches = matches || fieldMatch;
        if (operators[t - 1] === 'NOT') matches = matches && !fieldMatch;
      }
    }
    if (!matches) continue;
    if (similarity > 0.01) {
      results.push({
        row: filteredData[i],
        score: similarity,
        highlightedTitle: highlightText(filteredData[i].title || filteredData[i].Title || '', query),
        highlightedDescription: highlightText(filteredData[i].description || filteredData[i].Description || '', query)
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
};

// Fuzzy matching for typo tolerance
export const calculateFuzzyMatch = (text: string, query: string): number => {
  const textTerms = preprocessText(text);
  const queryTerms = preprocessText(query);
  
  let matches = 0;
  queryTerms.forEach(queryTerm => {
    textTerms.forEach(textTerm => {
      if (levenshteinDistance(queryTerm, textTerm) <= 2) {
        matches++;
      }
    });
  });
  
  return matches / Math.max(queryTerms.length, 1);
};

// Levenshtein distance for fuzzy matching
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,      // deletion
        matrix[j - 1][i] + 1,      // insertion
        matrix[j - 1][i - 1] + indicator  // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Text highlighting utility
export const highlightText = (text: string, query: string): string => {
  if (!text || !query) return text;

  const queryTerms = preprocessText(query);
  let highlightedText = text;

  queryTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<mark class="bg-accent/30 px-1 rounded">$&</mark>`);
  });

  return highlightedText;
};

// Enhanced CSV validation utility
export const validateCSV = (data: CSVRow[], fileName?: string): ValidationResult => {
  if (!data || data.length === 0) {
    return { 
      isValid: false, 
      error: `CSV file ${fileName ? `"${fileName}" ` : ''}is empty or invalid` 
    };
  }

  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  const hasTitle = 'title' in firstRow || 'Title' in firstRow;
  const hasDescription = 'description' in firstRow || 'Description' in firstRow;
  
  const missingColumns: string[] = [];
  const requiredColumns = ['title', 'description'];
  
  requiredColumns.forEach(col => {
    const hasColumn = col in firstRow || col.charAt(0).toUpperCase() + col.slice(1) in firstRow;
    if (!hasColumn) {
      missingColumns.push(col);
    }
  });

  if (!hasTitle && !hasDescription) {
    return { 
      isValid: false, 
      error: `CSV file ${fileName ? `"${fileName}" ` : ''}must contain at least a "title" or "description" column`,
      missingColumns
    };
  }

  return { isValid: true };
};

// Combine multiple CSV datasets
export const combineCSVData = (datasets: { data: CSVRow[]; fileName: string }[]): CSVRow[] => {
  const combined: CSVRow[] = [];
  
  datasets.forEach(({ data, fileName }) => {
    data.forEach(row => {
      combined.push({ ...row, _fileName: fileName });
    });
  });
  
  return combined;
};

// Get all available columns from dataset
export const getAvailableColumns = (data: CSVRow[]): string[] => {
  if (data.length === 0) return [];
  
  const allColumns = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== '_fileName') {
        allColumns.add(key);
      }
    });
  });
  
  return Array.from(allColumns).sort();
};

// Boolean search parser
export const parseBooleanQuery = (query: string): { terms: string[]; operators: string[] } => {
  const tokens = query.split(/\s+(AND|OR|NOT)\s+/i);
  const terms: string[] = [];
  const operators: string[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      terms.push(tokens[i].replace(/['"]/g, '').trim());
    } else {
      operators.push(tokens[i].toUpperCase());
    }
  }
  
  return { terms, operators };
};