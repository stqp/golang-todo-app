import React from 'react';
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
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Flex
        as="header"
        position="fixed"
        w="full"
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        py={4}
        px={8}
        alignItems="center"
        justifyContent="space-between"
        zIndex={1}
      >
        <Flex alignItems="center">
          <Link to="/">
            <Heading size="md">TODO App</Heading>
          </Link>
          <Link to="/projects">
            <Box ml={8} fontWeight="medium">
              Projects
            </Box>
          </Link>
          <Link to="/tasks">
            <Box ml={8} fontWeight="medium">
              Tasks
            </Box>
          </Link>
        </Flex>

        <Flex alignItems="center">
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={4}
          />

          <Menu>
            <MenuButton>
              <Avatar size="sm" name={user?.name} />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Box as="main" pt="72px" px={8} maxW="1200px" mx="auto">
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 