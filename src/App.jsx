import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import TestPage from './pages/test/TestPage';
import SignUpHeader from './pages/sign-up/SignUpHeader';
import GuardianSignUpPage from './pages/sign-up/GuardianSignUpPage';
import PatientSignUpPage from './pages/sign-up/PatientSignUpPage';
import SignInPage from './pages/sign-in/SignInPage';
import ChangeBirthdayPage from './pages/user-account/ChangeBirthdayPage';
import ChangeEmailPage from './pages/user-account/ChangeEmailPage';
import PasswordChangePage from './pages/user-account/PasswordChangePage';
import AuthHomePage from './pages/test/AuthHomePage';
import MedicineListPage from './pages/test/MedicineListPage';
import MainPage from './pages/home/MainPage';
import ChangeProfilePage from './pages/user-account/ChangeProfilePage';
import AddMemberPage from './pages/user-account/AddMemberPage';
import AccountPage from './pages/user-account/AccountPage';
import MemberEditPage from './pages/user-account/MemberEditPage';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VoiceMessagePage from './pages/voice-message/VoiceMessagePage';
import DetailVoiceMessagePage from './pages/voice-message/DetailVoiceMessagePage';
import SchedulePage from './pages/schedule/SchedulePage';
import MedicineEditPage from './pages/schedule/MedicineEditPage';
import MedicineAddPage from './pages/schedule/MedicineAddPage';
import HospitalEditPage from './pages/schedule/HospitalEditPage';
import HospitalAddPage from './pages/schedule/HospitalAddPage';
import NotificationPage from './pages/notification/NotificationPage';
import SearchPage from './pages/community/SearchPage';
import CommunityPage from './pages/community/CommunityPage';
import SearchResultPage from './pages/community/SearchResultPage';
import PostPage from './pages/community/PostPage';
import NewPostPage from './pages/community/NewPostPage';

const router = createBrowserRouter([
  { path: '/', element: <SignInPage /> },
  {
    element: <SignUpHeader />,
    children: [
      { path: '/sign-up', element: <PatientSignUpPage /> },
      { path: '/sign-up/patient', element: <PatientSignUpPage /> },
      { path: '/sign-up/guardian', element: <GuardianSignUpPage /> },
    ],
  },
  {
    path: '/home',
    children: [
      { path: '', element: <MainPage /> },
      { path: 'notifications', element: <NotificationPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  {
    path: '/schedule',
    children: [
      { path: ':patientId', element: <SchedulePage /> },
      { path: 'medicine-edit/:patientId/:medicineId', element: <MedicineEditPage /> },
      { path: 'medicine-add/:patientId/', element: <MedicineAddPage /> },
      { path: 'hospital-edit/:patientId/:hospitalId', element: <HospitalEditPage /> },
      { path: 'hospital-add/:patientId/', element: <HospitalAddPage /> },
    ],
  },
  {
    path: '/voice-message',
    children: [
      { path: '', element: <VoiceMessagePage /> },
      { path: 'detail', element: <DetailVoiceMessagePage /> },
    ],
  },
  {
    path: '/account',
    children: [
      { path: 'edit-profile', element: <ChangeProfilePage /> },
      { path: 'edit-birthday', element: <ChangeBirthdayPage /> },
      { path: 'edit-email', element: <ChangeEmailPage /> },
      { path: 'edit-password', element: <PasswordChangePage /> },
      // { path: 'add-member', element: <AddMemberPage /> },
      // { path: 'edit-member', element: <MemberEditPage /> },
    ],
  },
  {
    path: '/community',
    children: [
      { path: 'search', element: <SearchPage /> },
      { path: 'search-results', element: <SearchResultPage /> },
      { path: 'post', element: <PostPage /> },
      { path: 'new-post', element: <NewPostPage /> },
      { path: 'edit-post', element: <></> },
    ],
  },
  {
    path: '/test',
    element: <TestPage />,
    children: [
      { path: 'auth', element: <AuthHomePage /> },
      { path: 'ml', element: <MedicineListPage /> },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </>
  );
}

export default App;
