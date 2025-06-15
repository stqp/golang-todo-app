import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ProjectList from '@/pages/ProjectList';
import ProjectDetail from '@/pages/ProjectDetail';
import TaskDetail from '@/pages/TaskDetail';
import Layout from '@/components/Layout';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ChakraProvider>
      <CSSReset />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ProjectList />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ProjectDetail />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TaskDetail />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App; 