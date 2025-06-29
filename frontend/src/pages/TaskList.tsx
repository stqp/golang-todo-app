import React from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  project_id: string;
  assignee_id: string;
  created_by: string;
}

const TaskList: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // タスク一覧を取得
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await client.get('/tasks');
      return response.data;
    },
  });

  // プロジェクト一覧を取得（タスク作成時に使用）
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await client.get('/projects');
      return response.data;
    },
  });

  // ユーザー一覧を取得
  const { data: users } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await client.get('/users');
      return response.data;
    },
  });

  // タスク作成
  const createTaskMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await client.post('/tasks', values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'タスクを作成しました',
        status: 'success',
        duration: 3000,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'タスクの作成に失敗しました',
        description: error.response?.data?.error || 'エラーが発生しました',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // タスク削除
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await client.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'タスクを削除しました',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'タスクの削除に失敗しました',
        description: error.response?.data?.error || 'エラーが発生しました',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'Medium',
      status: 'Open',
      project_id: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('タイトルは必須です'),
      description: Yup.string(),
      due_date: Yup.date(),
      priority: Yup.string().required('優先度は必須です'),
      status: Yup.string().required('ステータスは必須です'),
      project_id: Yup.string().required('プロジェクトは必須です'),
    }),
    onSubmit: (values) => {
      createTaskMutation.mutate(values);
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'red';
      case 'Medium':
        return 'orange';
      case 'Low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'blue';
      case 'In Progress':
        return 'yellow';
      case 'Completed':
        return 'green';
      case 'Closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Text>読み込み中...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500">エラーが発生しました</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6} mt={8}>
        <Heading size="lg" mt={2}>タスク一覧</Heading>
        <Button colorScheme="blue" onClick={onOpen} mt={2}>
          タスクを作成
        </Button>
      </HStack>

      {/* テーブル表示 */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto">
        <Table variant="simple" width="100%" minWidth="900px" size="md">
          <Thead bg="gray.100">
            <Tr height="56px">
              <Th textAlign="left" width="300px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>タイトル</Th>
              <Th textAlign="left" width="300px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>説明</Th>
              <Th textAlign="left" width="120px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>期限</Th>
              <Th textAlign="left" width="110px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>優先度</Th>
              <Th textAlign="left" width="110px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>ステータス</Th>
              <Th textAlign="left" width="120px" fontSize="md" fontWeight="bold" verticalAlign="middle" py={3}>担当者</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Tr
                  key={task.id}
                  _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  height="56px"
                >
                  <Td textAlign="left" width="300px" fontWeight="semibold" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      {task.title}
                    </Link>
                  </Td>
                  <Td textAlign="left" width="300px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      {task.description}
                    </Link>
                  </Td>
                  <Td textAlign="left" width="120px" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      {formatDate(task.due_date)}
                    </Link>
                  </Td>
                  <Td textAlign="left" width="110px" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      <Badge colorScheme={getPriorityColor(task.priority)} px={2} py={1} borderRadius="md" fontSize="sm">{task.priority}</Badge>
                    </Link>
                  </Td>
                  <Td textAlign="left" width="110px" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      <Badge colorScheme={getStatusColor(task.status)} px={2} py={1} borderRadius="md" fontSize="sm">{task.status}</Badge>
                    </Link>
                  </Td>
                  <Td textAlign="left" width="120px" verticalAlign="middle" py={3}>
                    <Link to={`/tasks/${task.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit', textDecoration: 'none' }}>
                      {users?.find((u) => u.id === task.assignee_id)?.name || '-'}
                    </Link>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr height="56px">
                <Td colSpan={6} textAlign="center" color="gray.500" verticalAlign="middle" py={3}>
                  タスクがありません
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* タスク作成モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>タスクを作成</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formik.handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={formik.touched.title && !!formik.errors.title}>
                  <FormLabel>タイトル</FormLabel>
                  <Input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.title}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>説明</FormLabel>
                  <Textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>期限</FormLabel>
                  <Input
                    type="date"
                    name="due_date"
                    value={formik.values.due_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>

                <FormControl isInvalid={formik.touched.priority && !!formik.errors.priority}>
                  <FormLabel>優先度</FormLabel>
                  <Select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="Low">低</option>
                    <option value="Medium">中</option>
                    <option value="High">高</option>
                  </Select>
                </FormControl>

                <FormControl isInvalid={formik.touched.status && !!formik.errors.status}>
                  <FormLabel>ステータス</FormLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="Open">未着手</option>
                    <option value="In Progress">進行中</option>
                    <option value="Completed">完了</option>
                    <option value="Closed">終了</option>
                  </Select>
                </FormControl>

                <FormControl isInvalid={formik.touched.project_id && !!formik.errors.project_id}>
                  <FormLabel>プロジェクト</FormLabel>
                  <Select
                    name="project_id"
                    value={formik.values.project_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">プロジェクトを選択</option>
                    {projects?.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                  {formik.touched.project_id && formik.errors.project_id && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.project_id}
                    </Text>
                  )}
                </FormControl>

                <HStack spacing={4} w="full">
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={createTaskMutation.isPending}
                    flex={1}
                  >
                    作成
                  </Button>
                  <Button onClick={onClose} flex={1}>
                    キャンセル
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TaskList; 