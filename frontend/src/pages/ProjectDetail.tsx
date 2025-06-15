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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
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
    <Box>
      <Box mb={6}>
        <Heading size="lg">{project.name}</Heading>
        <Text mt={2} color="gray.600">
          {project.description}
        </Text>
        <Text mt={2} fontSize="sm" color="gray.500">
          {new Date(project.start_date).toLocaleDateString()} -{' '}
          {new Date(project.end_date).toLocaleDateString()}
        </Text>
      </Box>

      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">Tasks</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Create Task
        </Button>
      </Box>

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {tasks?.map((task) => (
          <Link key={task.id} to={`/tasks/${task.id}`}>
            <Box
              p={6}
              borderWidth={1}
              borderRadius="lg"
              _hover={{ shadow: 'md', borderColor: 'blue.500' }}
            >
              <Heading size="sm" mb={2}>
                {task.title}
              </Heading>
              <Text noOfLines={2} mb={4} color="gray.600">
                {task.description}
              </Text>
              <HStack spacing={2} mb={2}>
                <Badge colorScheme={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge colorScheme={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Text>
            </Box>
          </Link>
        ))}
      </Grid>

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