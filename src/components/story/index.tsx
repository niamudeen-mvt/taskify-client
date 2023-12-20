import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteStory, getStories, postStories } from "../../services/api/user";
import { FaPlus } from "react-icons/fa";
import { RootState } from "../../store";
import { startLoading, stopLoading } from "../../store/features/loadingSlice";
import CustomModal from "../layout/CustomModal";
import ThemeContainer from "../layout/ThemeContainer";
import { sendNotification } from "../../utils/notifications";
import CustomLoader from "../Loader";
import { useTheme } from "../../context/themeContext";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import { RiChatHistoryFill } from "react-icons/ri";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const ALLOWED_IMAGES = ["image/jpg", "image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 200 * 1024;

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStory, setShowStory] = useState({
    type: "",
    show: false,
    link: "",
    message: "",
  });
  const [story, setStory] = useState<any>({
    message: "",
    image: "",
  });

  const { isThemeLight } = useTheme();
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const { authUser } = useAuth();

  const personalStory: any = stories?.find(
    (story: { userId: string }) => story.userId === authUser._id
  );

  const socialStories: any = stories?.filter(
    (story: { userId: string }) => story.userId !== authUser._id
  );

  // fetching stories
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    dispatch(startLoading());
    let res = await getStories();
    if (res.status === 200) {
      setStories(res?.data?.stories);
    }
    dispatch(stopLoading());
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target.files) {
      const file = event?.target.files[0];
      console.log(file);

      if (!ALLOWED_IMAGES.includes(file.type)) {
        console.log("111111111");

        sendNotification(
          "warning",
          `This format ${file.type} is not supported.`
        );

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
      if (file.size > MAX_FILE_SIZE) {
        console.log("2222222");

        sendNotification("warning", `Allowed file size 200KB`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else if (
        ALLOWED_IMAGES.includes(file.type) &&
        file.size < MAX_FILE_SIZE
      ) {
        console.log("33333333");
        setStory({
          ...story,
          image: file,
        });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(startLoading());
    if (story.message) {
      const formData = new FormData();
      if (story.image) {
        formData.append("image", story.image);
      }
      formData.append("message", story.message);
      let res = await postStories(formData);
      if (res.status === 200) {
        fetchStories();
        setShowModal(false);
        sendNotification("warning", res.data.message);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else {
        sendNotification("error", res?.response?.data?.message);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } else {
      setShowModal(true);
      sendNotification("warning", "Message field is required");
    }
    dispatch(stopLoading());
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const handleDelteStory = async () => {
    dispatch(startLoading());
    let res = await deleteStory();
    if (res.status === 200) {
      fetchStories();
      setShowStory({
        type: "",
        show: false,
        link: "",
        message: "",
      });
      sendNotification("success", res.data.message);
    } else {
      setShowStory({
        type: "",
        show: false,
        link: "",
        message: "",
      });
      sendNotification("error", res?.response?.data?.message);
    }
    dispatch(stopLoading());
  };

  return (
    <>
      <section className="my-32">
        <div className={`grid grid-cols-2 sm:grid-cols-12`}>
          <div className={`sm:col-span-2 `}>
            {personalStory ? (
              <>
                <div className="h-44 flex__center relative cursor-pointer">
                  {personalStory?.image ? (
                    <img
                      src={personalStory?.image}
                      alt="story"
                      className="h-28 w-28 rounded-full absolute top-1/4 left-1/4 hover:scale-110 transition-all duration-300 cursor-pointer"
                      onClick={() =>
                        setShowStory({
                          type: "PERSONAL",
                          show: true,
                          link: personalStory.image,
                          message: personalStory.message,
                        })
                      }
                    />
                  ) : (
                    // if no story image added by user showing default image
                    <div className="h-28 w-28 rounded-full absolute top-1/4 left-1/4 hover:scale-110 transition-all duration-300 bg-white flex__center">
                      <RiChatHistoryFill
                        size={25}
                        onClick={() =>
                          setShowStory({
                            type: "PERSONAL",
                            show: true,
                            link: "",
                            message: personalStory.message,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                <p className="text-center text-sm">Your Story</p>
              </>
            ) : (
              <>
                <div key={story?._id} className="h-44 flex__center relative">
                  <div className="cursor-pointer h-28 w-28 rounded-full absolute top-1/4 left-1/4 bg-white flex__center">
                    <FaPlus
                      size={25}
                      onClick={() => setShowModal(true)}
                      className="hover:scale-110 transition-all duration-300"
                    />
                  </div>
                </div>
                <p className="text-center text-sm">Add Story</p>
              </>
            )}
          </div>
          <div className={`sm:col-span-2 `}>
            <Slider {...settings}>
              {socialStories?.map(
                (story: { _id: string; image: string; message: string }) => {
                  return (
                    <div
                      key={story?._id}
                      className="cursor-pointer h-48 relative"
                      onClick={() =>
                        setShowStory({
                          type: "SOCIAL",
                          show: true,
                          link: story.image,
                          message: story.message,
                        })
                      }
                    >
                      {story.image ? (
                        <img
                          src={story.image}
                          alt="story"
                          className="h-28 w-28 rounded-full absolute top-1/4 left-1/4 hover:scale-110 transition-all duration-300"
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full absolute top-1/4 left-1/4 hover:scale-110 transition-all duration-300 bg-white flex__center">
                          <RiChatHistoryFill
                            size={25}
                            onClick={() =>
                              setShowStory({
                                type: "SOCIAL",
                                show: true,
                                link: "",
                                message: personalStory.message,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </Slider>
          </div>
        </div>
      </section>

      {/* story posting form */}
      {showModal ? (
        <CustomModal showModal={showModal}>
          <ThemeContainer themeCenter={true}>
            {isLoading ? <CustomLoader /> : null}
            <>
              <form
                onSubmit={handleSubmit}
                className="text-white border p-10 rounded-md relative "
              >
                <div className="form-control mb-6 flex flex-col">
                  <label className="mb-4">Message</label>
                  <input
                    autoComplete="off"
                    spellCheck={false}
                    className={`border-b mb-10 outline-none bg-transparent text-white ${
                      isThemeLight ? "border-black" : "border-white"
                    }`}
                    onChange={(event) =>
                      setStory({ ...story, message: event?.target.value })
                    }
                  />
                  <input
                    type="file"
                    className="border py-2 rounded-md px-2"
                    onChange={handleChange}
                    ref={inputRef}
                  />
                </div>

                {/* file upload validation message */}
                <div className="mb-8">
                  <span className="text-sm">
                    Allowed JPG, JPEG, WEBP, PNG. Max file size 200KB.
                  </span>
                  <span className="text-sm">
                    If your upload image is larger than 200KB allowed, reduce
                    the size of the image if you want to reduce the size of the
                    image click this link.
                  </span>
                  {`  `}
                  <a
                    href="https://picresize.com/"
                    className="text-sm pointer-events-auto font-semibold"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Click Here To Convert
                  </a>
                </div>

                <button
                  type="submit"
                  className="mb-6 bg-white text-black px-7 py-2 rounded-lg border w-full text-sm"
                >
                  {isLoading ? "Loading..." : "Submit"}
                </button>
                <Link to="/">
                  <button
                    className="bg-slate-800 text-white px-10 py-2 my-5 rounded-lg text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Go back
                  </button>
                </Link>
              </form>
            </>
          </ThemeContainer>
        </CustomModal>
      ) : null}

      {/* full preview story */}

      {showStory.show ? (
        <div className="fixed top-0 left-0 h-full w-full bg-black/90 z-50 flex__center">
          <IoClose
            size={22}
            className="text-white fixed top-10 right-10 cursor-pointer"
            onClick={() =>
              setShowStory({
                type: "",
                show: false,
                link: "",
                message: "",
              })
            }
          />
          <div className="w-[500px] flex justify-center flex-col gap-y-10">
            <p className="text-white ">{showStory.message}</p>
            {showStory.link ? (
              <div className="h-[400px]">
                <img
                  src={showStory.link}
                  alt="story"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}

            <div className="text-center">
              {showStory.type === "PERSONAL" ? (
                <button
                  className="bg-white text-black text-sm px-5 py-2 rounded-lg w-32"
                  onClick={() => handleDelteStory()}
                >
                  {isLoading ? "Loading..." : "Delete Story"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Stories;
