import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';
import { Project } from '@/types';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  start_date: Yup.date().required('Required'),
  end_date: Yup.date().required('Required').min(Yup.ref('start_date'), 'End date must be after start date'),
});

const ProjectList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => client.get('/projects').then((res) => res.data),
  });

  const createProject = useMutation({
    mutationFn: (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) =>
      client.post('/projects', newProject).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create project',
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
      name: '',
      description: '',
      start_date: '',
      end_date: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      await createProject.mutateAsync(values);
      resetForm();
      setSubmitting(false);
    },
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box p={6} mt={8}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Projects</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Create Project
        </Button>
      </Box>

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {projects?.map((project) => (
          <Box
            key={project.id}
            p={6}
            borderWidth={1}
            borderRadius="lg"
            _hover={{ shadow: 'md', borderColor: 'blue.500' }}
            position="relative"
          >
            <Link to={`/projects/${project.id}`}>
              <Heading size="md" mb={2}>
                {project.name}
              </Heading>
              <Text noOfLines={2} mb={4} color="gray.600">
                {project.description}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(project.start_date).toLocaleDateString()} -{' '}
                {new Date(project.end_date).toLocaleDateString()}
              </Text>
            </Link>
          </Box>
        ))}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input {...formik.getFieldProps('name')} />
                  {formik.touched.name && formik.errors.name && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.name}
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
                  <FormLabel>Start Date</FormLabel>
                  <Input type="date" {...formik.getFieldProps('start_date')} />
                  {formik.touched.start_date && formik.errors.start_date && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.start_date}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input type="date" {...formik.getFieldProps('end_date')} />
                  {formik.touched.end_date && formik.errors.end_date && (
                    <Text color="red.500" fontSize="sm">
                      {formik.errors.end_date}
                    </Text>
                  )}
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

export default ProjectList; 