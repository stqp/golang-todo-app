import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Project, Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => client.get('/projects').then((res) => res.data),
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => client.get('/tasks').then((res) => res.data),
  });

  const getTaskStats = () => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0 };

    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === 'Done').length,
      inProgress: tasks.filter((task) => task.status === 'InProgress').length,
    };
  };

  const taskStats = getTaskStats();

  return (
    <Box p={6} mt={8}>
      <Box mb={8}>
        <Heading size="lg">Welcome back, {user?.name}!</Heading>
        <Text mt={2} color="gray.600">
          Here's an overview of your tasks and projects.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box p={6} bg={bgColor} borderWidth={1} borderRadius="lg" borderColor={borderColor}>
          <Stat>
            <StatLabel>Total Projects</StatLabel>
            <StatNumber>{projects?.length || 0}</StatNumber>
            <StatHelpText>Active projects</StatHelpText>
          </Stat>
        </Box>

        <Box p={6} bg={bgColor} borderWidth={1} borderRadius="lg" borderColor={borderColor}>
          <Stat>
            <StatLabel>Total Tasks</StatLabel>
            <StatNumber>{taskStats.total}</StatNumber>
            <StatHelpText>Across all projects</StatHelpText>
          </Stat>
        </Box>

        <Box p={6} bg={bgColor} borderWidth={1} borderRadius="lg" borderColor={borderColor}>
          <Stat>
            <StatLabel>Completed Tasks</StatLabel>
            <StatNumber>{taskStats.completed}</StatNumber>
            <StatHelpText>{taskStats.inProgress} in progress</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard; 