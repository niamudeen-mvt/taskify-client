import React, { SetStateAction, useRef } from "react";
import { postStories } from "../../services/api/user";
import { sendNotification } from "../../utils/notifications";
import { Link } from "react-router-dom";
import { FILE_VALIDATION } from "../../utils/constants";
import { useTheme } from "../../context/themeContext";

interface IProps {
  story: {
    message: string;
    image: string;
  };
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  fetchStories: () => Promise<void>;
  setStory: React.Dispatch<any>;
}

const PostStory = ({ story, setShowModal, setStory, fetchStories }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isThemeLight } = useTheme();
  // uploading image ======================
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target.files) {
      const file = event?.target.files[0];

      if (!FILE_VALIDATION.ALLOWED_IMAGES.includes(file.type)) {
        sendNotification(
          "warning",
          `This format ${file.type} is not supported.`
        );

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
        sendNotification("warning", `Allowed file size 200KB`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else if (
        FILE_VALIDATION.ALLOWED_IMAGES.includes(file.type) &&
        file.size < FILE_VALIDATION.MAX_FILE_SIZE
      ) {
        setStory({
          ...story,
          image: file,
        });
      }
    }
  };

  // posting story =================
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (story?.message) {
      const formData = new FormData();
      if (story.image) {
        formData.append("image", story.image);
      }
      formData.append("message", story.message);
      let res = await postStories(formData);
      if (res.status === 200) {
        fetchStories();
        setShowModal(false);
        sendNotification("success", res.data.message);
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
  };
  return (
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
          If your upload image is larger than 200KB allowed, reduce the size of
          the image if you want to reduce the size of the image click this link.
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
        Submit
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
  );
};

export default PostStory;