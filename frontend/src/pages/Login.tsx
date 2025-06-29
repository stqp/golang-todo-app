import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        navigate('/');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxW="container.sm" py={12} p={6} mt={8}>
      <Box mt={8}
        p={8}
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Stack spacing={4}>
          <Heading size="lg" textAlign="center">
            Welcome Back
          </Heading>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...formik.getFieldProps('email')}
                  isInvalid={formik.touched.email && formik.errors.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {formik.errors.email}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...formik.getFieldProps('password')}
                  isInvalid={formik.touched.password && formik.errors.password}
                />
                {formik.touched.password && formik.errors.password && (
                  <Text color="red.500" fontSize="sm">
                    {formik.errors.password}
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={formik.isSubmitting}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link to="/register">
              <Text as="span" color="blue.500">
                Sign up
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login; 