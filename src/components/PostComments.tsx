import { useEffect, useState } from "react";
import api from "../utils/axios";
// import CustomDrodown from "./shared/CustomDrodown";

type Props = {
  postId: string;
  setPostId: React.Dispatch<React.SetStateAction<string>>;
  setShowPost: React.Dispatch<React.SetStateAction<boolean>>;
  setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
  setContentTitle: React.Dispatch<React.SetStateAction<string>>;
};

const PostComments = ({ postId, setShowComments, setContentTitle }: Props) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // FETCHING SINGLE POST ================
  const fetchPostComments = async () => {
    setIsLoading(true);
    let res = await api.get(`/posts/${postId}/comments`);

    if (res?.status === 200) {
      setComments(res?.data);
    }
    setIsLoading(false);
  };

  // USEEFFECT ON FIRST RENDER ===================
  useEffect(() => {
    fetchPostComments();
  }, []);

  return (
    <>
      {comments ? (
        <section className="custom__contianer">
          <button
            className="mb-4"
            onClick={() => {
              setShowComments(false);
              setContentTitle("Post");
            }}
          >
            Go Back
          </button>
          <div className="bg-white p-10 grid gap-y-4 rounded-lg shadow-2xl">
            {isLoading ? (
              <div>Loading ............</div>
            ) : (
              <div className="grid gap-y-5">
                {comments?.length ? (
                  comments.map(
                    (
                      el: { name: string; email: string; body: string },
                      index
                    ) => {
                      console.log(el, "el");
                      return (
                        <div className="mb-4 grid gap-y-2">
                          <p className="text-black font-semibold">
                            {index + 1}.{`  `}
                            {el.name}
                          </p>
                          <p className="text-slate-500 text-xs">{el.email}</p>
                          <p>{el.body}</p>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div>No comments to show</div>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <p>No Post to show</p>
      )}
    </>
  );
};

export default PostComments;
