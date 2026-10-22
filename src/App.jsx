import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteLayout from "./components/SiteLayout";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AddressBookPage from "./pages/AddressBookPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminCouponsPage from "./pages/AdminCouponsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import CancelOrderPage from "./pages/CancelOrderPage";
import CartPage from "./pages/CartPage";
import CategoryPage from "./pages/CategoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import EditProfilePage from "./pages/EditProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import PaymentPage from "./pages/PaymentPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductsPage from "./pages/ProductsPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import RegisterPage from "./pages/RegisterPage";
import ReturnRefundPage from "./pages/ReturnRefundPage";
import ReviewsPage from "./pages/ReviewsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import UserProfilePage from "./pages/UserProfilePage";
import WishlistPage from "./pages/WishlistPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:productId" element={<ProductDetailsPage />} />
              <Route path="search" element={<SearchResultsPage />} />
              <Route path="category/:categoryId" element={<CategoryPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="orders/:orderId/track" element={<TrackOrderPage />} />
              <Route path="orders/:orderId/cancel" element={<CancelOrderPage />} />
              <Route path="orders/:orderId/return" element={<ReturnRefundPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="recently-viewed" element={<RecentlyViewedPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="account" element={<AccountPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="profile/addresses" element={<AddressBookPage />} />
                <Route path="profile/payment-methods" element={<PaymentMethodsPage />} />
                <Route path="profile/reviews" element={<ReviewsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              <Route path="help" element={<HelpSupportPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/products" element={<AdminProductsPage />} />
                <Route path="admin/orders" element={<AdminOrdersPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/categories" element={<AdminCategoriesPage />} />
                <Route path="admin/inventory" element={<AdminInventoryPage />} />
                <Route path="admin/coupons" element={<AdminCouponsPage />} />
                <Route path="admin/reviews" element={<AdminReviewsPage />} />
                <Route path="admin/reports" element={<AdminReportsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
