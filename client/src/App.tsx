import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SellerDashboard = lazy(() => import("@/pages/SellerDashboard"));
const Messages = lazy(() => import("@/pages/Messages"));
const Browse = lazy(() => import("@/pages/Browse"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/not-found"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <main className="flex-grow">
            <Suspense fallback={<Loading />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/browse" component={Browse} />
                <Route path="/add-product" component={AddProduct} />
                <Route path="/product/:id" component={ProductDetail} />
                <Route path="/dashboard" component={SellerDashboard} />
                <Route path="/messages" component={Messages} />
                <Route path="/messages/:conversationId" component={Messages} />
                <Route path="/about" component={About} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
