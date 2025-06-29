import React from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Text,
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
  Stack,
  useToast,
  Select,
  Badge,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';
import { Project, Task, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const validationSchema = Yup.object({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  due_date: Yup.date().required('Required'),
  priority: Yup.string().required('Required'),
  assignee_id: Yup.string().required('Required'),
});

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: project } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => client.get(`/projects/${projectId}`).then((res) => res.data),
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: () => client.get(`/projects/${projectId}/tasks`).then((res) => res.data),
  });

  const { data: members } = useQuery<User[]>({
    queryKey: ['members', projectId],
    queryFn: () => client.get(`/projects/${projectId}/members`).then((res) => res.data),
  });

  const { data: users } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await client.get('/users');
      return response.data;
    },
  });

  const createTask = useMutation({
    mutationFn: (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      client.post('/tasks', { ...newTask, project_id: projectId }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: 'Task created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (projectId: string) =>
      client.delete(`/projects/${projectId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/projects');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'Medium',
      assignee_id: user?.id || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      await createTask.mutateAsync(values);
      resetForm();
      setSubmitting(false);
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'red';
      case 'Medium':
        return 'yellow';
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
      case 'InProgress':
        return 'yellow';
      case 'Done':
        return 'green';
      case 'Canceled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!project) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box p={6} mt={8}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg">{project.name}</Heading>
          <Text mt={2} color="gray.600">
            {project.description}
          </Text>
          <Text mt={2} fontSize="sm" color="gray.500">
            {new Date(project.start_date).toLocaleDateString()} -{' '}
            {new Date(project.end_date).toLocaleDateString()}
          </Text>
        </Box>
        <Button colorScheme="red" onClick={() => deleteProject.mutate(project.id)} isLoading={deleteProject.isPending}>
          削除
        </Button>
      </Box>

      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">Tasks</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Create Task
        </Button>
      </Box>

      <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto" mb={8}>
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
                      {new Date(task.due_date).toLocaleDateString('ja-JP')}
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input {...formik.getFieldProps('title')} />
                  {formik.touched.title && formik.errors.title && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.title}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea {...formik.getFieldProps('description')} />
                  {formik.touched.description && formik.errors.description && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.description}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input type="date" {...formik.getFieldProps('due_date')} />
                  {formik.touched.due_date && formik.errors.due_date && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.due_date}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select {...formik.getFieldProps('priority')}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Assignee</FormLabel>
                  <Select {...formik.getFieldProps('assignee_id')}>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={formik.isSubmitting}
                  width="full"
                >
                  Create
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProjectDetail; 