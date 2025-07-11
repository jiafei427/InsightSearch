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
export const preprocessText = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
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

// Enhanced search function with column weights and fuzzy search
export const searchCSV = (
  csvData: CSVRow[],
  query: string,
  maxResults: number = 20,
  options: SearchOptions = {}
): SearchResult[] => {
  if (!csvData.length || !query.trim()) return [];

  const { columnWeights = {}, searchColumns = [], fuzzySearch = false } = options;

  // Build documents with weighted content
  const documents = csvData.map(row => {
    let content = '';
    
    if (searchColumns.length > 0) {
      // Search only specified columns
      searchColumns.forEach(col => {
        const value = row[col] || '';
        const weight = columnWeights[col] || 1;
        // Repeat content based on weight for TF-IDF
        content += Array(Math.ceil(weight)).fill(value).join(' ') + ' ';
      });
    } else {
      // Search all relevant columns with weights
      const title = row.title || row.Title || '';
      const description = row.description || row.Description || '';
      const titleWeight = columnWeights.title || columnWeights.Title || 2;
      const descWeight = columnWeights.description || columnWeights.Description || 1;
      
      content = Array(Math.ceil(titleWeight)).fill(title).join(' ') + ' ' +
                Array(Math.ceil(descWeight)).fill(description).join(' ');
    }
    
    return content.trim();
  });

  // Add query as last document for comparison
  documents.push(query);

  // Calculate TF-IDF vectors
  const tfidfVectors = calculateTFIDF(documents);
  const queryVector = tfidfVectors.get((documents.length - 1).toString());

  if (!queryVector) return [];

  // Calculate similarities
  const results: SearchResult[] = [];
  
  for (let i = 0; i < csvData.length; i++) {
    const docVector = tfidfVectors.get(i.toString());
    if (!docVector) continue;

    let similarity = cosineSimilarity(queryVector, docVector);
    
    // Apply fuzzy search bonus
    if (fuzzySearch) {
      const fuzzyBonus = calculateFuzzyMatch(documents[i], query);
      similarity = Math.max(similarity, fuzzyBonus * 0.3);
    }
    
    if (similarity > 0.01) { // Minimum threshold
      results.push({
        row: csvData[i],
        score: similarity,
        highlightedTitle: highlightText(csvData[i].title || csvData[i].Title || '', query),
        highlightedDescription: highlightText(csvData[i].description || csvData[i].Description || '', query)
      });
    }
  }

  // Sort by similarity score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
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