import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SubmitHandler, useForm } from "react-hook-form";
import TextError from "../components/shared/TextError";
import ThemeContainer from "../components/layout/ThemeContainer";
import { sendNotification } from "../utils/notifications";
import { setItemsIntoLS } from "../utils/helper";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { loginUser } from "../services/api/auth";
import { RootState } from "../store";
import { TLoginFormValues } from "../utils/types";
import { startLoading, stopLoading } from "../store/features/loadingSlice";
import { _localStorageConfig } from "../config";


const LoginPage = () => {
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginFormValues>();

  const { setIsLoggedIn } = useAuth();
  const { isThemeLight } = useTheme();

  const isLoading = useSelector((state: RootState) => state.loading.isLoading);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<TLoginFormValues> = async (data: TLoginFormValues) => {
    dispatch(startLoading());
    let res = await loginUser(data);

    if (res?.status === 200) {
      sendNotification("success", res.data.message);
      setIsLoggedIn(true);

      setItemsIntoLS(_localStorageConfig.token, res.data.access_token);
      setItemsIntoLS(_localStorageConfig.id, res.data.userId);

      navigate("/");
    } else {
      sendNotification("warning", res?.response?.data?.message);
    }
    dispatch(stopLoading());
  };

  return (
    <ThemeContainer themeCenter={true} isCenter={true}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-[500px] text-white border p-10 rounded-md relative -z-0"
      >
        <h1 className="text-3xl mb-10">Login Form</h1>
        <div className="form-control mb-6 flex flex-col">
          <label>Email</label>
          <input
            type="text"
            {...register("email", {
              required: {
                value: true,
                message: "Email is required.",
              },
              pattern: {
                value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                message: "Email is not valid.",
              },
            })}
            autoComplete="off"
            spellCheck={false}
            className={`border-b mb-4 outline-none bg-transparent text-white ${isThemeLight ? "border-black" : "border-white"
              }`}
          />
          {errors.email && <TextError msg={errors.email.message?.toString()} />}
        </div>
        <div className="form-control mb-6 flex flex-col">
          <label>Password</label>
          <input
            type="password"
            {...register("password", {
              required: {
                value: true,
                message: "Password is required.",
              },
              minLength: {
                value: 3,
                message: "Password should be at-least 3 characters.",
              },
            })}
            autoComplete="off"
            spellCheck={false}
            className={`border-b mb-4 outline-none bg-transparent text-white ${isThemeLight ? "border-black" : "border-white"
              }`}
          />
          {errors.password && <TextError msg={errors.password.message?.toString()} />}
        </div>
        <button
          type="submit"
          className="mb-10 bg-white text-black px-7 py-2 rounded-lg border w-full"
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>

        <p className="text-sm text-center">
          Dont't have an account ?{" "}
          <Link to="/signup">
            <span className={`${isThemeLight ? "text-black" : "text-white"}`}>
              Signup
            </span>
          </Link>
        </p>
      </form>
    </ThemeContainer>
  );
};

export default LoginPage;
