import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import ProductDetail from "@/pages/ProductDetail";
import SellerDashboard from "@/pages/SellerDashboard";
import AddProduct from "@/pages/AddProduct";
import Messages from "@/pages/Messages";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <main className="flex-grow">
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
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
