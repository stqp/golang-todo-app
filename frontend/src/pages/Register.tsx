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
  Select,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import client from '@/api/client';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  timezone: Yup.string().required('Required'),
  language: Yup.string().required('Required'),
});

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language.split('-')[0],
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await client.post('/users/register', values);
        toast({
          title: 'Account created',
          description: 'You can now log in with your credentials',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create account',
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
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" mt={8}>
        <Stack spacing={4}>
          <Heading size="lg" textAlign="center">
            Create Account
          </Heading>
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
                <FormLabel>Email</FormLabel>
                <Input type="email" {...formik.getFieldProps('email')} />
                {formik.touched.email && formik.errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {formik.errors.email}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" {...formik.getFieldProps('password')} />
                {formik.touched.password && formik.errors.password && (
                  <Text color="red.500" fontSize="sm">
                    {formik.errors.password}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Select {...formik.getFieldProps('timezone')}>
                  {Intl.supportedValuesOf('timeZone').map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select {...formik.getFieldProps('language')}>
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={formik.isSubmitting}
              >
                Sign up
              </Button>
            </Stack>
          </form>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link to="/login">
              <Text as="span" color="blue.500">
                Sign in
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register; 