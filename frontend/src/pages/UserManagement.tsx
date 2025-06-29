import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  IconButton,
  HStack,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role_name: string;
  timezone: string;
  language: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role_id: number;
  timezone: string;
  language: string;
}

interface UpdateUserRequest {
  id: string;
  name: string;
  email: string;
  role_id: number;
  timezone: string;
  language: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    role_id: 2, // Default to user role
    timezone: 'UTC',
    language: 'en',
  });
  const [updateForm, setUpdateForm] = useState<UpdateUserRequest>({
    id: '',
    name: '',
    email: '',
    role_id: 2,
    timezone: 'UTC',
    language: 'en',
  });

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const toast = useToast();

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          title: 'エラー',
          description: 'ユーザー一覧の取得に失敗しました',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ユーザー一覧の取得に失敗しました',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/users/roles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast({
          title: '成功',
          description: 'ユーザーを作成しました',
          status: 'success',
        });
        onCreateClose();
        setCreateForm({
          name: '',
          email: '',
          password: '',
          role_id: 2,
          timezone: 'UTC',
          language: 'en',
        });
        fetchUsers();
      } else {
        toast({
          title: 'エラー',
          description: 'ユーザーの作成に失敗しました',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ユーザーの作成に失敗しました',
        status: 'error',
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`/api/users/${updateForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });

      if (response.ok) {
        toast({
          title: '成功',
          description: 'ユーザーを更新しました',
          status: 'success',
        });
        onUpdateClose();
        setEditingUser(null);
        fetchUsers();
      } else {
        toast({
          title: 'エラー',
          description: 'ユーザーの更新に失敗しました',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ユーザーの更新に失敗しました',
        status: 'error',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('このユーザーを削除しますか？')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: '成功',
          description: 'ユーザーを削除しました',
          status: 'success',
        });
        fetchUsers();
      } else {
        toast({
          title: 'エラー',
          description: 'ユーザーの削除に失敗しました',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ユーザーの削除に失敗しました',
        status: 'error',
      });
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUpdateForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: roles.find(r => r.name === user.role_name)?.id || 2,
      timezone: user.timezone,
      language: user.language,
    });
    onUpdateOpen();
  };

  return (
    <Box p={6} mt={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">ユーザー管理</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen}>
          新規ユーザー作成
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>名前</Th>
            <Th>メールアドレス</Th>
            <Th>権限</Th>
            <Th>タイムゾーン</Th>
            <Th>言語</Th>
            <Th>作成日</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge colorScheme={user.role_name === 'admin' ? 'red' : 'green'}>
                  {user.role_name === 'admin' ? '管理者' : '一般'}
                </Badge>
              </Td>
              <Td>{user.timezone}</Td>
              <Td>{user.language}</Td>
              <Td>{new Date(user.created_at).toLocaleDateString('ja-JP')}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="編集"
                    icon={<FiEdit />}
                    size="sm"
                    onClick={() => openEditModal(user)}
                  />
                  <IconButton
                    aria-label="削除"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteUser(user.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* 新規ユーザー作成モーダル */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新規ユーザー作成</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>名前</FormLabel>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>メールアドレス</FormLabel>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>パスワード</FormLabel>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>権限</FormLabel>
              <Select
                value={createForm.role_id}
                onChange={(e) => setCreateForm({ ...createForm, role_id: parseInt(e.target.value) })}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name === 'admin' ? '管理者' : '一般'}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>タイムゾーン</FormLabel>
              <Input
                value={createForm.timezone}
                onChange={(e) => setCreateForm({ ...createForm, timezone: e.target.value })}
              />
            </FormControl>
            <FormControl mb={6}>
              <FormLabel>言語</FormLabel>
              <Input
                value={createForm.language}
                onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
              />
            </FormControl>
            <HStack justify="flex-end">
              <Button onClick={onCreateClose}>キャンセル</Button>
              <Button colorScheme="blue" onClick={handleCreateUser}>
                作成
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ユーザー編集モーダル */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ユーザー編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>名前</FormLabel>
              <Input
                value={updateForm.name}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>メールアドレス</FormLabel>
              <Input
                type="email"
                value={updateForm.email}
                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>権限</FormLabel>
              <Select
                value={updateForm.role_id}
                onChange={(e) => setUpdateForm({ ...updateForm, role_id: parseInt(e.target.value) })}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name === 'admin' ? '管理者' : '一般'}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>タイムゾーン</FormLabel>
              <Input
                value={updateForm.timezone}
                onChange={(e) => setUpdateForm({ ...updateForm, timezone: e.target.value })}
              />
            </FormControl>
            <FormControl mb={6}>
              <FormLabel>言語</FormLabel>
              <Input
                value={updateForm.language}
                onChange={(e) => setUpdateForm({ ...updateForm, language: e.target.value })}
              />
            </FormControl>
            <HStack justify="flex-end">
              <Button onClick={onUpdateClose}>キャンセル</Button>
              <Button colorScheme="blue" onClick={handleUpdateUser}>
                更新
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement; 