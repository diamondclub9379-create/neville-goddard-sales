import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UrgencyBanner } from "./components/UrgencyBanner";
import LineChatWidget from "./components/LineChatWidget";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBundles from "./pages/admin/AdminBundles";
import AdminOrderSummary from "./pages/admin/AdminOrderSummary";
import AdminProducts from "./pages/AdminProducts";
import AdminBlog from "./pages/AdminBlog";
import ProductDetail from "./pages/ProductDetail";
import BlogListing from "./pages/BlogListing";
import BlogArticleDetail from "./pages/BlogArticleDetail";
import Orders from "./pages/Orders";
import IKnowMyFather from "./pages/IKnowMyFather";
import HowToAttractLove from "./pages/HowToAttractLove";
import Promotion from "./pages/Promotion";

function AdminRouter() {
  return (
    <AdminLayout>
      <WouterRouter base="/admin">
        <Switch>
          <Route path="/" component={AdminOverview} />
          <Route path="/orders/:id" component={AdminOrderDetail} />
          <Route path="/orders" component={AdminOrders} />
          <Route path="/shipping" component={AdminShipping} />
          <Route path="/analytics" component={AdminAnalytics} />
          <Route path="/bundles" component={AdminBundles} />
          <Route path="/order-summary" component={AdminOrderSummary} />
          <Route path="/products" component={AdminProducts} />
          <Route path="/blog" component={AdminBlog} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/promotion" component={Promotion} />
      <Route path="/blog" component={BlogListing} />
      <Route path="/blog/:slug" component={BlogArticleDetail} />
      <Route path="/orders" component={Orders} />
      <Route path="/books/i-know-my-father">{() => <IKnowMyFather />}</Route>
      <Route path="/books/how-to-attract-love">{() => <HowToAttractLove />}</Route>
      <Route path="/books/:slug" component={ProductDetail} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/:rest*" component={AdminRouter} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Show UrgencyBanner only on public (non-admin) pages */
function ConditionalUrgencyBanner() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <UrgencyBanner />;
}

/** Show LINE chat widget only on public (non-admin) pages */
function ConditionalLineChatWidget() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <LineChatWidget />;
}

/** Show Back to Top button only on public (non-admin) pages */
function ConditionalBackToTop() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <BackToTop />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <ConditionalUrgencyBanner />
          <Router />
          <ConditionalLineChatWidget />
          <ConditionalBackToTop />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
