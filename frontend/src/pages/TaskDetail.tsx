import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  useToast,
  VStack,
  HStack,
  Badge,
  Checkbox,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';
import { Task, Subtask, Comment, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const commentValidationSchema = Yup.object({
  content: Yup.string().required('Required'),
});

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: task } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: () => client.get(`/tasks/${taskId}`).then((res) => res.data),
  });

  const { data: subtasks } = useQuery<Subtask[]>({
    queryKey: ['subtasks', taskId],
    queryFn: () => client.get(`/tasks/${taskId}/subtasks`).then((res) => res.data),
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: () => client.get(`/tasks/${taskId}/comments`).then((res) => res.data),
  });

  const updateTask = useMutation({
    mutationFn: (updatedTask: Partial<Task>) =>
      client.patch(`/tasks/${taskId}`, updatedTask).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast({
        title: 'Task updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const toggleSubtask = useMutation({
    mutationFn: (subtask: Subtask) =>
      client
        .patch(`/tasks/${taskId}/subtasks/${subtask.id}`, {
          is_complete: !subtask.is_complete,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });

  const addComment = useMutation({
    mutationFn: (content: string) =>
      client
        .post(`/tasks/${taskId}/comments`, {
          content,
          user_id: user?.id,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      commentFormik.resetForm();
    },
  });

  const commentFormik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema: commentValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await addComment.mutateAsync(values.content);
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

  const deleteTaskMutation = useMutation<string, unknown, string>({
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
      navigate('/tasks');
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

  if (!task) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box p={6} mt={8}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg">{task.title}</Heading>
          <Text mt={2} color="gray.600">
            {task.description}
          </Text>
          <HStack spacing={2} mt={4}>
            <Badge colorScheme={getPriorityColor(task.priority)}>{task.priority}</Badge>
            <Badge colorScheme={getStatusColor(task.status)}>{task.status}</Badge>
          </HStack>
          <Text mt={2} fontSize="sm" color="gray.500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Text>
        </Box>
        <Button colorScheme="red" onClick={() => deleteTaskMutation.mutate(task.id)} isLoading={deleteTaskMutation.isPending}>
          削除
        </Button>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={4}>
          Status
        </Heading>
        <Select
          value={task.status}
          onChange={(e) => updateTask.mutate({ status: e.target.value })}
        >
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Canceled">Canceled</option>
        </Select>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={4}>
          Subtasks
        </Heading>
        <VStack align="stretch" spacing={2}>
          {subtasks?.map((subtask) => (
            <HStack key={subtask.id}>
              <Checkbox
                isChecked={subtask.is_complete}
                onChange={() => toggleSubtask.mutate(subtask)}
              >
                {subtask.title}
              </Checkbox>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={4}>
          Comments
        </Heading>
        <VStack align="stretch" spacing={4}>
          <form onSubmit={commentFormik.handleSubmit}>
            <VStack align="stretch" spacing={2}>
              <Textarea
                placeholder="Add a comment..."
                {...commentFormik.getFieldProps('content')}
              />
              {commentFormik.touched.content && commentFormik.errors.content && (
                <Text color="red.500" fontSize="sm">
                  {commentFormik.errors.content}
                </Text>
              )}
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={commentFormik.isSubmitting}
                alignSelf="flex-end"
              >
                Add Comment
              </Button>
            </VStack>
          </form>

          {comments?.map((comment) => (
            <Box key={comment.id} p={4} borderWidth={1} borderRadius="md">
              <Text fontSize="sm" color="gray.500" mb={2}>
                {new Date(comment.created_at).toLocaleString()}
              </Text>
              <Text>{comment.content}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default TaskDetail; 