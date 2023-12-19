import GalleryPage from "../views/pages/GalleryPage";
import Homepage from "../views/pages/Homepage";
import LoginPage from "../views/pages/LoginPage";
import SignupPage from "../views/pages/Signup";
import PostsContainer from "../views/pages/posts";
import TaskPage from "../views/pages/tasks";

export const MENU_ITEMS = [
  {
    id: "home",
    path: "/",
    element: <Homepage />,
  },
  {
    id: "signup",
    path: "/signup",
    element: <SignupPage />,
  },
  {
    id: "login",
    path: "/login",
    element: <LoginPage />,
  },
  {
    id: "tasks",
    path: "/tasks",
    type: "protected",
    element: <TaskPage />,
  },
  {
    id: "posts",
    path: "/posts",
    type: "protected",
    element: <PostsContainer />,
  },
  {
    id: "gallery",
    path: "/gallery",
    type: "protected",
    element: <GalleryPage />,
  },
];