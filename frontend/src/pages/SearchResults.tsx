import React, { useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Heading, Spinner, Link as ChakraLink, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
}

const SearchResults: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`/api/search?query=${encodeURIComponent(query)}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Search results data:', data);
        // type, title, descriptionが配列なら先頭要素を使う
        const normalized = data.map((item: any) => ({
          ...item,
          type: Array.isArray(item.type) ? item.type[0] : item.type,
          title: Array.isArray(item.title) ? item.title[0] : item.title,
          description: Array.isArray(item.description) ? item.description[0] : item.description,
        }));
        setResults(normalized);
      })
      .catch((error) => {
        console.error('Search error:', error);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  console.log('Current results state:', results);

  return (
    <Box p={6} mt={8}>
      <Heading size="md" mb={4}>検索結果: "{query}"</Heading>
      {loading ? <Spinner /> : (
        <>
          <Text mb={4} color="gray.600">検索結果数: {results.length}</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>種別</Th>
                <Th>タイトル</Th>
                <Th>説明</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results.map((item, index) => {
                console.log('Rendering item:', item);
                console.log('Item type:', item.type);
                console.log('Item type === "project":', item.type === 'project');
                console.log('Item type === "task":', item.type === 'task');
                
                const typeText = item.type === 'project' ? 'プロジェクト' : item.type === 'task' ? 'タスク' : item.type;
                const linkPath = item.type === 'project' ? `/projects/${item.id}` : item.type === 'task' ? `/tasks/${item.id}` : '#';
                const shouldShowLink = (item.type === 'project' || item.type === 'task') && item.id;
                
                console.log('Should show link:', shouldShowLink);
                console.log('Link path:', linkPath);
                
                return (
                  <Tr key={item.id || index} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Text fontSize="sm" color="gray.600">{typeText}</Text>
                    </Td>
                    <Td>
                      {shouldShowLink ? (
                        <Link 
                          to={linkPath}
                          style={{ 
                            color: '#3182ce', 
                            textDecoration: 'underline',
                            fontWeight: 'medium'
                          }}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <Text>{item.title}</Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.700" noOfLines={2}>
                        {item.description}
                      </Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
      {!loading && results.length === 0 && (
        <Box color="gray.500" textAlign="center" py={8}>
          該当するコンテンツがありません
        </Box>
      )}
    </Box>
  );
};

export default SearchResults; 