// CSV processing and text similarity utilities

export interface CSVRow {
  [key: string]: string;
}

export interface SearchResult {
  row: CSVRow;
  score: number;
  highlightedTitle?: string;
  highlightedDescription?: string;
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

// Main search function
export const searchCSV = (
  csvData: CSVRow[],
  query: string,
  maxResults: number = 10
): SearchResult[] => {
  if (!csvData.length || !query.trim()) return [];

  // Combine title and description for search
  const documents = csvData.map(row => {
    const title = row.title || row.Title || '';
    const description = row.description || row.Description || '';
    return `${title} ${description}`;
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

    const similarity = cosineSimilarity(queryVector, docVector);
    
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

// CSV validation utility
export const validateCSV = (data: CSVRow[]): { isValid: boolean; error?: string } => {
  if (!data || data.length === 0) {
    return { isValid: false, error: 'CSV file is empty or invalid' };
  }

  const firstRow = data[0];
  const hasTitle = 'title' in firstRow || 'Title' in firstRow;
  const hasDescription = 'description' in firstRow || 'Description' in firstRow;

  if (!hasTitle && !hasDescription) {
    return { 
      isValid: false, 
      error: 'CSV must contain at least a "title" or "description" column' 
    };
  }

  return { isValid: true };
};