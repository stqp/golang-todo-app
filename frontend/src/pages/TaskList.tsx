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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

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
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">タスク一覧</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          タスクを作成
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <Box
              key={task.id}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              shadow="sm"
              _hover={{ shadow: 'md' }}
            >
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2} flex={1}>
                  <Heading size="md">{task.title}</Heading>
                  <Text color="gray.600">{task.description}</Text>
                  <HStack spacing={4}>
                    <Text fontSize="sm" color="gray.500">
                      期限: {formatDate(task.due_date)}
                    </Text>
                    <Badge colorScheme={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge colorScheme={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          ))
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">タスクがありません</Text>
          </Box>
        )}
      </VStack>

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