export type Language = 'en' | 'ko';

export const translations = {
  en: {
    // Header
    appName: 'InsightSearch',
    appDescription: 'Upload your CSV files and search through your data using advanced text similarity algorithms. Find exactly what you\'re looking for with intelligent matching.',
    
    // Features
    csvUpload: 'CSV Upload',
    smartSearch: 'Smart Search', 
    realTimeResults: 'Real-time Results',
    
    // File Upload
    uploadCSVFile: 'Upload CSV Files',
    dropFiles: 'Drop your CSV files here',
    orClickToBrowse: 'or click to browse files',
    chooseFiles: 'Choose Files',
    fileUploadedSuccessfully: 'Files uploaded successfully!',
    
    // File Info
    fileLoadedSuccessfully: 'Files loaded successfully',
    rows: 'rows',
    columns: 'columns',
    files: 'files',
    more: 'more',
    
    // Search
    searchYourData: 'Search Your Data',
    searchPlaceholder: 'Search for tasks, projects, or any content...',
    search: 'Search',
    searching: 'Searching...',
    pleaseUploadFirst: 'Please upload CSV files first to start searching',
    
    // Results
    searchResults: 'Search Results',
    found: 'Found',
    result: 'result',
    results: 'results',
    page: 'Page',
    of: 'of',
    noResultsFound: 'No results found',
    noResultsDescription: 'Try adjusting your search terms or upload different CSV files.',
    
    // Views
    cards: 'Cards',
    table: 'Table',
    match: 'match',
    rank: 'Rank',
    title: 'Title',
    description: 'Description',
    priority: 'Priority',
    status: 'Status',
    previous: 'Previous',
    next: 'Next',
    
    // Features Info
    easyUpload: 'Easy Upload',
    easyUploadDesc: 'Drag and drop or click to upload multiple CSV files. Supports any CSV with title and description columns.',
    smartSearchDesc: 'Advanced TF-IDF and cosine similarity algorithms find the most relevant matches across all your data.',
    richResults: 'Rich Results',
    richResultsDesc: 'View results in cards or table format with highlighting, similarity scores, and pagination.',
    
    // Validation
    pleaseUploadValidCSV: 'Please upload valid CSV files',
    invalidCSVFile: 'Invalid CSV file',
    missingRequiredColumns: 'Missing required columns',
    csvMustContain: '• CSV files must contain at least a "title" or "description" column',
    supportedColumns: '• Supported columns: title, description, priority, status, assignee, created date, etc.',
    
    // Filters
    filterByColumn: 'Filter by Column',
    allColumns: 'All Columns',
    columnRelevance: 'Column Relevance',
    setRelevance: 'Set search relevance weights for columns',
    
    // Theme
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Dashboard
    dataInsights: 'Data Insights',
    priorityDistribution: 'Priority Distribution',
    statusDistribution: 'Status Distribution',
    totalEntries: 'Total Entries',
    
    // Tags
    autoTags: 'Auto Tags',
    generatedTags: 'Generated Tags'
  },
  ko: {
    // Header
    appName: '인사이트서치',
    appDescription: 'CSV 파일을 업로드하고 고급 텍스트 유사성 알고리즘을 사용하여 데이터를 검색하세요. 지능적인 매칭으로 원하는 것을 정확히 찾아보세요.',
    
    // Features
    csvUpload: 'CSV 업로드',
    smartSearch: '스마트 검색',
    realTimeResults: '실시간 결과',
    
    // File Upload
    uploadCSVFile: 'CSV 파일 업로드',
    dropFiles: 'CSV 파일을 여기에 드롭하세요',
    orClickToBrowse: '또는 클릭하여 파일 찾아보기',
    chooseFiles: '파일 선택',
    fileUploadedSuccessfully: '파일이 성공적으로 업로드되었습니다!',
    
    // File Info
    fileLoadedSuccessfully: '파일이 성공적으로 로드되었습니다',
    rows: '행',
    columns: '열',
    files: '파일',
    more: '개 더',
    
    // Search
    searchYourData: '데이터 검색',
    searchPlaceholder: '작업, 프로젝트 또는 모든 콘텐츠를 검색하세요...',
    search: '검색',
    searching: '검색 중...',
    pleaseUploadFirst: '검색을 시작하려면 먼저 CSV 파일을 업로드하세요',
    
    // Results
    searchResults: '검색 결과',
    found: '발견됨',
    result: '개 결과',
    results: '개 결과',
    page: '페이지',
    of: '/',
    noResultsFound: '결과를 찾을 수 없습니다',
    noResultsDescription: '검색어를 조정하거나 다른 CSV 파일을 업로드해보세요.',
    
    // Views
    cards: '카드',
    table: '테이블',
    match: '일치',
    rank: '순위',
    title: '제목',
    description: '설명',
    priority: '우선순위',
    status: '상태',
    previous: '이전',
    next: '다음',
    
    // Features Info
    easyUpload: '간편한 업로드',
    easyUploadDesc: '여러 CSV 파일을 드래그 앤 드롭하거나 클릭하여 업로드하세요. 제목과 설명 열이 있는 모든 CSV를 지원합니다.',
    smartSearchDesc: '고급 TF-IDF 및 코사인 유사성 알고리즘이 모든 데이터에서 가장 관련성 높은 일치 항목을 찾습니다.',
    richResults: '풍부한 결과',
    richResultsDesc: '강조 표시, 유사성 점수 및 페이지네이션이 포함된 카드 또는 테이블 형식으로 결과를 확인하세요.',
    
    // Validation
    pleaseUploadValidCSV: '유효한 CSV 파일을 업로드하세요',
    invalidCSVFile: '유효하지 않은 CSV 파일',
    missingRequiredColumns: '필수 열이 누락됨',
    csvMustContain: '• CSV 파일에는 최소한 "title" 또는 "description" 열이 포함되어야 합니다',
    supportedColumns: '• 지원되는 열: title, description, priority, status, assignee, created date 등',
    
    // Filters
    filterByColumn: '열별 필터',
    allColumns: '모든 열',
    columnRelevance: '열 관련성',
    setRelevance: '열에 대한 검색 관련성 가중치 설정',
    
    // Theme
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    
    // Dashboard
    dataInsights: '데이터 인사이트',
    priorityDistribution: '우선순위 분포',
    statusDistribution: '상태 분포',
    totalEntries: '총 항목',
    
    // Tags
    autoTags: '자동 태그',
    generatedTags: '생성된 태그'
  }
};

export const t = (key: string, language: Language): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};