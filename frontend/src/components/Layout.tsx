import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut, FiHome, FiCheckSquare, FiFolder, FiUsers, FiSearch, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (isLoading) return null; // ローディング中は何も描画しない

  const isAdmin = user?.role_name === 'admin';

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/search?query=${encodeURIComponent(value)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      setShowSuggestions(false);
      navigate(`/search-results?query=${encodeURIComponent(search)}`);
    }
  };

  const handleSuggestionClick = (item: any) => {
    setShowSuggestions(false);
    setSearch('');
    if (!item.id) {
      console.warn('Item has no ID:', item);
      return;
    }
    if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    } else {
      navigate(`/tasks/${item.id}`);
    }
  };

  const menuItems = [
    { label: 'ホーム', icon: FiHome, to: '/' },
    { label: 'マイタスク', icon: FiCheckSquare, to: '/tasks' },
    { label: 'プロジェクト', icon: FiFolder, to: '/projects' },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'ユーザー管理', icon: FiUser, to: '/user-management' });
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box
        as="nav"
        w="260px"
        bg="gray.900"
        color="white"
        py={8}
        px={4}
        display={{ base: 'none', md: 'flex' }}
        flexDirection="column"
        justifyContent="space-between"
        boxShadow="md"
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        zIndex={2}
      >
        <Box>
          <Heading size="md" mb={10} letterSpacing="wide" color="white" px={2}>
            TODO App
          </Heading>
          {menuItems.map((item) => (
            <Link to={item.to} key={item.label} style={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                px={3}
                py={3}
                mb={2}
                borderRadius="md"
                _hover={{ bg: 'gray.700' }}
                fontWeight="semibold"
                fontSize="lg"
              >
                <Box as={item.icon} mr={3} fontSize="xl" />
                {item.label}
              </Flex>
            </Link>
          ))}
        </Box>
        <Box>
          <Flex align="center" mb={4} px={3}>
            <Avatar size="sm" name={user?.name} mr={2} />
            <Box>
              <Box fontWeight="bold" fontSize="md">{user?.name}</Box>
              <Box fontSize="xs" color="gray.400">{user?.email}</Box>
            </Box>
          </Flex>
          <Flex align="center" px={3}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              color="white"
              _hover={{ bg: 'gray.700' }}
              mr={2}
            />
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              onClick={logout}
              variant="ghost"
              color="white"
              _hover={{ bg: 'gray.700' }}
            />
          </Flex>
        </Box>
      </Box>
      {/* AppBar */}
      <Box
        as="header"
        position="fixed"
        left={{ base: 0, md: '260px' }}
        top={0}
        right={0}
        height="56px"
        bg="gray.900"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={10}
        px={8}
        borderBottom="1px solid"
        borderColor="gray.800"
      >
        <Flex w="100%" maxW="1200px" align="center" justify="center" mx="auto">
          <Box flex={1} />
          <InputGroup maxW="600px" flex={2} mx="auto" position="relative">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#aaa" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              type="text"
              placeholder="検索"
              bg="gray.600"
              color="white"
              borderRadius="full"
              pl={10}
              _placeholder={{ color: 'gray.400' }}
              border="none"
              boxShadow="sm"
              fontSize="md"
              height="40px"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => search && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && suggestions.length > 0 && (
              <Box position="absolute" top="48px" left={0} right={0} bg="white" color="black" borderRadius="md" boxShadow="lg" zIndex={1000} maxH="300px" overflowY="auto">
                {suggestions.map((item, index) => (
                  <Box key={item.id || index} px={4} py={2} _hover={{ bg: 'gray.100', cursor: 'pointer' }} onMouseDown={() => handleSuggestionClick(item)}>
                    <Box fontWeight="bold">{item.title}</Box>
                    <Box fontSize="sm" color="gray.500">{item.type === 'project' ? 'プロジェクト' : 'タスク'} / {item.description}</Box>
                  </Box>
                ))}
              </Box>
            )}
          </InputGroup>
          <Flex flex={1} justify="flex-end" align="center" gap={2}>
            {/* 右上のアイコン群を削除 */}
          </Flex>
        </Flex>
      </Box>
      {/* Main content */}
      <Box ml={{ base: 0, md: '260px' }} pt="56px" flex="1" bg="gray.50" minH="100vh" p={8}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout; 